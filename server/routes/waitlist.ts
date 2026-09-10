/* Issue #5: waitlist submissions persist before notification; retries are idempotent. */

import { Router } from "express";
import { WaitlistSchema, type WaitlistInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendWaitlistNotification } from "../services/email";
import { newId, saveWaitlistSignup, submissionHash, isDuplicateWaitlist, markWaitlistNotification } from "../services/store";

export const waitlistRouter = Router();

waitlistRouter.post("/waitlist", apiLimiters.write(), validateBody(WaitlistSchema), async (req, res) => {
  const input = validated<WaitlistInput>(req);
  const signup = {
    id: newId("wf"),
    name: input.name,
    email: input.email,
    company: input.company ?? "",
    submittedAt: new Date().toISOString(),
  };
  const hash = submissionHash(input.email, input.name, input.company ?? "");

  if (await isDuplicateWaitlist(input.email, hash)) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  const result = await saveWaitlistSignup(signup, hash);
  if (!result.success) {
    console.error("[waitlist] Persistence failed — notification suppressed:", result.error);
    res.status(502).json({ error: "We could not save your request. Please try again shortly." });
    return;
  }

  try {
    await sendWaitlistNotification(signup, `cortex-waitlist-${hash}`);
    await markWaitlistNotification(input.email, hash, "sent");
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) {
      console.warn("[waitlist] Notification configuration missing; submission remains persisted.");
    } else {
      console.error("[waitlist] Notification delivery failed; submission remains persisted:", error);
    }
    await markWaitlistNotification(input.email, hash, "failed");
    res.status(200).json({ ok: true, emailPending: true });
  }
});
