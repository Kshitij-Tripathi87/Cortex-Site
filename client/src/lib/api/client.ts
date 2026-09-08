/* Silverline Systems reminder: one typed client for every marketing API. Forms call
 * these helpers — never raw fetch — so validation and error shapes stay uniform.
 */

import type {
  AiChatInput,
  ContactRequestInput,
  DemoRequestInput,
  NewsletterInput,
  WaitlistInput,
} from "@shared/schemas";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new ApiError(response.status, payload.error || "Something went wrong. Please try again shortly.");
  }
  return payload;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin" });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new ApiError(response.status, payload.error || "Something went wrong. Please try again shortly.");
  }
  return payload;
}

export const api = {
  submitContact: (input: ContactRequestInput) => postJson<{ ok: true }>("/api/contact", input),
  submitWaitlist: (input: WaitlistInput) => postJson<{ ok: true }>("/api/waitlist", input),
  submitDemo: (input: DemoRequestInput) => postJson<{ ok: true }>("/api/demo", input),
  subscribeNewsletter: (input: NewsletterInput) => postJson<{ ok: true }>("/api/newsletter", input),
  askAiCore: (input: AiChatInput) =>
    postJson<{ reply: string; source: { label: string; href: string }; followUps: string[]; model: string }>(
      "/api/ai/chat",
      input,
    ),
  status: () =>
    getJson<{
      ok: true;
      status: string;
      timestamp: string;
      startedAt: string;
      uptimeSeconds: number;
      version: string;
      environment: string;
      checks: Record<string, string>;
    }>("/api/status"),
};
