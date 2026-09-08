/* Silverline Systems reminder: measure the funnel, respect the visitor. First-party
 * events only, no fingerprinting, consent-gated in the browser. */

import { Router } from "express";
import { AnalyticsEventSchema, type AnalyticsEventInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { newId, saveAnalyticsEvent } from "../services/store";

export const analyticsRouter = Router();

analyticsRouter.post(
  "/analytics",
  apiLimiters.analytics(),
  validateBody(AnalyticsEventSchema),
  async (req, res) => {
    const input = validated<AnalyticsEventInput>(req);
    try {
      await saveAnalyticsEvent({
        id: newId("ev"),
        event: input.event,
        page: input.page ?? "",
        referrer: input.referrer ?? "",
        sessionId: (input.sessionId ?? "").slice(0, 64),
        properties: input.properties ?? {},
        utm: {
          source: input.utm?.source ?? "",
          medium: input.utm?.medium ?? "",
          campaign: input.utm?.campaign ?? "",
          term: input.utm?.term ?? "",
          content: input.utm?.content ?? "",
        },
        occurredAt: input.occurredAt || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
      });
      res.status(202).json({ ok: true });
    } catch (error) {
      // Analytics must never break the visitor experience — acknowledge anyway.
      console.error("[analytics] Failed to persist event:", error);
      res.status(202).json({ ok: true });
    }
  },
);
