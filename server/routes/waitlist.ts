/*
 * Issue #5: Failure-safe form submission.
 *
 * Same persist-first + idempotency lifecycle as the contact route.
 * See server/routes/contact.ts for the full rationale.
 */

import { Router } from "express";
import { WaitlistSchema, type WaitlistInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendWaitlistNotification } from "../services/email";
import {
  newId,
  saveWaitlistSignup,
  submissionHash,
  isDuplicateWaitlist,
  markWaitlistNotification,
} from "../services/store";

export const waitlistRouter = Router();

waitlistRouter.post(
  "/waitlist",
  apiLimiters.write(),
  validateBody(WaitlistSchema),
  async (req, res) => {
    const input = validated<WaitlistInput>(req);
    const signup = {
      id: newId("wf"),
      name: input.name,
      email: input.email,
      company: input.company ?? "",
      submittedAt: new Date().toISOString(),
    };

    // 1. Compute idempotency hash
    const hash = submissionHash(input.email, input.name, input.company ?? "");

    // 2. Check for duplicate submission within the last 5 minutes
    const isDuplicate = await isDuplicateWaitlist(input.email, hash);
    if (isDuplicate) {
      console.info("[waitlist] Duplicate submission detected — returning idempotent success");
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }

    // 3. Persist first — if this fails, no email is sent
    const result = await saveWaitlistSignup(signup, hash);
    if (!result.success) {
      console.error("[waitlist] Persistence failed — not sending email:", result.error);
      res.status(502).json({ error: "We could not save your request. Please try again shortly." });
      return;
    }

    // 4. Send email notification — if this fails, data is already persisted
    try {
      await sendWaitlistNotification(signup);
      await markWaitlistNotification(input.email, hash, "sent");
      res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        console.warn("[waitlist] Email config missing — submission persisted but notification not sent");
      } else {
        console.error("[waitlist] Email notification failed — submission is persisted:", error);
      }
      await markWaitlistNotification(input.email, hash, "failed");
      res.status(200).json({ ok: true, emailPending: true });
    }
  },
);
