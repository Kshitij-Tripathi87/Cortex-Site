/**
 * Resend email client for the Cortex Worker.
 * Thin fetch-based REST wrapper — no SDK dependency at the edge.
 */

export type EmailPayload = {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export type ResendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(apiKey: string, payload: EmailPayload): Promise<ResendResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        reply_to: payload.replyTo,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const providerError = await response.text();
      console.error("[resend] provider rejected:", providerError);
      return { ok: false, error: "email_provider_rejected" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[resend] network error:", err);
    return { ok: false, error: "email_network_error" };
  }
}
