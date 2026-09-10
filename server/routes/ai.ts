/* Issue #8: bounded, observable remote Ollama proxy with grounded fallback. */

import { Router } from "express";
import { AiChatSchema, type AiChatInput } from "../../shared/schemas";
import { AI_SYSTEM_PROMPT, followUpsFor, groundPrompt } from "../../shared/aiCore";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { getRequestId } from "../middleware/security";
import { recordOllamaRequest } from "../services/ollamaHealth";

export const aiRouter = Router();

const MAX_RESPONSE_CHARS = 4096;
const MAX_UPSTREAM_BYTES = 16 * 1024;
const REQUEST_TIMEOUT_MS = 20_000;
const MODEL_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function validateOllamaUrl(url: string): { valid: boolean; normalized: string | null; error?: string } {
  if (!url) return { valid: false, normalized: null };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, normalized: null, error: `invalid protocol: ${parsed.protocol}` };
    }
    return { valid: true, normalized: parsed.toString().replace(/\/$/, "") };
  } catch {
    return { valid: false, normalized: null, error: "malformed URL" };
  }
}

function sanitizeResponse(content: string): string {
  const cleaned = content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return cleaned.length > MAX_RESPONSE_CHARS
    ? `${cleaned.slice(0, MAX_RESPONSE_CHARS)}\n\n[Response truncated for length.]`
    : cleaned;
}

function classifyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "timeout";
    if (err.message.includes("fetch failed")) return "connection_refused";
    if (err.message.startsWith("ollama responded")) return "upstream_error";
    if (err.message === "ollama_response_too_large") return "response_too_large";
    if (err.message === "ollama_invalid_json") return "invalid_json";
    return "runtime_error";
  }
  return "unknown";
}

async function readBoundedBody(response: Response): Promise<string> {
  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_UPSTREAM_BYTES) {
    throw new Error("ollama_response_too_large");
  }
  const body = await response.text();
  if (Buffer.byteLength(body, "utf8") > MAX_UPSTREAM_BYTES) throw new Error("ollama_response_too_large");
  return body;
}

aiRouter.post("/ai/chat", apiLimiters.ai(), validateBody(AiChatSchema), async (req, res) => {
  const { prompt } = validated<AiChatInput>(req);
  const requestId = getRequestId(req);
  const grounded = groundPrompt(prompt);
  const followUps = followUpsFor(prompt);
  const ollamaBaseRaw = process.env.OLLAMA_BASE_URL?.trim();
  const ollamaModel = process.env.OLLAMA_MODEL?.trim() || "llama3";

  if (!ollamaBaseRaw) {
    console.log(JSON.stringify({ type: "ai_chat", requestId, model: "grounded-fallback", reason: "no_ollama_configured", promptLength: prompt.length }));
    res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
    return;
  }

  const urlCheck = validateOllamaUrl(ollamaBaseRaw);
  if (!urlCheck.valid || !MODEL_PATTERN.test(ollamaModel)) {
    const reason = !urlCheck.valid ? "invalid_ollama_url" : "invalid_ollama_model";
    console.error(JSON.stringify({ type: "ai_chat", requestId, model: "grounded-fallback", reason, error: urlCheck.error ?? "invalid model" }));
    recordOllamaRequest(0, false, "config_error");
    res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
    return;
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${urlCheck.normalized}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

    const latencyMs = Date.now() - startTime;
    if (!upstream.ok) {
      const errorType = `upstream_${upstream.status}`;
      console.error(JSON.stringify({ type: "ai_chat", requestId, model: ollamaModel, latencyMs, success: false, errorType, upstreamStatus: upstream.status }));
      recordOllamaRequest(latencyMs, false, errorType);
      res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
      return;
    }

    const body = await readBoundedBody(upstream);
    let data: { message?: { content?: string } };
    try {
      data = JSON.parse(body) as { message?: { content?: string } };
    } catch {
      throw new Error("ollama_invalid_json");
    }

    const rawReply = data.message?.content?.trim();
    const reply = sanitizeResponse(rawReply || grounded.answer);
    console.log(JSON.stringify({ type: "ai_chat", requestId, model: ollamaModel, latencyMs, success: true, replyLength: reply.length, truncated: Boolean(rawReply && reply !== rawReply) }));
    recordOllamaRequest(latencyMs, true);
    res.json({ reply, source: grounded.source, followUps, model: ollamaModel });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const errorType = classifyError(err);
    console.error(JSON.stringify({ type: "ai_chat", requestId, model: ollamaModel, latencyMs, success: false, errorType, error: err instanceof Error ? err.message : String(err) }));
    recordOllamaRequest(latencyMs, false, errorType);
    res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
  } finally {
    clearTimeout(timeout);
  }
});
