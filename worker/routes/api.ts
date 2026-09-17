/**
 * Cortex Worker API routes — contact, waitlist, AI chat.
 *
 * Mirrors the Express API contract exactly so the client needs no changes:
 *   POST /api/contact   → validate → Supabase → Resend
 *   POST /api/waitlist  → validate → Supabase → Resend
 *   POST /api/ai/chat   → grounded fallback from the shared knowledge base
 *
 * Supabase is authoritative; email failures never fail a persisted request.
 */

import { insertRow, TABLES, type SupabaseConfig } from "../services/supabase";
import { sendEmail } from "../services/resend";

export type WorkerEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  CORTEX_CONTACT_EMAIL_FROM?: string;
  WORKFLO_EMAIL_FROM?: string;
  CORTEX_CONTACT_TO_EMAIL?: string;
  WORKFLO_WAITLIST_TO_EMAIL?: string;
  WORKFLO_EMAIL_MODE?: string;
  WORKFLO_ADMIN_TOKEN?: string;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
};

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength) : "";
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "\u0026": "\u0026amp;",
    "\u003C": "\u0026lt;",
    "\u003E": "\u0026gt;",
    "\u0022": "\u0026quot;",
    "'": "\u0026#39;",
  };
  return value.replace(/[&<>"']/g, (c) => entities[c] || c);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function supabase(env: WorkerEnv): SupabaseConfig | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY };
}

function fromAddress(env: WorkerEnv, fallback: string): string {
  return (env.CORTEX_CONTACT_EMAIL_FROM || env.WORKFLO_EMAIL_FROM || fallback).trim();
}

export async function handleContact(env: WorkerEnv, request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const company = cleanText(body.company, 160);
  const role = cleanText(body.role, 80);
  const companySize = cleanText(body.companySize, 40);
  const product = cleanText(body.product, 120);
  const message = cleanText(body.message, 4000);
  const timing = cleanText(body.timing, 40);

  if (!name || !email || !isValidEmail(email) || !company || message.length < 20) {
    return json({ error: "Please provide your name, work email, company, and a short message." }, 400);
  }

  const record = {
    id: `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company,
    role,
    company_size: companySize,
    product,
    message,
    timing,
    submitted_at: new Date().toISOString(),
  };

  const db = supabase(env);
  if (db) {
    const persisted = await insertRow(db, TABLES.contactRequests, record);
    if (!persisted.ok) {
      return json({ error: "We could not record your request. Please try again shortly." }, 502);
    }
  }

  const emailMode = (env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
  if (emailMode === "mock") {
    console.info("[contact] Mock email:", record);
  } else if (env.RESEND_API_KEY) {
    const subject = `New Cortex conversation request from ${name}`;
    const text = [
      "New Cortex conversation request",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Role: ${role || "Not specified"}`,
      `Company size: ${companySize || "Not specified"}`,
      `Product: ${product || "Not specified"}`,
      `Timing: ${timing || "Not specified"}`,
      `Decision / problem: ${message}`,
      `Submitted: ${record.submitted_at}`,
    ].join("\n");
    const html = `<h2>New Cortex conversation request</h2>${[
      ["Name", name], ["Email", email], ["Company", company],
      ["Role", role], ["Company size", companySize], ["Product", product],
      ["Preferred timing", timing], ["Decision / problem", message],
    ].map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(String(v) || "Not specified")}</p>`).join("")}`;

    const to = (env.CORTEX_CONTACT_TO_EMAIL || env.WORKFLO_WAITLIST_TO_EMAIL || "").trim();
    if (!to) {
      console.error("[contact] Missing notification inbox");
    } else {
      const result = await sendEmail(env.RESEND_API_KEY, {
        from: fromAddress(env, "noreply@resend.dev"),
        to: [to],
        replyTo: email,
        subject,
        text,
        html,
      });
      if (!result.ok) console.error("[contact] email failed:", result.error);
    }
  }

  return json({ ok: true });
}

export async function handleWaitlist(env: WorkerEnv, request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const company = cleanText(body.company, 160);

  if (!name || !email || !isValidEmail(email)) {
    return json({ error: "Please provide a name and a valid work email." }, 400);
  }

  const record = {
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company,
    submitted_at: new Date().toISOString(),
  };

  const db = supabase(env);
  if (db) {
    const persisted = await insertRow(db, TABLES.waitlistSignups, record);
    if (!persisted.ok) {
      return json({ error: "The waitlist is temporarily unavailable. Please try again shortly." }, 502);
    }
  }

  const emailMode = (env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
  if (emailMode === "mock") {
    console.info("[waitlist] Mock email:", record);
  } else if (env.RESEND_API_KEY) {
    const to = (env.WORKFLO_WAITLIST_TO_EMAIL || env.CORTEX_CONTACT_TO_EMAIL || "").trim();
    if (!to) {
      console.error("[waitlist] Missing notification inbox");
    } else {
      const result = await sendEmail(env.RESEND_API_KEY, {
        from: fromAddress(env, "noreply@resend.dev"),
        to: [to],
        replyTo: email,
        subject: `New Workflo early-access request from ${name}`,
        text: ["New Workflo early-access request", `Name: ${name}`, `Email: ${email}`, `Company: ${company || "Not provided"}`].join("\n"),
        html: `<h2>New Workflo early-access request</h2>${[
          ["Name", name], ["Email", email], ["Company", company],
        ].map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(String(v) || "Not provided")}</p>`).join("")}`,
      });
      if (!result.ok) console.error("[waitlist] email failed:", result.error);
    }
  }

  return json({ ok: true });
}

export async function handleAiChat(_env: WorkerEnv, request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "prompt is required" }, 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return json({ error: "prompt is required" }, 400);

  // Grounded deterministic fallback from the shared knowledge base.
  // (Ollama proxying is intentionally not part of the Cloudflare target.)
  const { groundPrompt, followUpsFor } = await import("../../shared/aiCore");
  const grounded = groundPrompt(prompt);
  return json({
    reply: grounded.answer,
    source: grounded.source,
    followUps: followUpsFor(prompt),
    model: "grounded-fallback",
  });
}
