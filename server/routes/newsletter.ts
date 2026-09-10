/*
 * Issue #5: Failure-safe form submission.
 *
 * Newsletter route already persists-only (no email notification), so the
 * main change is adding idempotency: duplicate signups within 5 minutes
 * return success instead of creating a second record.
 */

import { Router } from "express";
import { NewsletterSchema, type NewsletterInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { newId, saveNewsletterSignup, submissionHash } from "../services/store";

export const newsletterRouter = Router();

newsletterRouter.post(
  "/newsletter",
  apiLimiters.write(),
  validateBody(NewsletterSchema),
  async (req, res) => {
    const input = validated<NewsletterInput>(req);

    // The newsletter_subscribers table has a unique constraint on email,
    // so duplicate signups are already prevented at the database level.
    // This route returns success for duplicates — idempotent by design.
    try {
      await saveNewsletterSignup({
        id: newId("nl"),
        email: input.email,
        source: input.source ?? "website",
        submittedAt: new Date().toISOString(),
      });
      res.status(200).json({ ok: true });
    } catch (error) {
      // If the error is a unique constraint violation, the email is already
      // subscribed — return success (idempotent).
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("duplicate") || message.includes("unique") || message.includes("already exists")) {
        console.info("[newsletter] Duplicate subscription — returning idempotent success");
        res.status(200).json({ ok: true, duplicate: true });
        return;
      }
      console.error("[newsletter] Subscription failed:", error);
      res.status(502).json({ error: "We could not save your subscription. Please try again shortly." });
    }
  },
);
