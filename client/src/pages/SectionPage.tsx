import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, Building2, Check, FileText, LoaderCircle, Mail, ShieldCheck, Sparkles, X } from "lucide-react";
import { products } from "@/lib/cortexContent";

const pageContent = {
  platform: { eyebrow: "PLATFORM", title: "The intelligence layer beneath the work.", intro: "Connect the systems you already trust. Give every team the context to move.", variant: "stack" as const, links: [{ label: "Architecture overview", body: "How Cortex connects signal, context, and action." }, { label: "Trust & governance", body: "Permissions, controls, and an auditable operating model." }, { label: "Integration patterns", body: "Bring Cortex into the systems your teams already use." }] },
  docs: { eyebrow: "DOCUMENTATION", title: "A clear path from question to capability.", intro: "Start with the mental model. Go deep when you need to.", variant: "grid" as const, links: [{ label: "Platform foundations", body: "Core concepts and the Cortex system map." }, { label: "Build with Cortex", body: "APIs, SDKs, and practical implementation patterns." }, { label: "Trust & governance", body: "Security, permissions, and operating controls." }] },
  sales: { eyebrow: "SALES", title: "Bring us the hard question.", intro: "Tell us where complexity is slowing the work. We’ll make the first conversation useful.", variant: "orb" as const, links: [{ label: "Book a working session", body: "Walk through one decision your team needs to make better." }, { label: "Explore your use case", body: "See how Cortex fits your operating context." }, { label: "Talk to an operator", body: "Meet the team behind the system." }] },
  company: { eyebrow: "COMPANY", title: "Built for the moments that matter.", intro: "Cortex helps the teams behind critical systems see clearly and move with confidence.", variant: "orb" as const, links: [{ label: "Insights", body: "Ideas for the next system." }, { label: "Investor center", body: "The long view on intelligent operations." }, { label: "Press center", body: "Company facts, media assets, and selected coverage." }] },
};

type WaitlistForm = { name: string; email: string; company: string };
type WaitlistState = "idle" | "submitting" | "success" | "error";

export default function SectionPage({ type }: { type: keyof typeof pageContent | "product" }) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  if (type === "product") return <ProductOverview />;
  const content = pageContent[type];
  return <div className="detail-site section-page"><SectionPageHeader /><main><section className="section-page-hero" data-reveal><div className="section-page-copy"><Link href="/" className="back-link"><ArrowLeft size={15} /> Cortex home</Link><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="section-page-intro">{content.intro}</p>{type === "sales" ? <a href="/?contact=1#contact" className="button-primary">Start a conversation <ArrowRight size={16} /></a> : <a href="#explore" className="button-dark">Explore {type} <ArrowRight size={16} /></a>}</div><div className="section-page-visual plain-surface"><span className="visual-readout">CORTEX / {type.toUpperCase()}<small>clarity, context, action</small></span></div></section><section id="explore" className="section-page-list" data-reveal><div className="detail-rail">EXPLORE</div><div className="section-page-list-copy"><p className="eyebrow">{type === "docs" ? "START HERE" : "THE SYSTEM"}</p><h2>{type === "sales" ? "A useful first step." : "One system. Clearer moves."}</h2><div className="page-link-list">{content.links.map((item) => <a href={type === "sales" ? "/?contact=1#contact" : `/#${type}`} key={item.label}><div><strong>{item.label}</strong><small>{item.body}</small></div><ArrowRight size={16} /></a>)}</div></div></section></main><SectionPageFooter /></div>;
}

function ProductOverview() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistState, setWaitlistState] = useState<WaitlistState>("idle");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistForm, setWaitlistForm] = useState<WaitlistForm>({ name: "", email: "", company: "" });

  useEffect(() => {
    document.body.style.overflow = waitlistOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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

  return <div className="detail-site section-page"><SectionPageHeader /><main><section className="section-page-hero" data-reveal><div className="section-page-copy"><Link href="/" className="back-link"><ArrowLeft size={15} /> Cortex home</Link><p className="eyebrow">PRODUCT</p><h1>Meet the products<br /><em>behind the work.</em></h1><p className="section-page-intro">Workflo, Nexus, and ASTRA. Three products, one intelligence layer.</p><Link href="/sales" className="button-primary">Talk to Cortex <ArrowRight size={16} /></Link></div><div className="section-page-visual product-overview-visual plain-surface"><span className="visual-readout">CORTEX / PRODUCT SYSTEM<small>workflo / nexus / astra</small></span></div></section><section className="section-page-list" data-reveal><div className="detail-rail">PRODUCTS</div><div className="section-page-list-copy"><p className="eyebrow">THE PRODUCT SYSTEM</p><h2>Choose the product<br /><span>you need next.</span></h2><div className="product-overview-links">{products.map((product) => product.slug === "workflo" ? <button type="button" className="product-overview-card" onClick={openWaitlist} key={product.slug}><span className={`product-status ${product.status === "Early access" ? "is-early-access" : "is-coming-soon"}`}>{product.status}</span><strong>{product.name}</strong><small>{product.intro}</small><span className="product-card-action">Join the waitlist <ArrowRight size={18} /></span></button> : <Link className="product-overview-card" href={`/product/${product.slug}`} key={product.slug}><span className={`product-status ${product.status === "Early access" ? "is-early-access" : "is-coming-soon"}`}>{product.status}</span><strong>{product.name}</strong><small>{product.intro}</small><span className="product-card-action">Explore {product.name} <ArrowRight size={18} /></span></Link>)}</div></div></section></main>{waitlistOpen && <div className="overlay-shell waitlist-modal-shell" role="dialog" aria-modal="true" aria-label="Join the Workflo early access waitlist" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWaitlist(); }}><div className="waitlist-modal"><button className="modal-close" type="button" onClick={closeWaitlist} aria-label="Close Workflo waitlist"><X size={20} /></button>{waitlistState === "success" ? <div className="contact-success"><div className="success-icon"><Check size={24} /></div><p className="eyebrow">REQUEST RECEIVED</p><h2>You’re on the<br /><em>Workflo list.</em></h2><p>Thanks for your interest. We’ll follow up with early-access details soon.</p><button type="button" className="button-dark" onClick={closeWaitlist}>Back to products <ArrowRight size={16} /></button></div> : <form onSubmit={submitWaitlist}><div className="contact-modal-heading"><p className="eyebrow">WORKFLO / EARLY ACCESS</p><h2>Get early access<br /><span>to Workflo.</span></h2><p>Tell us where Workflo could help your team see the system more clearly.</p></div><div className="contact-fields waitlist-fields"><label>Full name<input required autoComplete="name" value={waitlistForm.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your name" /></label><label>Work email<input required type="email" autoComplete="email" value={waitlistForm.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@company.com" /></label><label className="waitlist-company-field">Company<input autoComplete="organization" value={waitlistForm.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Company name" /></label></div>{waitlistState === "error" && <p className="waitlist-form-error" role="alert">{waitlistError}</p>}<div className="contact-modal-footer"><span><Mail size={15} /> We’ll review your request shortly.</span><button className="button-primary" type="submit" disabled={waitlistState === "submitting"}>{waitlistState === "submitting" ? <><LoaderCircle size={16} className="animate-spin" /> Sending...</> : <>Request early access <ArrowRight size={16} /></>}</button></div></form>}</div></div>}<SectionPageFooter /></div>;
}

function SectionPageHeader() { return <header className="detail-header"><Link href="/" className="brand"><span className="brand-mark-shell"><img src="/assets/cortex-mark.svg" alt="" className="brand-mark" /></span><span className="brand-wordmark">CORTEX</span></Link><nav className="detail-nav"><Link href="/product">Product</Link><Link href="/platform">Platform</Link><Link href="/docs">Docs</Link><Link href="/company">Company</Link></nav><a href="/?contact=1#contact" className="detail-header-cta">Talk to Cortex <ArrowRight size={15} /></a></header>; }
function SectionPageFooter() { return <footer className="detail-footer"><div><span className="brand-wordmark">CORTEX</span><p>Clarity for critical systems.</p></div><Link href="/">Return to the home page <ArrowRight size={15} /></Link><span>© Cortex Systems, Inc.</span></footer>; }
