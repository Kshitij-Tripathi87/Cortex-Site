/* Server-side notification delivery. The browser never sends provider credentials. */

import type { ContactRequest, DemoRequest, WaitlistSignup } from "./store";

export const EMAIL_CONFIG_MISSING = "email_configuration_missing";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character,
  );
}

function emailMode(): string {
  return (process.env.CORTEX_EMAIL_MODE || process.env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
}

type FormKind = "contact" | "demo" | "waitlist";

function resendConfig(kind: FormKind, fallbackTo: string, fallbackFrom: string) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const toEnv = kind === "waitlist" ? "CORTEX_WAITLIST_TO_EMAIL" : "CORTEX_CONTACT_TO_EMAIL";
  const legacyToEnv = kind === "waitlist" ? "WORKFLO_WAITLIST_TO_EMAIL" : undefined;
  const fromEnv = kind === "waitlist" ? "CORTEX_EMAIL_FROM" : "CORTEX_CONTACT_EMAIL_FROM";
  const legacyFromEnv = kind === "waitlist" ? "WORKFLO_EMAIL_FROM" : undefined;
  const to = (process.env[toEnv] || (legacyToEnv ? process.env[legacyToEnv] : "") || fallbackTo).trim();
  const from = (process.env[fromEnv] || (legacyFromEnv ? process.env[legacyFromEnv] : "") || fallbackFrom).trim();
  return { resendApiKey, to, from };
}

async function sendViaResend(options: {
  kind: FormKind;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
}): Promise<void> {
  if (emailMode() === "mock") {
    console.info(`[${options.kind}] Mock email notification:`, {
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      idempotencyKey: options.idempotencyKey,
    });
    return;
  }

  const { resendApiKey } = resendConfig(options.kind, options.to, options.from);
  if (!resendApiKey || !options.to || !options.from) {
    console.error(`[${options.kind}] Missing Resend credentials or notification addresses`);
    throw new Error(EMAIL_CONFIG_MISSING);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${resendApiKey}`,
    "Content-Type": "application/json",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: options.from,
      to: [options.to],
      reply_to: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }),
  });

  if (!emailResponse.ok) {
    const providerError = await emailResponse.text();
    console.error(`[${options.kind}] Email provider rejected notification:`, providerError);
    throw new Error("email_provider_rejected");
  }
}

export async function sendWaitlistNotification(signup: WaitlistSignup, idempotencyKey?: string): Promise<void> {
  const { to, from } = resendConfig("waitlist", "admin@cortex.local", "noreply@cortex.local");
  const subject = `New Cortex early-access request from ${signup.name}`;
  const text = [
    "New Cortex early-access request",
    `Name: ${signup.name}`,
    `Email: ${signup.email}`,
    `Company: ${signup.company || "Not provided"}`,
    `Submitted: ${signup.submittedAt}`,
  ].join("\n");
  const html =
    `<h2>New Cortex early-access request</h2>` +
    `<p><strong>Name:</strong> ${escapeHtml(signup.name)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(signup.email)}</p>` +
    `<p><strong>Company:</strong> ${escapeHtml(signup.company || "Not provided")}</p>` +
    `<p><strong>Submitted:</strong> ${escapeHtml(signup.submittedAt)}</p>`;
  await sendViaResend({ kind: "waitlist", from, to, replyTo: signup.email, subject, text, html, idempotencyKey });
}

export async function sendContactNotification(request: ContactRequest, idempotencyKey?: string): Promise<void> {
  const { to, from } = resendConfig("contact", "admin@cortex.local", "noreply@cortex.local");
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
  const html =
    `<h2>New Cortex conversation request</h2>` +
    `<p><strong>Name:</strong> ${escapeHtml(request.name)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(request.email)}</p>` +
    `<p><strong>Company:</strong> ${escapeHtml(request.company)}</p>` +
    `<p><strong>Topic:</strong> ${escapeHtml(request.product || "Not specified")}</p>` +
    `<p><strong>Message:</strong> ${escapeHtml(request.message)}</p>` +
    `<p><strong>Submitted:</strong> ${escapeHtml(request.submittedAt)}</p>`;
  await sendViaResend({ kind: "contact", from, to, replyTo: request.email, subject, text, html, idempotencyKey });
}

export async function sendDemoNotification(request: DemoRequest, idempotencyKey?: string): Promise<void> {
  const { to, from } = resendConfig("contact", "admin@cortex.local", "noreply@cortex.local");
  const subject = `New Cortex demo request from ${request.name} (${request.company})`;
  const text = [
    "New Cortex demo request",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Company: ${request.company}`,
    `Role: ${request.role || "Not provided"}`,
    `Company size: ${request.companySize || "Not provided"}`,
    `Product interest: ${request.product || "Not specified"}`,
    `Preferred date: ${request.preferredDate || "Flexible"}`,
    `Message: ${request.message || "—"}`,
    `Submitted: ${request.submittedAt}`,
  ].join("\n");
  const html =
    `<h2>New Cortex demo request</h2>` +
    `<p><strong>Name:</strong> ${escapeHtml(request.name)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(request.email)}</p>` +
    `<p><strong>Company:</strong> ${escapeHtml(request.company)}</p>` +
    `<p><strong>Role:</strong> ${escapeHtml(request.role || "Not provided")}</p>` +
    `<p><strong>Company size:</strong> ${escapeHtml(request.companySize || "Not provided")}</p>` +
    `<p><strong>Product interest:</strong> ${escapeHtml(request.product || "Not specified")}</p>` +
    `<p><strong>Preferred date:</strong> ${escapeHtml(request.preferredDate || "Flexible")}</p>` +
    `<p><strong>Message:</strong> ${escapeHtml(request.message || "—")}</p>` +
    `<p><strong>Submitted:</strong> ${escapeHtml(request.submittedAt)}</p>`;
  await sendViaResend({ kind: "contact", from, to, replyTo: request.email, subject, text, html, idempotencyKey });
}
