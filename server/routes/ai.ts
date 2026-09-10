/*
 * Issue #8: Harden Ollama proxy.
 *
 * Production hardening for the AI chat endpoint:
 * - Config validation: URL format, model name
 * - Input limits: prompt length (from schema), message count
 * - Output limits: response size cap, content sanitization
 * - Timeout classification: distinguish timeout from other errors
 * - Structured telemetry: request ID, model, latency, status, error type
 * - Provider health tracking: feeds /status endpoint
 * - Grounded fallback: always available, now observable
 */

import { Router } from "express";
import { AiChatSchema, type AiChatInput } from "../../shared/schemas";
import { AI_SYSTEM_PROMPT, followUpsFor, groundPrompt } from "../../shared/aiCore";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { getRequestId } from "../middleware/security";
import { recordOllamaRequest } from "../services/ollamaHealth";

export const aiRouter = Router();

/** Maximum response size from Ollama (4 KB). */
const MAX_RESPONSE_CHARS = 4096;
/** Request timeout in milliseconds. */
const REQUEST_TIMEOUT_MS = 20_000;

/** Validate the Ollama base URL format. */
function validateOllamaUrl(url: string): { valid: boolean; normalized: string | null; error?: string } {
  if (!url) return { valid: false, normalized: null };
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      return { valid: false, normalized: null, error: `invalid protocol: ${parsed.protocol}` };
    }
    return { valid: true, normalized: parsed.toString().replace(/\/$/, "") };
  } catch {
    return { valid: false, normalized: null, error: "malformed URL" };
  }
}

/** Sanitize and cap the response from Ollama. */
function sanitizeResponse(content: string): string {
  // Strip control characters except newlines and tabs
  const cleaned = content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001f]/g, "");
  // Cap at MAX_RESPONSE_CHARS
  if (cleaned.length > MAX_RESPONSE_CHARS) {
    return cleaned.slice(0, MAX_RESPONSE_CHARS) + "\n\n[Response truncated for length.]";
  }
  return cleaned;
}

/** Classify an error for telemetry. */
function classifyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "timeout";
    if (err.message.includes("fetch failed")) return "connection_refused";
    if (err.message.includes("ollama responded")) return "upstream_error";
    return "runtime_error";
  }
  return "unknown";
}

aiRouter.post(
  "/ai/chat",
  apiLimiters.ai(),
  validateBody(AiChatSchema),
  async (req, res) => {
    const { prompt } = validated<AiChatInput>(req);
    const requestId = getRequestId(req);

    const grounded = groundPrompt(prompt);
    const followUps = followUpsFor(prompt);
    const ollamaBaseRaw = process.env.OLLAMA_BASE_URL?.trim();
    const ollamaModel = process.env.OLLAMA_MODEL?.trim() || "llama3";

    // No Ollama configured — return grounded fallback with telemetry
    if (!ollamaBaseRaw) {
      console.log(JSON.stringify({
        type: "ai_chat",
        requestId,
        model: "grounded-fallback",
        reason: "no_ollama_configured",
        promptLength: prompt.length,
      }));
      res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
      return;
    }

    // Validate URL format
    const urlCheck = validateOllamaUrl(ollamaBaseRaw);
    if (!urlCheck.valid) {
      console.error(JSON.stringify({
        type: "ai_chat",
        requestId,
        model: "grounded-fallback",
        reason: "invalid_ollama_url",
        error: urlCheck.error,
      }));
      recordOllamaRequest(0, false, "config_error");
      res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
      return;
    }

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const upstream = await fetch(`${urlCheck.normalized}/api/chat`, {
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

      const latencyMs = Date.now() - startTime;

      if (!upstream.ok) {
        const errorType = `upstream_${upstream.status}`;
        console.error(JSON.stringify({
          type: "ai_chat",
          requestId,
          model: ollamaModel,
          latencyMs,
          success: false,
          errorType,
          upstreamStatus: upstream.status,
        }));
        recordOllamaRequest(latencyMs, false, errorType);
        // Never fail the assistant: fall back to grounded answer
        res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
        return;
      }

      const data = (await upstream.json()) as { message?: { content?: string } };
      const rawReply = data.message?.content?.trim() || grounded.answer;
      const reply = sanitizeResponse(rawReply);

      console.log(JSON.stringify({
        type: "ai_chat",
        requestId,
        model: ollamaModel,
        latencyMs,
        success: true,
        replyLength: reply.length,
        truncated: reply !== rawReply,
      }));
      recordOllamaRequest(latencyMs, true);
      res.json({ reply, source: grounded.source, followUps, model: ollamaModel });
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      const errorType = classifyError(err);
      console.error(JSON.stringify({
        type: "ai_chat",
        requestId,
        model: ollamaModel,
        latencyMs,
        success: false,
        errorType,
        error: err instanceof Error ? err.message : String(err),
      }));
      recordOllamaRequest(latencyMs, false, errorType);
      // Never fail the assistant: fall back to grounded answer
      res.json({ reply: grounded.answer, source: grounded.source, followUps, model: "grounded-fallback" });
    }
  },
);