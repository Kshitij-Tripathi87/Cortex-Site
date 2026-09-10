/*
 * Issue #5: Failure-safe form submission.
 *
 * Same persist-first + idempotency lifecycle as the contact route.
 * See server/routes/contact.ts for the full rationale.
 */

import { Router } from "express";
import { DemoRequestSchema, type DemoRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendDemoNotification } from "../services/email";
import {
  newId,
  saveDemoRequest,
  submissionHash,
  isDuplicateDemo,
  markDemoNotification,
} from "../services/store";

export const demoRouter = Router();

demoRouter.post(
  "/demo",
  apiLimiters.write(),
  validateBody(DemoRequestSchema),
  async (req, res) => {
    const input = validated<DemoRequestInput>(req);
    const request = {
      id: newId("dm"),
      name: input.name,
      email: input.email,
      company: input.company,
      role: input.role ?? "",
      companySize: input.companySize ?? "",
      product: input.product ?? "",
      message: input.message ?? "",
      preferredDate: input.preferredDate ?? "",
      submittedAt: new Date().toISOString(),
    };

    // 1. Compute idempotency hash
    const hash = submissionHash(input.email, input.message ?? "", input.product ?? "");

    // 2. Check for duplicate submission within the last 5 minutes
    const isDuplicate = await isDuplicateDemo(input.email, hash);
    if (isDuplicate) {
      console.info("[demo] Duplicate submission detected — returning idempotent success");
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }

    // 3. Persist first — if this fails, no email is sent
    const result = await saveDemoRequest(request, hash);
    if (!result.success) {
      console.error("[demo] Persistence failed — not sending email:", result.error);
      res.status(502).json({ error: "We could not save your request. Please try again shortly." });
      return;
    }

    // 4. Send email notification — if this fails, data is already persisted
    try {
      await sendDemoNotification(request);
      await markDemoNotification(input.email, hash, "sent");
      res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        console.warn("[demo] Email config missing — submission persisted but notification not sent");
      } else {
        console.error("[demo] Email notification failed — submission is persisted:", error);
      }
      await markDemoNotification(input.email, hash, "failed");
      res.status(200).json({ ok: true, emailPending: true });
    }
  },
);
