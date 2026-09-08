/* Silverline Systems reminder: a newsletter signup is consent, not just an email.
 * Store the source, deduplicate silently, confirm warmly. */

import { Router } from "express";
import { NewsletterSchema, type NewsletterInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { newId, saveNewsletterSignup } from "../services/store";

export const newsletterRouter = Router();

newsletterRouter.post(
  "/newsletter",
  apiLimiters.write(),
  validateBody(NewsletterSchema),
  async (req, res) => {
    const input = validated<NewsletterInput>(req);
    try {
      await saveNewsletterSignup({
        id: newId("nl"),
        email: input.email,
        source: input.source ?? "website",
        submittedAt: new Date().toISOString(),
      });
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[newsletter] Subscription failed:", error);
      res.status(502).json({ error: "We could not save your subscription. Please try again shortly." });
    }
  },
);
