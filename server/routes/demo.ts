/* Silverline Systems reminder: a demo request is the start of a working session.
 * Capture enough context to make the first call useful — nothing more. */

import { Router } from "express";
import { DemoRequestSchema, type DemoRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendDemoNotification } from "../services/email";
import { newId, saveDemoRequest } from "../services/store";

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

    try {
      await sendDemoNotification(request);
      await saveDemoRequest(request);
      res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        res.status(503).json({ error: "Demo requests are temporarily unavailable. Please try again shortly." });
        return;
      }
      console.error("[demo] Submission failed:", error);
      res.status(502).json({ error: "We could not send your request. Please try again shortly." });
    }
  },
);
