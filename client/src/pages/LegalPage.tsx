/* Silverline Systems reminder: legal pages are trust surfaces — indexed sections,
 * calm editorial measure, and an honest review date on every document. */

import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Scale } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { LEGAL_DOCS, legalDoc } from "@/lib/legal";
import { openConsentPreferences } from "@/components/ConsentBanner";

function useReveal() {
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
}

export default function LegalPage({ slug }: { slug?: string }) {
  const [, navigate] = useLocation();
  useReveal();

  if (!slug) return <LegalIndex />;

  const doc = legalDoc(slug);
  useEffect(() => {
    if (!doc) navigate("/404");
  }, [doc, navigate]);
  if (!doc) return null;

  const path = `/legal/${doc.slug}`;
  return (
    <div className="detail-site">
      <SEO path={path} />
      <SiteHeader />
      <main>
        <section className="section-page-hero legal-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/legal" className="back-link">
              <ArrowLeft size={15} /> Legal index
            </Link>
            <p className="eyebrow">LEGAL / {doc.title.toUpperCase()}</p>
            <h1>{doc.title}.</h1>
            <p className="section-page-intro">{doc.intro}</p>
            <p className="legal-updated">Last reviewed: {doc.updated}</p>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / LEGAL<small>reviewed {doc.updated.toLowerCase()}</small>
            </span>
          </div>
        </section>

        <article className="legal-body" data-reveal>
          <div className="detail-rail">DOCUMENT</div>
          <div className="legal-prose">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>
            ))}
            <div className="legal-actions">
              {doc.slug === "cookies" && (
                <button type="button" className="button-dark" onClick={openConsentPreferences}>
                  Open cookie preferences <ArrowRight size={16} />
                </button>
              )}
              <Link href="/contact" className="text-link">
                Questions? Talk to Cortex <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function LegalIndex() {
  return (
    <div className="detail-site">
      <SEO path="/legal" />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">LEGAL</p>
            <h1>
              Trust, in
              <br />
              <em>writing.</em>
            </h1>
            <p className="section-page-intro">
              The policies behind the platform — privacy, terms, cookies, acceptable use, and AI terms.
            </p>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / LEGAL<small>privacy / terms / cookies / use / ai</small>
            </span>
          </div>
        </section>

        <section className="section-page-list" data-reveal>
          <div className="detail-rail">DOCUMENTS</div>
          <div className="section-page-list-copy">
            <p className="eyebrow">THE INDEX</p>
            <h2>
              Five documents,
              <br />
              <span>one standard.</span>
            </h2>
            <div className="page-link-list">
              {LEGAL_DOCS.map((doc) => (
                <Link key={doc.slug} href={`/legal/${doc.slug}`}>
                  <div>
                    <strong>{doc.title}</strong>
                    <small>Reviewed {doc.updated}</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
              <div className="legal-index-note">
                <Scale size={15} />
                <p>
                  These pages describe our current processing and will be finalized with counsel, including DPDP
                  compliance for India.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
