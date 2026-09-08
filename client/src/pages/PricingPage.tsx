/* Silverline Systems reminder: pricing is a decision aid, not a price list. Three
 * clear paths, honest scope on each, and every CTA leads somewhere useful. */

import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { faqJsonLd } from "@/lib/seo/structuredData";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";

const TIERS = [
  {
    name: "Pilot",
    price: "Scoped",
    unit: "per engagement",
    body: "One decision, one team, one system. Prove the operating picture before you scale it.",
    points: ["Single use case, scoped together", "Workflo early access", "Guided onboarding", "Outcome review at 6 weeks"],
    cta: { label: "Start with a pilot", href: "/demo" },
    featured: false,
  },
  {
    name: "Platform",
    price: "Annual",
    unit: "per organization",
    body: "The intelligence layer for the teams behind your critical systems.",
    points: ["Workflo + Nexus as released", "Unlimited viewers, governed editors", "Integrations and API access", "Trust & governance controls"],
    cta: { label: "Book a working session", href: "/demo" },
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "tailored agreement",
    body: "For regulated, multi-region, or mission-critical operations.",
    points: ["Everything in Platform", "ASTRA workflow governance", "Dedicated success architect", "Custom security review & DPA"],
    cta: { label: "Talk to Cortex", href: "/contact" },
    featured: false,
  },
];

const FAQS = [
  {
    question: "Is Workflo generally available?",
    answer:
      "Workflo is in early access. Join the waitlist or start a pilot to get your team in with guided onboarding.",
  },
  {
    question: "When will Nexus and ASTRA be available?",
    answer:
      "Nexus and ASTRA are coming soon. Platform and Enterprise agreements include them as they are released.",
  },
  {
    question: "Do you offer self-hosting?",
    answer:
      "Deployment options are scoped per organization. Bring your constraints to a working session and we will design around them.",
  },
  {
    question: "How does billing work?",
    answer:
      "Marketing pricing stays simple on purpose: scoped pilots, annual platform agreements, and custom enterprise terms. Detailed billing lives in the product, not on this page.",
  },
];

export default function PricingPage() {
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="detail-site">
      <SEO path="/pricing" jsonLd={faqJsonLd(FAQS)} />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">PRICING</p>
            <h1>
              Start small,
              <br />
              <em>scale deliberately.</em>
            </h1>
            <p className="section-page-intro">
              Pilot, Platform, and Enterprise paths. Every engagement starts with one working session.
            </p>
            <Link
              href="/demo"
              className="button-primary"
              onClick={() => track(FUNNEL_EVENTS.demoStarted, { from: "pricing-hero" })}
            >
              Book a working session <ArrowRight size={16} />
            </Link>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / PRICING<small>pilot / platform / enterprise</small>
            </span>
          </div>
        </section>

        <section className="pricing-tiers" data-reveal>
          {TIERS.map((tier) => (
            <article className={`pricing-card ${tier.featured ? "is-featured" : ""}`} key={tier.name}>
              <p className="eyebrow">{tier.name.toUpperCase()}</p>
              <div className="pricing-price">
                <strong>{tier.price}</strong>
                <span>{tier.unit}</span>
              </div>
              <p>{tier.body}</p>
              <ul>
                {tier.points.map((point) => (
                  <li key={point}>
                    <Check size={15} /> {point}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={tier.featured ? "button-primary" : "button-dark"}
                onClick={() => track(FUNNEL_EVENTS.demoStarted, { from: `pricing-${tier.name.toLowerCase()}` })}
              >
                {tier.cta.label} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </section>

        <section className="section-page-list" data-reveal>
          <div className="detail-rail">QUESTIONS</div>
          <div className="section-page-list-copy">
            <p className="eyebrow">STRAIGHT ANSWERS</p>
            <h2>
              Asked <span>often.</span>
            </h2>
            <div className="pricing-faq">
              {FAQS.map((faq) => (
                <div key={faq.question}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
