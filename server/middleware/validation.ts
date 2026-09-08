/* Silverline Systems reminder: validate at the boundary, fail with guidance.
 * Zod schemas live in shared/schemas.ts so client and server parse identically. */

import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/** Validate req.body against a Zod schema; attach parsed data as req.validated. */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const first = result.error.issues[0];
      const message = first?.message || "Please check your submission and try again.";
      res.status(400).json({ error: message });
      return;
    }
    (req as Request & { validated?: T }).validated = result.data;
    next();
  };
}

export function validated<T>(req: Request): T {
  return (req as Request & { validated: T }).validated;
}
