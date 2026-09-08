/* Silverline Systems reminder: measure the funnel, respect the visitor. Events are
 * first-party, consent-gated, and fire-and-forget — analytics must never slow
 * the page or break the experience. */

import type { AnalyticsEventName } from "@shared/schemas";
import { analyticsAllowed, readConsent } from "./consent";

export type { AnalyticsEventName };

export const FUNNEL_EVENTS = {
  pageView: "page_view",
  heroCta: "hero_cta_clicked",
  productViewed: "product_viewed",
  demoStarted: "demo_started",
  demoSubmitted: "demo_submitted",
  contactStarted: "contact_started",
  contactSubmitted: "contact_submitted",
  waitlistSubmitted: "waitlist_submitted",
  newsletterSubscribed: "newsletter_subscribed",
  resourceDownloaded: "resource_downloaded",
  aiOpened: "ai_opened",
  aiQuestion: "ai_question",
  aiFollowup: "ai_followup_clicked",
} as const satisfies Record<string, AnalyticsEventName>;

type Utm = { source: string; medium: string; campaign: string; term: string; content: string };

let cachedUtm: Utm | null = null;
let sessionId: string | null = null;

function readUtm(): Utm {
  if (cachedUtm) return cachedUtm;
  const empty: Utm = { source: "", medium: "", campaign: "", term: "", content: "" };
  if (typeof window === "undefined") return empty;
  try {
    // Persist first-touch UTM for the session so attribution survives navigation.
    const stored = window.sessionStorage.getItem("cortex-utm");
    if (stored) {
      const utm: Utm = { ...empty, ...(JSON.parse(stored) as Partial<Utm>) };
      cachedUtm = utm;
      return utm;
    }
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {
      source: params.get("utm_source") ?? "",
      medium: params.get("utm_medium") ?? "",
      campaign: params.get("utm_campaign") ?? "",
      term: params.get("utm_term") ?? "",
      content: params.get("utm_content") ?? "",
    };
    window.sessionStorage.setItem("cortex-utm", JSON.stringify(utm));
    cachedUtm = utm;
    return utm;
  } catch {
    return empty;
  }
}

function readSessionId(): string {
  if (sessionId) return sessionId;
  try {
    const key = "cortex-session";
    const stored = window.sessionStorage.getItem(key);
    if (stored) {
      sessionId = stored;
      return stored;
    }
    sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(key, sessionId);
    return sessionId;
  } catch {
    return "unknown";
  }
}

export function track(
  event: AnalyticsEventName,
  properties: Record<string, string | number | boolean> = {},
): void {
  try {
    if (!analyticsAllowed(readConsent())) return;
    const payload = {
      event,
      page: window.location.pathname,
      referrer: document.referrer || "",
      sessionId: readSessionId(),
      properties,
      occurredAt: new Date().toISOString(),
      utm: readUtm(),
    };
    const body = JSON.stringify(payload);
    // sendBeacon survives page unload; fall back to fetch when unavailable.
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics", blob)) return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics failures are silent by design.
  }
}

export function trackPageView(path: string): void {
  track("page_view", { path });
}
