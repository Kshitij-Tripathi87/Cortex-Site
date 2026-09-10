/* Silverline Systems reminder: the browser never sends email. All notifications are
 * composed and dispatched here, on the server, with explicit configuration. */

import type { ContactRequest, DemoRequest, WaitlistSignup } from "./store";

export const EMAIL_CONFIG_MISSING = "email_configuration_missing";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character,
  );
}

function emailMode(): string {
  // Issue #11: Prefer CORTEX_* env vars, fall back to WORKFLO_* for backward compatibility.
  return (process.env.CORTEX_EMAIL_MODE || process.env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase();
}

function resendConfig(toFallback: string, fromFallback: string) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  // Issue #11: Prefer CORTEX_* env vars, fall back to WORKFLO_* for backward compatibility.
  const to = (process.env.CORTEX_CONTACT_TO_EMAIL || process.env.CORTEX_WAITLIST_TO_EMAIL || process.env.WORKFLO_WAITLIST_TO_EMAIL || toFallback).trim();
  const from = (process.env.CORTEX_CONTACT_EMAIL_FROM || process.env.CORTEX_EMAIL_FROM || process.env.WORKFLO_EMAIL_FROM || fromFallback).trim();
  return { resendApiKey, to, from };
}

async function sendViaResend(options: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  logScope: string;
}): Promise<void> {
  if (emailMode() === "mock") {
    console.info(`[${options.logScope}] Mock email notification:`, {
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return;
  }

  const { resendApiKey } = resendConfig(options.to, options.from);
  // resendConfig re-reads env for the key; to/from were already resolved by the caller.
  if (!resendApiKey || !options.to || !options.from) {
    console.error(`[${options.logScope}] Missing RESEND_API_KEY or notification addresses`);
    throw new Error(EMAIL_CONFIG_MISSING);
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
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
    console.error(`[${options.logScope}] Email provider rejected notification:`, providerError);
    throw new Error("email_provider_rejected");
  }
}

export async function sendWaitlistNotification(signup: WaitlistSignup): Promise<void> {
  const { to, from } = resendConfig("admin@cortex.local", "mock@cortex.local");
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
  await sendViaResend({ from, to, replyTo: signup.email, subject, text, html, logScope: "waitlist" });
}

export async function sendContactNotification(request: ContactRequest): Promise<void> {
  const { to, from } = resendConfig("admin@cortex.local", "mock@cortex.local");
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
  await sendViaResend({ from, to, replyTo: request.email, subject, text, html, logScope: "contact" });
}

export async function sendDemoNotification(request: DemoRequest): Promise<void> {
  const { to, from } = resendConfig("admin@cortex.local", "mock@cortex.local");
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
  await sendViaResend({ from, to, replyTo: request.email, subject, text, html, logScope: "demo" });
}
