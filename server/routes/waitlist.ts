/* Silverline Systems reminder: early access is a relationship, not a spreadsheet
 * row. Confirm fast, notify reliably, store durably. */

import { Router } from "express";
import { WaitlistSchema, type WaitlistInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendWaitlistNotification } from "../services/email";
import { newId, saveWaitlistSignup } from "../services/store";

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

    try {
      await sendWaitlistNotification(signup);
      await saveWaitlistSignup(signup);
      res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
        res.status(503).json({ error: "The waitlist is temporarily unavailable. Please try again shortly." });
        return;
      }
      console.error("[waitlist] Submission failed:", error);
      res.status(502).json({ error: "We could not send your request. Please try again shortly." });
    }
  },
);
