import { productDesign, type ProductSlug } from "@/lib/designContent";
import ProductScene from "@/components/3d/ProductScene";
import SectionNumber from "@/components/editorial/SectionNumber";
/* Silverline Systems reminder: section pages are orientation, not destination. Say
 * what this part of the system is for, then hand the reader somewhere useful. */
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Mail, X } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

type PageLink = { label: string; body: string; href?: string };

const pageContent: Record<
  string,
  { eyebrow: string; title: string; intro: string; path: string; links: PageLink[] }
> = {
  platform: {
    eyebrow: "PLATFORM",
    title: "The intelligence layer beneath the work.",
    intro: "Connect the systems you already trust. Give every team the context to move.",
    path: "/platform",
    links: [
      { label: "Architecture overview", body: "How Cortex connects signal, context, and action." },
      { label: "Trust & governance", body: "Permissions, controls, and an auditable operating model.", href: "/security" },
      { label: "Integration patterns", body: "Bring Cortex into the systems your teams already use.", href: "/docs" },
    ],
  },
  solutions: {
    eyebrow: "SOLUTIONS",
    title: "Operating patterns for consequential work.",
    intro: "Start from the problem you own. Cortex meets you with a pattern, not a blank canvas.",
    path: "/solutions",
    links: [
      { label: "Decision readiness", body: "See the conditions around each call before you make it.", href: "/products/nexus" },
      { label: "Shared operating picture", body: "One context across functions, sites, and shifts.", href: "/products/workflo" },
      { label: "Repeatable excellence", body: "Codify what your best teams know into governed workflows.", href: "/products/astra" },
    ],
  },
  industries: {
    eyebrow: "INDUSTRIES",
    title: "Built for systems that can't blink.",
    intro: "Healthcare, financial, and industrial teams decide with Cortex where delay is expensive.",
    path: "/industries",
    links: [
      { label: "Healthcare operations", body: "A shared language for complexity across sites.", href: "/case-study/northstar-health" },
      { label: "Risk & compliance", body: "A living risk picture that review and product both trust.", href: "/case-study/vela-financial" },
      { label: "Industrial systems", body: "Confidence while the response window is still open.", href: "/case-study/aster-works" },
    ],
  },
  security: {
    eyebrow: "SECURITY",
    title: "Enterprise-grade by design.",
    intro: "Security, permissions, and an auditable operating model — not an afterthought.",
    path: "/security",
    links: [
      { label: "Trust & governance", body: "Role-aware permissions and auditable decision trails.", href: "/docs" },
      { label: "Data handling", body: "How Cortex treats your information, in plain language.", href: "/legal/privacy" },
      { label: "Operating controls", body: "Rate limits, approvals, and owner routing on every action.", href: "/platform" },
    ],
  },
  docs: {
    eyebrow: "DOCUMENTATION",
    title: "A clear path from question to capability.",
    intro: "Start with the mental model. Go deep when you need to.",
    path: "/docs",
    links: [
      { label: "Platform foundations", body: "Core concepts and the Cortex system map." },
      { label: "Build with Cortex", body: "APIs, SDKs, and practical implementation patterns." },
      { label: "Trust & governance", body: "Security, permissions, and operating controls.", href: "/security" },
    ],
  },
  sales: {
    eyebrow: "SALES",
    title: "Bring us the hard question.",
    intro: "Tell us where complexity is slowing the work. We’ll make the first conversation useful.",
    path: "/sales",
    links: [
      { label: "Book a working session", body: "Walk through one decision your team needs to make better.", href: "/demo" },
      { label: "Explore your use case", body: "See how Cortex fits your operating context.", href: "/solutions" },
      { label: "Talk to an operator", body: "Meet the team behind the system.", href: "/contact" },
    ],
  },
  company: {
    eyebrow: "COMPANY",
    title: "Built for the moments that matter.",
    intro: "Cortex helps the teams behind critical systems see clearly and move with confidence.",
    path: "/company",
    links: [
      { label: "Insights", body: "Ideas for the next system.", href: "/resources/insights" },
      { label: "Case studies", body: "Selected stories from healthcare, finance, and industry.", href: "/resources/case-studies" },
      { label: "Contact", body: "Start a conversation with the team.", href: "/contact" },
    ],
  },
};

export type SectionType = keyof typeof pageContent | "product";

type WaitlistForm = { name: string; email: string; company: string };
type WaitlistState = "idle" | "submitting" | "success" | "error";

export default function SectionPage({ type }: { type: SectionType }) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  if (type === "product") return <ProductOverview />;
  const content = pageContent[type];
  if (!content) return null;
  const ctaHref = type === "sales" ? "/contact" : type === "security" ? "/docs" : "#explore";
  return (
    <div className="detail-site section-page">
      <SEO path={content.path} />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link"><ArrowLeft size={15} /> Cortex home</Link>
            <p className="eyebrow">{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className="section-page-intro">{content.intro}</p>
            {type === "sales" ? (
              <Link href="/contact" className="button-primary">Start a conversation <ArrowRight size={16} /></Link>
            ) : (
              <a href={ctaHref} className="button-dark">Explore {type} <ArrowRight size={16} /></a>
            )}
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">CORTEX / {type.toUpperCase()}<small>clarity, context, action</small></span>
          </div>
        </section>
        <section id="explore" className="section-page-list" data-reveal>
          <div className="detail-rail">EXPLORE</div>
          <div className="section-page-list-copy">
            <p className="eyebrow">{type === "docs" ? "START HERE" : "THE SYSTEM"}</p>
            <h2>{type === "sales" ? "A useful first step." : "One system. Clearer moves."}</h2>
            <div className="page-link-list">
              {content.links.map((item) => {
                const href = item.href ?? `/#${type}`;
                const internal = href.startsWith("/");
                return internal ? (
                  <Link href={href} key={item.label}>
                    <div><strong>{item.label}</strong><small>{item.body}</small></div>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <a href={href} key={item.label}>
                    <div><strong>{item.label}</strong><small>{item.body}</small></div>
                    <ArrowRight size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductOverview() {
  const waitlistRef = useRef<HTMLDivElement>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistState, setWaitlistState] = useState<WaitlistState>("idle");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistForm, setWaitlistForm] = useState<WaitlistForm>({ name: "", email: "", company: "" });

  useEffect(() => {
    if (!waitlistOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const items = () => Array.from(waitlistRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]') ?? []);
    items()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWaitlistOpen(false);
      if (event.key !== "Tab") return;
      const focusable = items();
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; previous?.focus(); window.removeEventListener("keydown", onKey); };
  }, [waitlistOpen]);

  const openWaitlist = () => {
    setWaitlistState("idle");
    setWaitlistError("");
    setWaitlistOpen(true);
  };

  const closeWaitlist = () => {
    if (waitlistState === "submitting") return;
    setWaitlistOpen(false);
  };

  const updateField = (field: keyof WaitlistForm, value: string) => {
    setWaitlistForm((current) => ({ ...current, [field]: value }));
    if (waitlistState === "error") setWaitlistState("idle");
  };

  const submitWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWaitlistState("submitting");
    setWaitlistError("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waitlistForm),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "We could not submit your request. Please try again.");
      setWaitlistState("success");
    } catch (error) {
      setWaitlistState("error");
      setWaitlistError(error instanceof Error ? error.message : "We could not submit your request. Please try again.");
    }
  };

  return (
    <div className="detail-site section-page cx-page cx-design-page">
      <SEO path="/products" />
      <SiteHeader />
      <main className="cx-page cx-design-page">
        <header className="cx-design-product-hero"><div className="cx-wrap">
          <p className="cx-kicker">001 / The Cortex system</p>
          <h1 style={{ fontSize: "clamp(3rem,8vw,8rem)", maxWidth: "18ch" }}>Three systems.<br />One intelligence layer.</h1>
          <p className="cx-lede">Workflo connects execution to evidence. Nexus maps operational context. ASTRA explores mission trade-offs. Inspect each architecture before discussing a deployment.</p>
        </div></header>
        <section className="cx-section"><div className="cx-wrap">
          {(Object.keys(productDesign) as ProductSlug[]).map((slug, i) => { const product = productDesign[slug]; return <article className="cx-product-chapter" key={slug}>
            <SectionNumber index={String(i + 2).padStart(3, "0")} label={product.category} />
            <h2 className="cx-chapter-name">{product.name}</h2><ProductScene slug={slug} />
            <div className="cx-chapter-copy"><h3 style={{ font: "500 clamp(1.8rem,3vw,3rem)/1.2 var(--cx-display)" }}>{product.headline}</h3><div><p>{product.intro}</p><Link className="cx-text-link" href={`/products/${slug}`}>Explore {product.name} ↗</Link></div></div>
          </article>; })}
          <div className="cx-closing"><SectionNumber index="005" label="Discuss your requirements" /><h2>Start with the<br />system you need.</h2><div className="cx-closing-ctas"><Link href="/contact" className="cx-btn cx-btn-primary">Talk to Cortex ↗</Link><button className="cx-btn cx-btn-ghost" onClick={openWaitlist}>Register interest in Workflo</button></div><p className="cx-kicker">Architecture briefs, not live product consoles.</p></div>
        </div></section>
      </main>
      {waitlistOpen && <div ref={waitlistRef} className="overlay-shell waitlist-modal-shell" role="dialog" aria-modal="true" aria-label="Join the Workflo early access waitlist" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWaitlist(); }}><div className="waitlist-modal"><button className="modal-close" type="button" onClick={closeWaitlist} aria-label="Close Workflo waitlist"><X size={20} /></button>{waitlistState === "success" ? <div className="contact-success"><div className="success-icon"><Check size={24} /></div><p className="eyebrow">REQUEST RECEIVED</p><h2>You’re on the<br /><em>Workflo list.</em></h2><p>Thanks for your interest. We’ll follow up with early-access details soon.</p><button type="button" className="button-dark" onClick={closeWaitlist}>Back to products <ArrowRight size={16} /></button></div> : <form onSubmit={submitWaitlist}><div className="contact-modal-heading"><p className="eyebrow">WORKFLO / EARLY ACCESS</p><h2>Get early access<br /><span>to Workflo.</span></h2><p>Tell us where Workflo could help your team see the system more clearly.</p></div><div className="contact-fields waitlist-fields"><label>Full name<input required autoComplete="name" value={waitlistForm.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" /></label><label>Work email<input required type="email" autoComplete="email" value={waitlistForm.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@company.com" /></label><label className="waitlist-company-field">Company<input autoComplete="organization" value={waitlistForm.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Company name" /></label></div>{waitlistState === "error" && <p className="waitlist-form-error" role="alert">{waitlistError}</p>}<div className="contact-modal-footer"><span><Mail size={15} /> We’ll review your request shortly.</span><button className="button-primary" type="submit" disabled={waitlistState === "submitting"}>{waitlistState === "submitting" ? <><LoaderCircle size={16} className="animate-spin" /> Sending...</> : <>Request early access <ArrowRight size={16} /></>}</button></div></form>}</div></div>}
      <SiteFooter />
    </div>
  );
}
