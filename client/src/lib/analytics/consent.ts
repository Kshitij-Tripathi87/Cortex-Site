/* Silverline Systems reminder: consent is a visible contract. Essential always runs;
 * everything else waits for an explicit choice the visitor can withdraw anytime.
 */

export type ConsentCategory = "analytics" | "marketing" | "preferences";

export type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  decidedAt: string;
  version: 1;
};

const STORAGE_KEY = "cortex-consent-v1";

const DEFAULTS: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
  decidedAt: "",
  version: 1,
};

function parseStored(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== 1 || !parsed.decidedAt) return null;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      preferences: Boolean(parsed.preferences),
      decidedAt: String(parsed.decidedAt),
      version: 1,
    };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  return parseStored(window.localStorage.getItem(STORAGE_KEY));
}

export function writeConsent(choices: Record<ConsentCategory, boolean>): ConsentState {
  const state: ConsentState = {
    ...DEFAULTS,
    ...choices,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent<ConsentState>("cortex:consent", { detail: state }));
  return state;
}

export function onConsentChange(listener: (state: ConsentState) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<ConsentState>).detail);
  window.addEventListener("cortex:consent", handler);
  return () => window.removeEventListener("cortex:consent", handler);
}

/** Do-not-track is honored as an analytics opt-out regardless of stored choice. */
export function analyticsAllowed(state: ConsentState | null): boolean {
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return false;
  return state?.analytics === true;
}
