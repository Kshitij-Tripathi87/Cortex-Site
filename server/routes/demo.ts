/* Issue #5/#20: demo submissions persist first; DB enforces atomic idempotency. */

import { Router } from "express";
import { DemoRequestSchema, type DemoRequestInput } from "../../shared/schemas";
import { apiLimiters } from "../middleware/rateLimit";
import { validateBody, validated } from "../middleware/validation";
import { EMAIL_CONFIG_MISSING, sendDemoNotification } from "../services/email";
import { newId, saveDemoRequest, submissionHash, isDuplicateDemo, markDemoNotification } from "../services/store";

export const demoRouter = Router();
function isUniqueConflict(error: string | undefined): boolean { return Boolean(error && (error.includes("23505") || error.toLowerCase().includes("duplicate key"))); }

demoRouter.post("/demo", apiLimiters.write(), validateBody(DemoRequestSchema), async (req, res) => {
  const input = validated<DemoRequestInput>(req);
  const request = { id: newId("dm"), name: input.name, email: input.email, company: input.company, role: input.role ?? "", companySize: input.companySize ?? "", product: input.product ?? "", message: input.message ?? "", preferredDate: input.preferredDate ?? "", submittedAt: new Date().toISOString() };
  const hash = submissionHash(input.email, input.message ?? "", input.product ?? "");
  if (await isDuplicateDemo(input.email, hash)) { res.status(200).json({ ok: true, duplicate: true }); return; }
  const result = await saveDemoRequest(request, hash);
  if (!result.success && !isUniqueConflict(result.error)) { console.error("[demo] Persistence failed — notification suppressed:", result.error); res.status(502).json({ error: "We could not save your request. Please try again shortly." }); return; }
  try {
    await sendDemoNotification(request, `cortex-demo-${hash}`);
    await markDemoNotification(input.email, hash, "sent");
    res.status(200).json({ ok: true, duplicate: !result.success });
  } catch (error) {
    if (error instanceof Error && error.message === EMAIL_CONFIG_MISSING) console.warn("[demo] Notification config missing; submission remains persisted.");
    else console.error("[demo] Notification delivery failed; submission remains persisted:", error);
    await markDemoNotification(input.email, hash, "failed");
    res.status(200).json({ ok: true, emailPending: true, duplicate: !result.success });
  }
});
