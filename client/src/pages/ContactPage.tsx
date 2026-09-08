/* Silverline Systems reminder: a contact page is a working brief, not a wall of
 * fields. Five inputs, clear validation, one decisive action. */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { api, ApiError } from "@/lib/api/client";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { CONTACT_TOPICS, ContactRequestSchema } from "@shared/schemas";

const EMPTY = { name: "", email: "", company: "", product: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    track(FUNNEL_EVENTS.contactStarted, { from: "contact-page" });
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
    const parsed = ContactRequestSchema.safeParse(form);
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
      await api.submitContact(parsed.data);
      setSubmitted(true);
      track(FUNNEL_EVENTS.contactSubmitted, { from: "contact-page", topic: parsed.data.product || "unspecified" });
    } catch (requestError) {
      setSubmitError(
        requestError instanceof ApiError ? requestError.message : "We could not send your message. Please try again shortly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="detail-site">
      <SEO path="/contact" />
      <SiteHeader cta={{ label: "Book a demo", href: "/demo" }} />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">CONTACT</p>
            <h1>
              Bring us the
              <br />
              <em>hard question.</em>
            </h1>
            <p className="section-page-intro">
              Tell us where complexity is slowing the work. We’ll make the first conversation useful.
            </p>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / CONTACT<small>we respond shortly</small>
            </span>
          </div>
        </section>

        <section className="form-section" data-reveal>
          <div className="detail-rail">MESSAGE</div>
          <div className="form-panel">
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon">
                  <Check size={24} />
                </div>
                <p className="eyebrow">MESSAGE RECEIVED</p>
                <h2>
                  We’ll be in touch <em>shortly.</em>
                </h2>
                <p>Thanks for the context. Meanwhile, explore the platform or book a working session.</p>
                <div className="form-success-actions">
                  <Link href="/demo" className="button-primary">
                    Book a demo <ArrowRight size={16} />
                  </Link>
                  <Link href="/platform" className="text-link">
                    Explore the platform <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="contact-modal-heading">
                  <p className="eyebrow">START A CONVERSATION</p>
                  <h2>
                    Tell us what <span>you’re building.</span>
                  </h2>
                </div>
                <div className="contact-fields">
                  <label>
                    Name
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
                  <label className="contact-product-field">
                    What would you like to discuss?
                    <select value={form.product} onChange={(event) => set("product", event.target.value)}>
                      <option value="">Choose a product or service</option>
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                    {errors.product && <small>{errors.product}</small>}
                  </label>
                  <label className="contact-message-field">
                    What are you working on?
                    <textarea rows={5} value={form.message} onChange={(event) => set("message", event.target.value)} placeholder="A sentence or two is perfect — twenty characters minimum." />
                    {errors.message && <small>{errors.message}</small>}
                  </label>
                </div>
                {submitError && (
                  <p className="waitlist-form-error" role="alert">
                    {submitError}
                  </p>
                )}
                <div className="contact-modal-footer">
                  <span>Prefer email? hello@cortex.systems</span>
                  <button className="button-primary" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send message <ArrowRight size={16} />
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
