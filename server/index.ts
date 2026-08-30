import express from "express";
import { createServer } from "http";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
const staticPath = path.resolve(__dirname, "public");
const waitlistFile = path.resolve(process.env.WORKFLO_WAITLIST_FILE || path.resolve(__dirname, "..", "data", "waitlist.json"));

type WaitlistSignup = {
  id: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
};

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] uncaughtException:", err);
});

const app = express();
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

function requireAdmin(req: express.Request, res: express.Response) {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return false;
  }
  const authorization = req.get("authorization") || "";
  if (authorization !== `Bearer ${configuredToken}`) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
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
