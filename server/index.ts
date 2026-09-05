import express from "express";
import { createServer } from "http";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { AI_SYSTEM_PROMPT, followUpsFor, groundPrompt } from "../shared/aiCore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";
const staticPath = path.resolve(__dirname, "public");
const waitlistFile = path.resolve(process.env.WORKFLO_WAITLIST_FILE || path.resolve(__dirname, "..", "data", "waitlist.json"));
const contactFile = path.resolve(process.env.CORTEX_CONTACT_FILE || path.resolve(__dirname, "..", "data", "contact-requests.json"));

// ---------------------------------------------------------------------------
// Admin authentication: server-side sessions backed by an httpOnly cookie.
// The admin credential is never exposed to or stored by the browser beyond
// the login request itself; the client only ever holds an opaque session
// cookie that the server can invalidate at any time.
// ---------------------------------------------------------------------------
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, refreshed on activity
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 minute sliding attempt window
const LOGIN_MAX_ATTEMPTS = 8; // attempts allowed within the window before lockout
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // lockout duration once exceeded

type AdminSession = { expiresAt: number };
type LoginAttemptState = { count: number; firstAttemptAt: number; lockedUntil: number };

const adminSessions = new Map<string, AdminSession>();
const loginAttempts = new Map<string, LoginAttemptState>();

function pruneExpiredAuthState() {
  const now = Date.now();
  adminSessions.forEach((session, id) => {
    if (session.expiresAt <= now) adminSessions.delete(id);
  });
  loginAttempts.forEach((state, ip) => {
    if (state.lockedUntil <= now && state.firstAttemptAt + LOGIN_WINDOW_MS <= now) loginAttempts.delete(ip);
  });
}
const pruneInterval = setInterval(pruneExpiredAuthState, 15 * 60 * 1000);
pruneInterval.unref();

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

function setAdminSessionCookie(res: express.Response, sessionId: string, maxAgeMs: number) {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearAdminSessionCookie(res: express.Response) {
  const attributes = [`${ADMIN_SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Strict", "Max-Age=0"];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function createAdminSession(): string {
  const sessionId = randomBytes(32).toString("hex");
  adminSessions.set(sessionId, { expiresAt: Date.now() + SESSION_TTL_MS });
  return sessionId;
}

function readAdminSessionId(req: express.Request): string | undefined {
  const cookies = parseCookies(req.get("cookie"));
  return cookies[ADMIN_SESSION_COOKIE];
}

function isAdminSessionValid(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const session = adminSessions.get(sessionId);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionId);
    return false;
  }
  return true;
}

function touchAdminSession(sessionId: string) {
  const session = adminSessions.get(sessionId);
  if (session) session.expiresAt = Date.now() + SESSION_TTL_MS;
}

function destroyAdminSession(sessionId: string | undefined) {
  if (sessionId) adminSessions.delete(sessionId);
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

function getClientKey(req: express.Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function checkLoginRateLimit(clientKey: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const state = loginAttempts.get(clientKey);
  if (!state) return { allowed: true };
  if (state.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  if (now - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(clientKey);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(clientKey: string) {
  const now = Date.now();
  const state = loginAttempts.get(clientKey);
  if (!state || now - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(clientKey, { count: 1, firstAttemptAt: now, lockedUntil: 0 });
    return;
  }
  state.count += 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) {
    state.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
}

function recordSuccessfulLogin(clientKey: string) {
  loginAttempts.delete(clientKey);
}

type WaitlistSignup = {
  id: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
};

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  product: string;
  message: string;
  submittedAt: string;
};

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] uncaughtException:", err);
});

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "100kb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

function cacheTuner(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const base = path.basename(req.path);
  let desired: string | undefined;
  if (base === "index.html") {
    desired = "no-cache";
  } else if (/[-_.][A-Za-z0-9_-]{6,}\./.test(base)) {
    desired = "public, max-age=31536000, immutable";
  }
  if (!desired) return next();
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = ((name: string, value: number | string | string[]) => {
    if (typeof name === "string" && name.toLowerCase() === "cache-control") {
      return originalSetHeader("Cache-Control", desired!);
    }
    return originalSetHeader(name, value as never);
  }) as typeof res.setHeader;
  next();
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function loadWaitlist() {
  try {
    const contents = await readFile(waitlistFile, "utf8");
    const entries = JSON.parse(contents);
    return Array.isArray(entries) ? entries as WaitlistSignup[] : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveWaitlist(entries: WaitlistSignup[]) {
  await mkdir(path.dirname(waitlistFile), { recursive: true });
  await writeFile(waitlistFile, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function loadContactRequests() {
  try {
    const contents = await readFile(contactFile, "utf8");
    const entries = JSON.parse(contents);
    return Array.isArray(entries) ? entries as ContactRequest[] : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveContactRequests(entries: ContactRequest[]) {
  await mkdir(path.dirname(contactFile), { recursive: true });
  await writeFile(contactFile, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function sendWaitlistNotification(signup: WaitlistSignup) {
  const emailMode = (process.env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
  const subject = `New Workflo early-access request from ${signup.name}`;
  const text = [
    "New Workflo early-access request",
    `Name: ${signup.name}`,
    `Email: ${signup.email}`,
    `Company: ${signup.company || "Not provided"}`,
    `Submitted: ${signup.submittedAt}`,
  ].join("\n");
  const html = `<h2>New Workflo early-access request</h2><p><strong>Name:</strong> ${escapeHtml(signup.name)}</p><p><strong>Email:</strong> ${escapeHtml(signup.email)}</p><p><strong>Company:</strong> ${escapeHtml(signup.company || "Not provided")}</p><p><strong>Submitted:</strong> ${escapeHtml(signup.submittedAt)}</p>`;

  if (emailMode === "mock") {
    console.info("[waitlist] Mock email notification:", { from: process.env.WORKFLO_EMAIL_FROM || "mock@workflo.local", to: process.env.WORKFLO_WAITLIST_TO_EMAIL || "admin@workflo.local", subject, text });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const notificationEmail = process.env.WORKFLO_WAITLIST_TO_EMAIL?.trim();
  const fromEmail = process.env.WORKFLO_EMAIL_FROM?.trim();
  if (!resendApiKey || !notificationEmail || !fromEmail) {
    console.error("[waitlist] Missing RESEND_API_KEY, WORKFLO_WAITLIST_TO_EMAIL, or WORKFLO_EMAIL_FROM");
    throw new Error("email_configuration_missing");
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notificationEmail],
      reply_to: signup.email,
      subject,
      text,
      html,
    }),
  });

  if (!emailResponse.ok) {
    const providerError = await emailResponse.text();
    console.error("[waitlist] Email provider rejected notification:", providerError);
    throw new Error("email_provider_rejected");
  }
}

async function sendContactNotification(request: ContactRequest) {
  const emailMode = (process.env.CORTEX_CONTACT_EMAIL_MODE || process.env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
  const subject = `New Cortex conversation request from ${request.name}`;
  const text = [
    "New Cortex conversation request",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Company: ${request.company}`,
    `Topic: ${request.product || "Not specified"}`,
    `Message: ${request.message}`,
    `Submitted: ${request.submittedAt}`,
  ].join("\n");
  const html = `<h2>New Cortex conversation request</h2><p><strong>Name:</strong> ${escapeHtml(request.name)}</p><p><strong>Email:</strong> ${escapeHtml(request.email)}</p><p><strong>Company:</strong> ${escapeHtml(request.company)}</p><p><strong>Topic:</strong> ${escapeHtml(request.product || "Not specified")}</p><p><strong>Message:</strong> ${escapeHtml(request.message)}</p><p><strong>Submitted:</strong> ${escapeHtml(request.submittedAt)}</p>`;

  if (emailMode === "mock") {
    console.info("[contact] Mock email notification:", { from: process.env.CORTEX_CONTACT_EMAIL_FROM || process.env.WORKFLO_EMAIL_FROM || "mock@cortex.local", to: process.env.CORTEX_CONTACT_TO_EMAIL || process.env.WORKFLO_WAITLIST_TO_EMAIL || "admin@cortex.local", subject, text });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const notificationEmail = (process.env.CORTEX_CONTACT_TO_EMAIL || process.env.WORKFLO_WAITLIST_TO_EMAIL)?.trim();
  const fromEmail = (process.env.CORTEX_CONTACT_EMAIL_FROM || process.env.WORKFLO_EMAIL_FROM)?.trim();
  if (!resendApiKey || !notificationEmail || !fromEmail) {
    console.error("[contact] Missing RESEND_API_KEY, CORTEX_CONTACT_TO_EMAIL, or CORTEX_CONTACT_EMAIL_FROM");
    throw new Error("email_configuration_missing");
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notificationEmail],
      reply_to: request.email,
      subject,
      text,
      html,
    }),
  });

  if (!emailResponse.ok) {
    const providerError = await emailResponse.text();
    console.error("[contact] Email provider rejected notification:", providerError);
    throw new Error("email_provider_rejected");
  }
}

function requireAdmin(req: express.Request, res: express.Response): boolean {
  const sessionId = readAdminSessionId(req);
  if (!isAdminSessionValid(sessionId)) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  touchAdminSession(sessionId!);
  setAdminSessionCookie(res, sessionId!, SESSION_TTL_MS);
  return true;
}

app.post("/api/waitlist", async (req, res) => {
  const name = cleanText(req.body?.name, 120);
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const company = cleanText(req.body?.company, 160);

  if (!name || !email || !isValidEmail(email)) {
    res.status(400).json({ error: "Please provide a name and a valid work email." });
    return;
  }

  const signup: WaitlistSignup = {
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company,
    submittedAt: new Date().toISOString(),
  };

  try {
    await sendWaitlistNotification(signup);
    const entries = await loadWaitlist();
    entries.unshift(signup);
    await saveWaitlist(entries);
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "email_configuration_missing") {
      res.status(503).json({ error: "The waitlist is temporarily unavailable. Please try again shortly." });
      return;
    }
    console.error("[waitlist] Submission failed:", error);
    res.status(502).json({ error: "We could not send your request. Please try again shortly." });
  }
});

app.post("/api/contact", async (req, res) => {
  const name = cleanText(req.body?.name, 120);
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const company = cleanText(req.body?.company, 160);
  const product = cleanText(req.body?.product, 120);
  const message = cleanText(req.body?.message, 4000);

  if (!name || !email || !isValidEmail(email) || !company || message.length < 20) {
    res.status(400).json({ error: "Please provide your name, work email, company, and a short message." });
    return;
  }

  const request: ContactRequest = {
    id: `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company,
    product,
    message,
    submittedAt: new Date().toISOString(),
  };

  try {
    await sendContactNotification(request);
    const entries = await loadContactRequests();
    entries.unshift(request);
    await saveContactRequests(entries);
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "email_configuration_missing") {
      res.status(503).json({ error: "The contact form is temporarily unavailable. Please try again shortly." });
      return;
    }
    console.error("[contact] Submission failed:", error);
    res.status(502).json({ error: "We could not send your message. Please try again shortly." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const clientKey = getClientKey(req);
  const rateLimit = checkLoginRateLimit(clientKey);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds ?? 60));
    res.status(429).json({ error: "Too many attempts. Please try again later." });
    return;
  }

  const submittedToken = cleanText(req.body?.token, 512);
  if (!submittedToken || !timingSafeStringsEqual(submittedToken, configuredToken)) {
    recordFailedLogin(clientKey);
    res.status(401).json({ error: "Invalid admin token." });
    return;
  }

  recordSuccessfulLogin(clientKey);
  const sessionId = createAdminSession();
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  const sessionId = readAdminSessionId(req);
  destroyAdminSession(sessionId);
  clearAdminSessionCookie(res);
  res.status(200).json({ ok: true });
});

app.get("/api/admin/session", (req, res) => {
  const sessionId = readAdminSessionId(req);
  const valid = isAdminSessionValid(sessionId);
  if (valid) {
    touchAdminSession(sessionId!);
    setAdminSessionCookie(res, sessionId!, SESSION_TTL_MS);
  }
  res.status(200).json({ authenticated: valid });
});

app.get("/api/admin/waitlist", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const entries = await loadWaitlist();
    res.status(200).json({ entries, total: entries.length });
  } catch (error) {
    console.error("[admin] Could not load waitlist:", error);
    res.status(500).json({ error: "Could not load waitlist submissions." });
  }
});

app.get("/api/admin/contact", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const entries = await loadContactRequests();
    res.status(200).json({ entries, total: entries.length });
  } catch (error) {
    console.error("[admin] Could not load contact requests:", error);
    res.status(500).json({ error: "Could not load contact requests." });
  }
});

// AI Core chat endpoint. Grounds each reply in the shared platform/docs
// knowledge base. If an OLLAMA_BASE_URL is configured, it proxies to a
// self-hosted model and augments the prompt with the grounded context;
// otherwise it returns the deterministic grounded answer so the assistant
// always works, even without a running model.
app.post("/api/ai/chat", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const grounded = groundPrompt(prompt);
  const followUps = followUpsFor(prompt);
  const ollamaBase = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3";

  if (!ollamaBase) {
    res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const upstream = await fetch(`${ollamaBase.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "system", content: `Grounded context: ${grounded.answer} (source: ${grounded.source.label})` },
          { role: "user", content: prompt },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) throw new Error(`ollama responded ${upstream.status}`);
    const data = (await upstream.json()) as { message?: { content?: string } };
    const reply = data.message?.content?.trim() || grounded.answer;
    res.json({ reply, source: grounded.source, followUps, model: ollamaModel });
  } catch (err) {
    console.error("[server] ai proxy error:", err);
    // Never fail the assistant: fall back to the grounded answer.
    res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
  }
});

app.use(cacheTuner);
app.use(express.static(staticPath, { etag: true }));

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.get("*", (_req, res, next) => {
  res.sendFile(path.join(staticPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] request error:", err);
  if (req.path.startsWith("/api/")) {
    res.status(500).json({ error: "internal" });
    return;
  }
  if (!res.headersSent) {
    res.status(500).type("text/plain").send("Internal server error");
  }
});

const server = createServer(app);
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[server] port ${port} is already in use`);
  } else {
    console.error("[server] listen error:", err);
  }
  process.exit(1);
});
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
