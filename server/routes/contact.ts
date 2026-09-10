/* Issue #5: persist first, then notify; retries are idempotent. */

import { Router } from "express";
import { ContactRequestSchema, type ContactRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendContactNotification } from "../services/email";
import { newId, saveContactRequest, submissionHash, isDuplicateContact, markContactNotification } from "../services/store";

export const contactRouter = Router();

contactRouter.post("/contact", apiLimiters.write(), validateBody(ContactRequestSchema), async (req, res) => {
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
  const hash = submissionHash(input.email, input.message, input.product ?? "");

  if (await isDuplicateContact(input.email, hash)) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  const result = await saveContactRequest(request, hash);
  if (!result.success) {
    console.error("[contact] Persistence failed — notification suppressed:", result.error);
    res.status(502).json({ error: "We could not save your message. Please try again shortly." });
    return;
  }

  try {
    await sendContactNotification(request, `cortex-contact-${hash}`);
    await markContactNotification(input.email, hash, "sent");
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
      console.warn("[contact] Notification configuration missing; submission remains persisted.");
    } else {
      console.error("[contact] Notification delivery failed; submission remains persisted:", error);
    }
    await markContactNotification(input.email, hash, "failed");
    res.status(200).json({ ok: true, emailPending: true });
  }
});
