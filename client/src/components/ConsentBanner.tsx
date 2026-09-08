/* Silverline Systems reminder: the consent banner is a control, not a dark pattern.
 * Equal-weight choices, plain language, and a persistent way to change your mind.
 */

import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { readConsent, writeConsent, type ConsentCategory, type ConsentState } from "@/lib/analytics/consent";

const CATEGORIES: { id: ConsentCategory; label: string; body: string }[] = [
  {
    id: "analytics",
    label: "Analytics",
    body: "First-party, privacy-conscious measurement of pages and funnels. No cross-site tracking.",
  },
  {
    id: "preferences",
    label: "Preferences",
    body: "Remembers choices like recent searches and AI Core context on this device.",
  },
  {
    id: "marketing",
    label: "Marketing",
    body: "Campaign attribution (UTM) so we know which outreach earned your visit.",
  },
];

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [choices, setChoices] = useState<Record<ConsentCategory, boolean>>({
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    setVisible(readConsent() === null);
    const reopen = () => {
      const current = readConsent();
      if (current) {
        setChoices({ analytics: current.analytics, marketing: current.marketing, preferences: current.preferences });
      }
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener("cortex:open-consent", reopen);
    return () => window.removeEventListener("cortex:open-consent", reopen);
  }, []);

  if (!visible) return null;

  const save = (next: Record<ConsentCategory, boolean>) => {
    const state: ConsentState = writeConsent(next);
    setChoices({ analytics: state.analytics, marketing: state.marketing, preferences: state.preferences });
    setVisible(false);
    setCustomizing(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true, preferences: true });
  const rejectAll = () => save({ analytics: false, marketing: false, preferences: false });

  return (
    <div className="consent-shell" role="dialog" aria-modal="false" aria-label="Cookie and privacy choices">
      <div className="consent-card">
        <button className="consent-dismiss" onClick={rejectAll} aria-label="Dismiss and accept essential only">
          <X size={16} />
        </button>
        <p className="eyebrow">
          <ShieldCheck size={13} /> YOUR PRIVACY
        </p>
        <h2>Essential only, unless you say otherwise.</h2>
        <p>
          Cortex runs on essential storage. Analytics, preferences, and marketing attribution stay off until you
          enable them. Read the <a href="/legal/cookies">Cookie Policy</a> and{" "}
          <a href="/legal/privacy">Privacy Policy</a>.
        </p>

        {customizing && (
          <div className="consent-options">
            <div className="consent-option is-locked">
              <div>
                <strong>Essential</strong>
                <small>Security, load balancing, and remembering this choice. Always on.</small>
              </div>
              <span>On</span>
            </div>
            {CATEGORIES.map((category) => (
              <label className="consent-option" key={category.id}>
                <div>
                  <strong>{category.label}</strong>
                  <small>{category.body}</small>
                </div>
                <input
                  type="checkbox"
                  checked={choices[category.id]}
                  onChange={(event) => setChoices({ ...choices, [category.id]: event.target.checked })}
                />
              </label>
            ))}
          </div>
        )}

        <div className="consent-actions">
          {customizing ? (
            <>
              <button className="button-dark" onClick={() => save(choices)}>
                Save choices
              </button>
              <button className="button-ghost" onClick={acceptAll}>
                Accept all
              </button>
            </>
          ) : (
            <>
              <button className="button-dark" onClick={rejectAll}>
                Essential only
              </button>
              <button className="button-ghost" onClick={() => setCustomizing(true)}>
                Customize
              </button>
              <button className="button-ghost" onClick={acceptAll}>
                Accept all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Reopen the banner from footers and legal pages. */
export function openConsentPreferences() {
  window.dispatchEvent(new Event("cortex:open-consent"));
}
