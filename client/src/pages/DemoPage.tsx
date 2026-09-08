/* Silverline Systems reminder: a demo request earns its fields. Enough context to
 * prepare a working session — role, scale, interest — and nothing gratuitous. */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { api, ApiError } from "@/lib/api/client";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { CONTACT_TOPICS, DemoRequestSchema } from "@shared/schemas";

const EMPTY = { name: "", email: "", company: "", role: "", companySize: "", product: "", message: "", preferredDate: "" };

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

export default function DemoPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    track(FUNNEL_EVENTS.demoStarted, { from: "demo-page" });
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

  const set = (field: keyof typeof EMPTY, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = DemoRequestSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      await api.submitDemo(parsed.data);
      setSubmitted(true);
      track(FUNNEL_EVENTS.demoSubmitted, { from: "demo-page", product: parsed.data.product || "unspecified" });
    } catch (requestError) {
      setSubmitError(
        requestError instanceof ApiError ? requestError.message : "We could not send your request. Please try again shortly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="detail-site">
      <SEO path="/demo" />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">DEMO</p>
            <h1>
              Walk through one
              <br />
              <em>real decision.</em>
            </h1>
            <p className="section-page-intro">
              A working session with the Cortex team — your context, your constraints, no slideware.
            </p>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / DEMO<small>30 minutes, working session</small>
            </span>
          </div>
        </section>

        <section className="form-section" data-reveal>
          <div className="detail-rail">REQUEST</div>
          <div className="form-panel">
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon">
                  <Check size={24} />
                </div>
                <p className="eyebrow">REQUEST RECEIVED</p>
                <h2>
                  Session <em>requested.</em>
                </h2>
                <p>We’ll confirm a time shortly. Meanwhile, see how other teams frame the hard question.</p>
                <div className="form-success-actions">
                  <Link href="/resources/case-studies" className="button-dark">
                    Read case studies <ArrowRight size={16} />
                  </Link>
                  <Link href="/platform" className="text-link">
                    Explore the platform <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="contact-modal-heading">
                  <p className="eyebrow">BOOK A WORKING SESSION</p>
                  <h2>
                    Tell us about <span>your system.</span>
                  </h2>
                </div>
                <div className="contact-fields">
                  <label>
                    Full name
                    <input value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Your name" autoComplete="name" />
                    {errors.name && <small>{errors.name}</small>}
                  </label>
                  <label>
                    Work email
                    <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} placeholder="you@company.com" autoComplete="email" />
                    {errors.email && <small>{errors.email}</small>}
                  </label>
                  <label>
                    Company
                    <input value={form.company} onChange={(event) => set("company", event.target.value)} placeholder="Company name" autoComplete="organization" />
                    {errors.company && <small>{errors.company}</small>}
                  </label>
                  <label>
                    Role
                    <input value={form.role} onChange={(event) => set("role", event.target.value)} placeholder="e.g. VP Operations" autoComplete="organization-title" />
                    {errors.role && <small>{errors.role}</small>}
                  </label>
                  <label>
                    Company size
                    <select value={form.companySize} onChange={(event) => set("companySize", event.target.value)}>
                      <option value="">Select a range</option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} people
                        </option>
                      ))}
                    </select>
                    {errors.companySize && <small>{errors.companySize}</small>}
                  </label>
                  <label>
                    Product interest
                    <select value={form.product} onChange={(event) => set("product", event.target.value)}>
                      <option value="">Where should we focus?</option>
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                    {errors.product && <small>{errors.product}</small>}
                  </label>
                  <label className="contact-message-field">
                    Which decision should we walk through?
                    <textarea rows={4} value={form.message} onChange={(event) => set("message", event.target.value)} placeholder="One decision your team needs to make better." />
                    {errors.message && <small>{errors.message}</small>}
                  </label>
                  <label className="contact-message-field">
                    Preferred timing
                    <input value={form.preferredDate} onChange={(event) => set("preferredDate", event.target.value)} placeholder="e.g. next week, mornings IST" />
                    {errors.preferredDate && <small>{errors.preferredDate}</small>}
                  </label>
                </div>
                {submitError && (
                  <p className="waitlist-form-error" role="alert">
                    {submitError}
                  </p>
                )}
                <div className="contact-modal-footer">
                  <span>We confirm every session by email.</span>
                  <button className="button-primary" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Request demo <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
