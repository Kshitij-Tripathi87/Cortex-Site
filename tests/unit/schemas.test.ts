/* Foundation tests: the shared Zod boundary. If these fail, forms and APIs disagree. */

import { describe, expect, it } from "vitest";
import {
  AiChatSchema,
  AnalyticsEventSchema,
  ContactRequestSchema,
  DemoRequestSchema,
  NewsletterSchema,
  WaitlistSchema,
} from "../../shared/schemas";
import { REDIRECTS, SITE_ROUTES, resolveRedirect } from "../../shared/site";

describe("ContactRequestSchema", () => {
  it("accepts a complete, valid submission", () => {
    const result = ContactRequestSchema.safeParse({
      name: "Asha Rao",
      email: "asha@example.com",
      company: "Northstar",
      product: "Workflo",
      message: "We need a shared operating picture across three sites.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short messages and bad emails", () => {
    const result = ContactRequestSchema.safeParse({
      name: "Asha",
      email: "not-an-email",
      company: "Northstar",
      message: "too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown topics", () => {
    const result = ContactRequestSchema.safeParse({
      name: "Asha",
      email: "asha@example.com",
      company: "Northstar",
      product: "Death Star",
      message: "This message is long enough to pass the length check.",
    });
    expect(result.success).toBe(false);
  });
});

describe("WaitlistSchema", () => {
  it("accepts name + email, company optional", () => {
    expect(WaitlistSchema.safeParse({ name: "Jo", email: "jo@example.com" }).success).toBe(true);
  });

  it("normalizes email case", () => {
    const result = WaitlistSchema.safeParse({ name: "Jo", email: "JO@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jo@example.com");
  });
});

describe("DemoRequestSchema", () => {
  it("accepts a full demo request", () => {
    const result = DemoRequestSchema.safeParse({
      name: "Dev Menon",
      email: "dev@example.com",
      company: "Vela",
      role: "VP Ops",
      companySize: "51-200",
      product: "Nexus",
      message: "Walk us through a capacity decision.",
      preferredDate: "next week",
    });
    expect(result.success).toBe(true);
  });

  it("requires company", () => {
    const result = DemoRequestSchema.safeParse({ name: "Dev", email: "dev@example.com", company: "" });
    expect(result.success).toBe(false);
  });
});

describe("NewsletterSchema", () => {
  it("accepts an email with default source", () => {
    const result = NewsletterSchema.safeParse({ email: "reader@example.com" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.source).toBe("website");
  });
});

describe("AiChatSchema", () => {
  it("rejects empty and oversized prompts", () => {
    expect(AiChatSchema.safeParse({ prompt: "" }).success).toBe(false);
    expect(AiChatSchema.safeParse({ prompt: "x".repeat(2001) }).success).toBe(false);
    expect(AiChatSchema.safeParse({ prompt: "What is Workflo?" }).success).toBe(true);
  });
});

describe("AnalyticsEventSchema", () => {
  it("accepts known events with defaults", () => {
    const result = AnalyticsEventSchema.safeParse({ event: "demo_submitted" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe("");
      expect(result.data.properties).toEqual({});
    }
  });

  it("rejects unknown events", () => {
    expect(AnalyticsEventSchema.safeParse({ event: "buy_now" }).success).toBe(false);
  });
});

describe("site IA", () => {
  it("every sitemap route has a title and description", () => {
    for (const route of SITE_ROUTES.filter((r) => r.sitemap)) {
      expect(route.title.length).toBeGreaterThan(0);
      expect(route.description.length).toBeGreaterThan(0);
    }
  });

  it("legacy product paths redirect to canonical products", () => {
    expect(resolveRedirect("/product")).toBe("/products");
    expect(resolveRedirect("/product/sense")).toBe("/products/workflo");
    expect(resolveRedirect("/products/decide")).toBe("/products/nexus");
    expect(resolveRedirect("/nope")).toBeNull();
    expect(Object.keys(REDIRECTS).length).toBeGreaterThan(0);
  });
});
