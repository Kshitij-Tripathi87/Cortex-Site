/* Silverline Systems reminder: status is a promise kept in public. One glance tells
 * the story; details are one honest check-list below. */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { api } from "@/lib/api/client";

type StatusPayload = {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  environment: string;
  checks: Record<string, string>;
};

const CHECK_LABELS: Record<string, string> = {
  website: "Marketing website",
  intakeForms: "Contact, demo & waitlist intake",
  aiCore: "AI Core assistant",
  database: "Data layer",
};

function checkTone(value: string): "ok" | "warn" {
  return value === "operational" ? "ok" : "warn";
}

function checkLabel(value: string): string {
  if (value === "operational") return "Operational";
  if (value === "degraded") return "Degraded";
  if (value === "local-fallback") return "Local mode";
  return value;
}

export default function StatusPage() {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.status();
      setPayload(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const operational = payload?.status === "operational";

  return (
    <div className="detail-site">
      <SEO path="/status" noIndex />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">STATUS</p>
            <h1>
              {loading ? "Checking…" : operational ? "All systems" : "Systems"}
              <br />
              <em>{loading ? "standing by." : operational ? "operational." : "see below."}</em>
            </h1>
            <p className="section-page-intro">
              Live operating status of the Cortex marketing platform. The product status will live here too once
              app.cortex.com launches.
            </p>
            <button type="button" className="button-dark" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "status-spin" : ""} /> {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / STATUS<small>{payload ? `v${payload.version} / ${payload.environment}` : "connecting"}</small>
            </span>
          </div>
        </section>

        <section className="section-page-list" data-reveal>
          <div className="detail-rail">CHECKS</div>
          <div className="section-page-list-copy">
            <p className="eyebrow">RIGHT NOW</p>
            <h2>
              Component <span>health.</span>
            </h2>
            {error && (
              <p className="waitlist-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="status-list">
              {payload ? (
                Object.entries(payload.checks).map(([key, value]) => (
                  <div className="status-row" key={key}>
                    <span className={`status-dot is-${checkTone(value)}`} aria-hidden="true" />
                    <div>
                      <strong>{CHECK_LABELS[key] ?? key}</strong>
                      <small>
                        {key === "database" && value === "local-fallback"
                          ? "Running on local storage until Supabase is provisioned."
                          : key === "aiCore" && value === "degraded"
                            ? "Answering from grounded documentation fallback."
                            : key === "intakeForms" && value === "degraded"
                              ? "Email delivery not configured — submissions are stored locally."
                              : `Last checked ${new Date(payload.timestamp).toLocaleTimeString()}`}
                      </small>
                    </div>
                    <span className={`status-state is-${checkTone(value)}`}>{checkLabel(value)}</span>
                  </div>
                ))
              ) : (
                <p className="status-empty">{loading ? "Contacting the status endpoint…" : "No status available."}</p>
              )}
            </div>
            <Link href="/contact" className="text-link">
              Something looks wrong? Tell us <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
