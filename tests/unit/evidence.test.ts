import { describe, expect, it } from "vitest";
import { publishedEvidence } from "../../shared/evidence";
const row = {
  slug: "test-only",
  type: "resource",
  title: "Test fixture",
  body: "Synthetic test data, not a published Cortex measurement.",
  published_at: "2026-09-09T00:00:00Z",
  metadata: {
    kind: "benchmark",
    product: "nexus",
    value: "42",
    unit: "ms",
    environment: "Test fixture",
    measuredAt: "2026-09-09",
    methodology: "Synthetic unit test",
    limitations: "Not a real benchmark",
    sourceUrl: "https://example.com/test-only",
  },
};
const envelope = (entry: unknown) => ({
  ok: true,
  source: "supabase",
  entries: [entry],
});
describe("evidence publication boundary", () => {
  it("requires complete provenance", () =>
    expect(publishedEvidence(envelope(row))).toHaveLength(1));
  it("does not turn static fallback content into measurements", () =>
    expect(publishedEvidence({ ...envelope(row), source: "static" })).toEqual(
      []
    ));
  it("rejects missing methodology", () =>
    expect(
      publishedEvidence(
        envelope({ ...row, metadata: { ...row.metadata, methodology: "" } })
      )
    ).toEqual([]));
  it("rejects unpublished entries", () =>
    expect(publishedEvidence(envelope({ ...row, published_at: null }))).toEqual(
      []
    ));
  it("rejects unsafe links", () =>
    expect(
      publishedEvidence(
        envelope({
          ...row,
          metadata: { ...row.metadata, sourceUrl: "javascript:alert(1)" },
        })
      )
    ).toEqual([]));
  it("handles unavailable content", () =>
    expect(publishedEvidence(null)).toEqual([]));
});
