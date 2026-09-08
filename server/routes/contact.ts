/* Silverline Systems reminder: the contact form is a promise — validate, notify,
 * persist, confirm. Every step is explicit and recoverable. */

import { Router } from "express";
import { ContactRequestSchema, type ContactRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendContactNotification } from "../services/email";
import { newId, saveContactRequest } from "../services/store";

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

    try {
      await sendContactNotification(request);
      await saveContactRequest(request);
      res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        res.status(503).json({ error: "The contact form is temporarily unavailable. Please try again shortly." });
        return;
      }
      console.error("[contact] Submission failed:", error);
      res.status(502).json({ error: "We could not send your message. Please try again shortly." });
    }
  },
);
