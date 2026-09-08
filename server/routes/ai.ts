/* Silverline Systems reminder: AI Core answers like a calm operator — grounded in
 * the platform docs, specific, and always citing where the answer comes from.
 * Foundation hardening: Zod input validation, rate limiting, request timeout,
 * and a guaranteed grounded fallback. Full production hardening (token limits,
 * abuse detection, observability) arrives in the AI Core phase. */

import { Router } from "express";
import { AiChatSchema, type AiChatInput } from "../../shared/schemas";
import { AI_SYSTEM_PROMPT, followUpsFor, groundPrompt } from "../../shared/aiCore";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";

export const aiRouter = Router();

aiRouter.post(
  "/ai/chat",
  apiLimiters.ai(),
  validateBody(AiChatSchema),
  async (req, res) => {
    const { prompt } = validated<AiChatInput>(req);

    const grounded = groundPrompt(prompt);
    const followUps = followUpsFor(prompt);
    const ollamaBase = process.env.OLLAMA_BASE_URL?.trim();
    const ollamaModel = process.env.OLLAMA_MODEL?.trim() || "llama3";

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
  },
);
