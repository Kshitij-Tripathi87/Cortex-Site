/*
 * Issue #5: Failure-safe form submission.
 *
 * Submission lifecycle:
 *   1. Compute submission hash (idempotency key)
 *   2. Check for duplicate — if found, return success (idempotent)
 *   3. Persist to Supabase (authoritative) — if fails, return error, NO email sent
 *   4. Send email notification — if fails, data is safe, return success with emailPending
 *   5. Mark notification status on the record
 *   6. Return success
 *
 * This eliminates the failure case where email succeeds but persistence fails,
 * which previously caused the visitor to retry and produce a duplicate email.
 */

import { Router } from "express";
import { ContactRequestSchema, type ContactRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendContactNotification } from "../services/email";
import {
  newId,
  saveContactRequest,
  submissionHash,
  isDuplicateContact,
  markContactNotification,
} from "../services/store";

export const contactRouter = Router();

contactRouter.post(
  "/contact",
  apiLimiters.write(),
  validateBody(ContactRequestSchema),
  async (req, res) => {
    const input = validated<ContactRequestInput>(req);
    const request = {
      id: newId("ct"),
      name: input.name,
      email: input.email,
      company: input.company,
      product: input.product ?? "",
      message: input.message,
      submittedAt: new Date().toISOString(),
    };

    // 1. Compute idempotency hash
    const hash = submissionHash(input.email, input.message, input.product ?? "");

    // 2. Check for duplicate submission within the last 5 minutes
    const isDuplicate = await isDuplicateContact(input.email, hash);
    if (isDuplicate) {
      console.info("[contact] Duplicate submission detected — returning idempotent success");
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }

    // 3. Persist first — if this fails, no email is sent
    const result = await saveContactRequest(request, hash);
    if (!result.success) {
      console.error("[contact] Persistence failed — not sending email:", result.error);
      res.status(502).json({ error: "We could not save your message. Please try again shortly." });
      return;
    }

    // 4. Send email notification — if this fails, data is already persisted
    try {
      await sendContactNotification(request);
      await markContactNotification(input.email, hash, "sent");
      res.status(200).json({ ok: true });
    } catch (error) {
      // Data is safe in Supabase. Log the email failure and return success.
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        console.warn("[contact] Email config missing — submission persisted but notification not sent");
      } else {
        console.error("[contact] Email notification failed — submission is persisted:", error);
      }
      await markContactNotification(input.email, hash, "failed");
      res.status(200).json({ ok: true, emailPending: true });
    }
  },
);
