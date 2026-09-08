import { z } from "zod";
/** A CMS resource only enters the evidence register when provenance is complete.
 * Publication is an editorial assertion, not an automatic verification result. */
export const EvidenceResourceSchema = z.object({
  slug: z.string().min(1),
  type: z.literal("resource"),
  title: z.string().min(1),
  body: z.string().min(1),
  published_at: z.string().datetime({ offset: true }),
  metadata: z.object({
    kind: z.literal("benchmark"),
    product: z.enum(["workflo", "nexus", "astra"]),
    value: z.string().min(1).max(30),
    unit: z.string().max(30),
    environment: z.string().min(1),
    measuredAt: z.string().date(),
    methodology: z.string().min(1),
    limitations: z.string().min(1),
    sourceUrl: z
      .string()
      .url()
      .refine(
        value => new URL(value).protocol === "https:",
        "Evidence sources must use HTTPS"
      ),
  }),
});
export type EvidenceResource = z.infer<typeof EvidenceResourceSchema>;
export function publishedEvidence(input: unknown): EvidenceResource[] {
  const envelope = z
    .object({
      ok: z.literal(true),
      source: z.literal("supabase"),
      entries: z.array(z.unknown()),
    })
    .safeParse(input);
  if (!envelope.success) return [];
  return envelope.data.entries.flatMap(entry => {
    const parsed = EvidenceResourceSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}
