import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Lazy 3D: the WebGL bundle (Three.js + R3F) loads only when the hero mounts,
// keeping the critical path light. The gradient fallback covers load time.
const HeroScene = lazy(() => import("@/three/HeroScene"));
import {
  ArrowRight,
  ArrowDownRight,
  X,
  Search,
  Sparkles,
  Menu,
  CalendarDays,
  Check,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  FileText,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { products as catalogProducts, caseStudies as catalogCaseStudies } from "@/lib/cortexContent";

const asset = {
  mark: "/assets/cortex-mark.svg",
  caseStudy: "/assets/cortex-case-editorial.svg",
  insights: "/assets/cortex-ops-infrastructure.svg",
};

const searchItems = [
  { label: "Product", title: "Workflo", href: "/product/workflo" },
  { label: "Product", title: "Nexus", href: "/product/nexus" },
  { label: "Product", title: "ASTRA", href: "/product/astra" },
  { label: "Platform", title: "How Cortex works", href: "/platform" },
  { label: "AI Core", title: "AI Core — documentation assistant", href: "#aicore" },
  { label: "Case study", title: "Northstar Health: shared language for complexity", href: "/case-study/northstar-health" },
  { label: "Case study", title: "Vela Financial: a living risk picture", href: "/case-study/vela-financial" },
  { label: "Case study", title: "Aster Works: confidence while the window is open", href: "/case-study/aster-works" },
  { label: "Documentation", title: "Architecture overview", href: "/docs" },
  { label: "Insight", title: "The operating system is not the dashboard", href: "/#insights" },
  { label: "Company", title: "Investor and press center", href: "/company" },
];

const products = catalogProducts.map((p) => ({
  slug: p.slug,
  name: p.name,
  status: p.status,
  flows: p.capabilities,
  accent: "#4E7EF0",
}));

const caseStudies = catalogCaseStudies.map((c) => ({
  slug: c.slug,
  company: c.company,
  sector: c.sector,
  quote: c.quote,
  image: c.image,
}));

function highlightMatch(text: string, query: string) {
  const term = query.trim();
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "ig"));
  return parts.map((part, index) => part.toLowerCase() === term.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part);
}

export default function Home() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("cortex-recent-searches") || "[]"); } catch { return []; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiCoreOpen, setAiCoreOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [aiCoreTyping, setAiCoreTyping] = useState(false);
  const [aiCoreFollowUps, setAiCoreFollowUps] = useState(["Which product fits our operating model?", "Where should I start in the docs?", "Explain Cortex Sense"]);
  const [aiCoreInput, setAiCoreInput] = useState("");
  const [aiCoreReply, setAiCoreReply] = useState("Ask AI Core about a product, platform concept, or documentation path.");
  const [aiCoreSource, setAiCoreSource] = useState({ label: "Documentation overview", href: "/docs" });
  const [navScrolled, setNavScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", role: "", companySize: "", product: "", message: "", timing: "" });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitError, setContactSubmitError] = useState("");

  const systemRef = useRef<HTMLDivElement>(null);
  const sysProgress = useScrollProgress(systemRef, 6);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const heroProgress = useScrollProgress(heroSectionRef, 1);

  const filteredSearch = searchItems.filter((item) => !query.trim() || `${item.label} ${item.title}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groupedSearch = filteredSearch.reduce<Record<string, typeof searchItems>>((groups, item) => {
    (groups[item.label] ??= []).push(item);
    return groups;
  }, {});

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setAiCoreOpen(false);
        setAskOpen(false);
        setContactOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || aiCoreOpen || contactOpen || askOpen || mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen, aiCoreOpen, contactOpen, askOpen, mobileOpen]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setNavScrolled(scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("contact") === "1") {
      setContactSubmitted(false);
      setContactErrors({});
      setContactOpen(true);
      window.history.replaceState({}, "", "/#contact");
    }
  }, []);

  const nextCase = () => setCaseIndex((i) => (i + 1) % caseStudies.length);
  const previousCase = () => setCaseIndex((i) => (i - 1 + caseStudies.length) % caseStudies.length);

  const openContact = () => {
    setContactSubmitted(false);
    setContactSubmitting(false);
    setContactErrors({});
    setContactSubmitError("");
    setContactOpen(true);
  };

  const closeContact = () => {
    setContactOpen(false);
    setContactSubmitted(false);
    setContactSubmitting(false);
    setContactSubmitError("");
  };

  const rememberSearch = (title: string) => {
    setRecentSearches((prev) => {
      const next = [title, ...prev.filter((t) => t !== title)].slice(0, 5);
      window.localStorage.setItem("cortex-recent-searches", JSON.stringify(next));
      return next;
    });
  };

  const askAiCore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = aiCoreInput.trim();
    if (!prompt || aiCoreTyping) return;
    const lower = prompt.toLowerCase();
    const docCtx = [
      { k: ["workflo", "signal", "context"], a: "Workflo connects operational signals into a shared context so teams can investigate what changed and why it matters.", s: { label: "Workflo product guide", href: "/docs" } },
      { k: ["nexus", "decision", "evidence"], a: "Nexus turns a complex question into an evidence-backed decision path with visible trade-offs, owners, and next actions.", s: { label: "Nexus decision paths guide", href: "/docs" } },
      { k: ["astra", "workflow", "repeat"], a: "ASTRA codifies proven operating patterns into governed workflows that travel across functions without flattening local expertise.", s: { label: "ASTRA workflow governance guide", href: "/docs" } },
      { k: ["platform", "architecture", "integration", "sandbox"], a: "The Cortex platform connects the systems teams already trust, creates a shared operating context, and routes decisions into governed workflows.", s: { label: "Platform foundations guide", href: "/docs" } },
      { k: ["docs", "documentation", "api", "sdk"], a: "Start with the documentation foundations for core concepts, then move into APIs, SDKs, integrations, and trust and governance.", s: { label: "Documentation overview", href: "/docs" } },
    ];
    const grounded = docCtx.find((entry) => entry.k.some((keyword) => lower.includes(keyword)));
    const fallbackReply = grounded?.a || "AI Core can answer from the Cortex platform guides, including product fit, platform foundations, integrations, workflows, and documentation paths.";
    const fallbackSource = grounded?.s || { label: "Documentation overview", href: "/docs" };
    const fallbackFollowUps = lower.includes("sense") ? ["How does Sense connect signals?", "Show me the Sense foundations.", "What should we instrument first?"] : lower.includes("decide") ? ["How are decision trails governed?", "Compare Decide and Sense.", "Where do I start in the docs?"] : lower.includes("platform") || lower.includes("docs") ? ["Show platform foundations.", "How do integrations work?", "Explain Cortex governance."] : ["Which product fits our operating model?", "Where should I start in the docs?", "Explain Cortex Sense"];

    setAiCoreTyping(true);
    setAiCoreInput("");
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      if (!res.ok) throw new Error(`ai chat responded ${res.status}`);
      const data = (await res.json()) as { reply?: string; source?: { label: string; href: string }; followUps?: string[] };
      setAiCoreReply(data.reply || fallbackReply);
      setAiCoreSource(data.source || fallbackSource);
      setAiCoreFollowUps(data.followUps?.length ? data.followUps : fallbackFollowUps);
    } catch {
      setAiCoreReply(fallbackReply);
      setAiCoreSource(fallbackSource);
      setAiCoreFollowUps(fallbackFollowUps);
    } finally {
      setAiCoreTyping(false);
    }
  };

  const submitContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim()) errors.name = "Please enter your name.";
    const normEmail = contactForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail)) errors.email = "Enter a valid work email.";
    if (!contactForm.company.trim()) errors.company = "Please enter your company.";
    if (!contactForm.message.trim() || contactForm.message.trim().length < 20) errors.message = "Tell us the decision or problem you're facing (min 20 chars).";
    setContactErrors(errors);
    setContactSubmitError("");
    if (Object.keys(errors).length) return;

    setContactSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contactForm, email: normEmail }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "We could not send your message. Please try again shortly.");
      setContactSubmitted(true);
    } catch (err) {
      setContactSubmitError(err instanceof Error ? err.message : "We could not send your message. Please try again shortly.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="cx-site">
      {/* Header */}
      <header className={`cx-header ${navScrolled ? "is-scrolled" : ""}`} id="top">
        <a className="brand" href="#top" aria-label="Cortex home">
          <span className="brand-mark-shell"><img src={asset.mark} alt="" className="brand-mark" /></span>
          <span className="brand-wordmark">CORTEX</span>
        </a>
        <nav className="cx-nav" aria-label="Primary navigation">
          <a href="/platform" onClick={() => setMobileOpen(false)}>Platform</a>
          <a href="/product" onClick={() => setMobileOpen(false)}>Products</a>
          <a href="/docs" onClick={() => setMobileOpen(false)}>Resources</a>
          <a href="/company" onClick={() => setMobileOpen(false)}>Company</a>
        </nav>
        <div className="cx-actions">
          <button className="cx-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={16} /></button>
          <div className="cx-ask">
            <button className="cx-icon-btn" onClick={() => setAskOpen(!askOpen)} aria-label="Ask Cortex" aria-expanded={askOpen}><Sparkles size={16} /></button>
            {askOpen && (
              <div className="cx-ask-panel" role="menu">
                <div className="eyebrow">ASK CORTEX</div>
                <a href="/product/workflo" role="menuitem" onClick={() => setAskOpen(false)}>Explore Workflo <ArrowRight size={14} /></a>
                <a href="/product/nexus" role="menuitem" onClick={() => setAskOpen(false)}>Explore Nexus <ArrowRight size={14} /></a>
                <a href="/product/astra" role="menuitem" onClick={() => setAskOpen(false)}>Explore ASTRA <ArrowRight size={14} /></a>
                <a href="/platform" role="menuitem" onClick={() => setAskOpen(false)}>Explore Architecture <ArrowRight size={14} /></a>
                <a href="/docs" role="menuitem" onClick={() => setAskOpen(false)}>View Documentation <ArrowRight size={14} /></a>
                <a href="/sales" role="menuitem" onClick={() => { setAskOpen(false); openContact(); }}>Talk to Cortex <ArrowRight size={14} /></a>
              </div>
            )}
          </div>
          <a href="/sales" className="button-primary" onClick={(e) => { e.preventDefault(); openContact(); }}>Talk to Cortex <ArrowRight size={14} /></a>
          <button className="cx-menu-btn cx-icon-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <div className={`fixed inset-x-0 top-0 z-40 border-b border-[#161B23] bg-[#050609] ${mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"} transition-all duration-300`}>
        <nav className="px-6 py-6 space-y-4" aria-label="Mobile navigation">
          <a href="/platform" className="block text-base font-medium tracking-wider uppercase text-[#A9B1BC] hover:text-[#F4F6F8] transition-colors" onClick={() => setMobileOpen(false)}>Platform</a>
          <a href="/product" className="block text-base font-medium tracking-wider uppercase text-[#A9B1BC] hover:text-[#F4F6F8] transition-colors" onClick={() => setMobileOpen(false)}>Products</a>
          <a href="/docs" className="block text-base font-medium tracking-wider uppercase text-[#A9B1BC] hover:text-[#F4F6F8] transition-colors" onClick={() => setMobileOpen(false)}>Resources</a>
          <a href="/company" className="block text-base font-medium tracking-wider uppercase text-[#A9B1BC] hover:text-[#F4F6F8] transition-colors" onClick={() => setMobileOpen(false)}>Company</a>
        </nav>
      </div>

      <main>
        {/* 01 HERO */}
        <section ref={heroSectionRef} className="cx-hero" id="hero">
          <div className="cx-hero-scene">
            <Suspense fallback={null}>
              <HeroScene scrollProgress={heroProgress.progress} />
            </Suspense>
          </div>
          <div className="cx-hero-inner">
            <div className="cx-kicker">CORTEX</div>
            <h1>Clarity for<em>critical</em> systems.</h1>
            <p className="cx-hero-sub">The intelligence layer for teams building critical systems. See the signal. Understand the context. Make the decision.</p>
            <div className="cx-hero-ctas">
              <button className="button-primary" onClick={openContact}>Book a Demo <ArrowDownRight size={17} /></button>
              <a href="/platform" className="button-dark">Explore Platform <ArrowRight size={16} /></a>
            </div>
          </div>
          <div className="cx-hud tl"><span>SYS</span><br /><span>SIGNAL</span></div>
          <div className="cx-hud tr"><span>CTX</span><br /><span>CORE</span></div>
          <div className="cx-hud bl"><span>STATUS</span><br /><span>LIVE</span></div>
          <div className="cx-hud br"><span>MODE</span><br /><span>AUTO</span></div>
          <div className="cx-scroll-cue"><span>SCROLL</span><i /></div>
        </section>

        {/* 02 STATEMENT */}
        <section className="cx-section cx-statement" id="statement">
          <div className="cx-sec-label"><span>STATEMENT</span><i /></div>
          <h2>Complexity doesn't<br />need more data.<span>It needs better context.</span></h2>
          <p>Operational noise is not a data deficit. It's a context deficit. Cortex gives critical-system teams the shared operating picture they need to move from signal to decision without losing the thread.</p>
        </section>

        {/* 03 INTELLIGENCE SYSTEM */}
        <section ref={systemRef} className="cx-system" id="system">
          <div className="cx-system-track">
            <div className="cx-system-stage">
              <div className="cx-system-copy">
                <div className="cx-sec-label"><span>INTELLIGENCE SYSTEM</span><i /></div>
                <h2>Signal → Context → Decision</h2>
                <ul className="cx-system-steps" role="list">
                  {["SIGNAL", "CONTEXT", "REASONING", "SIMULATION", "DECISION", "EVIDENCE"].map((step, i) => (
                    <li key={step} className={sysProgress.step >= i ? "is-active" : ""}>
                      <b>0{step === "EVIDENCE" ? "6" : i + 1}</b>
                      <strong>{step}</strong>
                      <p>
                        {step === "SIGNAL" && "Ingest and unify every operational feed"}
                        {step === "CONTEXT" && "Build the shared operating picture across teams"}
                        {step === "REASONING" && "Trace relationships and causal chains automatically"}
                        {step === "SIMULATION" && "Run counterfactuals before committing"}
                        {step === "DECISION" && "Route the call to the right owner with evidence"}
                        {step === "EVIDENCE" && "Seal the decision with an auditable receipt"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cx-system-visual">
                <div className="cx-system-orb" style={{ opacity: 0.85 + sysProgress.progress * 0.15 }}>
                  <div className="cx-system-ring" />
                  <div className="cx-system-ring" />
                  <div className="cx-system-ring" />
                  <div className="cx-system-core" style={{ transform: `rotate(${sysProgress.progress * 180}deg) scale(${0.9 + sysProgress.progress * 0.1})` }} />
                </div>
                <div className="cx-system-readout">SYS / {["INGEST", "UNIFY", "TRACE", "SIMULATE", "DECIDE", "SEAL"][sysProgress.step]}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 PRODUCT CAPABILITIES */}
        {products.map((p, i) => (
          <section key={p.slug} className="cx-chapter" id={`product-${p.slug}`} style={{ ['--p-accent']: p.accent } as React.CSSProperties}>
            <div className="cx-chapter-copy">
              <div className="cx-sec-label"><span>PRODUCT</span><i /></div>
              <span className={`cx-chapter-status ${p.status === "Early access" ? "is-early" : "is-soon"}`}>{p.status}</span>
              <h3>{p.name}</h3>
              <p>{p.flows.slice(0, -1).join(" → ")} → <em>{p.flows[p.flows.length - 1]}</em></p>
              <div className="cx-chapter-flow">
                {p.flows.map((f, fi) => (
                  <span key={f} className="cx-flow-node">{f}</span>
                ))}
              </div>
              <a href={`/product/${p.slug}`} className="button-primary">Explore {p.name} <ArrowRight size={16} /></a>
            </div>
            <div className="cx-chapter-visual">
              <div className="cx-grid" />
              <div className="cx-chapter-slab" style={{ borderTopColor: p.accent }} />
              <div className="cx-chapter-tag">{p.name.toUpperCase()}</div>
            </div>
          </section>
        ))}

        {/* 05 PLATFORM MAP */}
        <section className="cx-section cx-platform" id="platform">
          <div className="cx-sec-label"><span>PLATFORM</span><i /></div>
          <h2>One intelligence layer. Three execution engines.</h2>
          <div className="cx-map">
            <div className="cx-map-core">CORTEX CORE</div>
            <div className="cx-map-stem" />
            <div className="cx-map-branches">
              <div className="cx-map-branch"><b>Workflo</b><em>EXECUTION</em><p>Code → Sandbox → Execution → Hash → Receipt</p></div>
              <div className="cx-map-branch"><b>Nexus</b><em>OPERATIONS</em><p>Data → World State → Graph → Signals → Simulation → Decision</p></div>
              <div className="cx-map-branch"><b>ASTRA</b><em>ENGINEERING</em><p>Mission → Requirements → Architectures → Trade-offs → Plan</p></div>
            </div>
          </div>
        </section>

        {/* 06 USE CASES */}
        <section className="cx-section cx-cases" id="cases">
          <div className="cx-sec-label"><span>USE CASES</span><i /></div>
          <div className="cx-cases-head">
            <h2>Critical systems. Real outcomes.</h2>
          </div>
          <div className="cx-cases">
            <div className="cx-case-tabs" role="tablist">
              {caseStudies.map((c, i) => (
                <button
                  key={c.slug}
                  role="tab"
                  aria-selected={caseIndex === i}
                  className={`cx-case-tab ${caseIndex === i ? "is-active" : ""}`}
                  onClick={() => setCaseIndex(i)}
                >
                  <b>{c.company}</b>
                  <span>{c.sector}</span>
                </button>
              ))}
            </div>
            <div className="cx-case-panel" role="tabpanel">
              <div className="cx-case-panel-img" style={{ backgroundImage: `url(${caseStudies[caseIndex].image})` }} />
              <div className="cx-case-panel-body">
                <div className="eyebrow">{caseStudies[caseIndex].sector}</div>
                <blockquote>"{caseStudies[caseIndex].quote}"</blockquote>
                <div className="cx-case-metrics">
                  <div><strong>Shared context</strong><span>across functions</span></div>
                  <div><strong>Faster decisions</strong><span>at scale</span></div>
                </div>
                <a href={`/case-study/${caseStudies[caseIndex].slug}`} className="button-dark">Read the full case study <ArrowRight size={16} /></a>
              </div>
            </div>
          </div>
        </section>

        {/* 07 DOCUMENTATION & RESOURCES */}
        <section className="cx-section" id="docs">
          <div className="cx-sec-label"><span>RESOURCES</span><i /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
            <a href="/docs" className="button-dark" style={{ textAlign: "left", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={24} style={{ color: "#4E7EF0" }} />
                <span className="eyebrow">DOCUMENTATION</span>
              </div>
              <strong style={{ fontSize: "1.25rem", fontFamily: '"Space Grotesk", sans-serif' }}>Platform foundations</strong>
              <small style={{ color: "#858C96" }}>Core concepts, mental models, and the Cortex system map</small>
            </a>
            <a href="/docs" className="button-dark" style={{ textAlign: "left", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BrainCircuit size={24} style={{ color: "#4E7EF0" }} />
                <span className="eyebrow">BUILD</span>
              </div>
              <strong style={{ fontSize: "1.25rem", fontFamily: '"Space Grotesk", sans-serif' }}>Build with Cortex</strong>
              <small style={{ color: "#858C96" }}>APIs, SDKs, and practical implementation patterns</small>
            </a>
            <a href="/docs" className="button-dark" style={{ textAlign: "left", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={24} style={{ color: "#4E7EF0" }} />
                <span className="eyebrow">GOVERNANCE</span>
              </div>
              <strong style={{ fontSize: "1.25rem", fontFamily: '"Space Grotesk", sans-serif' }}>Trust & governance</strong>
              <small style={{ color: "#858C96" }}>Security, permissions, and operating controls</small>
            </a>
            <a href="/company" className="button-dark" style={{ textAlign: "left", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={24} style={{ color: "#4E7EF0" }} />
                <span className="eyebrow">COMPANY</span>
              </div>
              <strong style={{ fontSize: "1.25rem", fontFamily: '"Space Grotesk", sans-serif' }}>Investor center</strong>
              <small style={{ color: "#858C96" }}>The long view on intelligent operations</small>
            </a>
            <a href="/company" className="button-dark" style={{ textAlign: "left", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={24} style={{ color: "#4E7EF0" }} />
                <span className="eyebrow">PRESS</span>
              </div>
              <strong style={{ fontSize: "1.25rem", fontFamily: '"Space Grotesk", sans-serif' }}>Press center</strong>
              <small style={{ color: "#858C96" }}>Company facts, media assets, and selected coverage</small>
            </a>
          </div>
        </section>

        {/* 08 INSIGHTS */}
        <section className="cx-section" id="insights">
          <div className="cx-sec-label"><span>INSIGHTS</span><i /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
            <article style={{ border: "1px solid #1C2129", background: "#0A0D11", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", textDecoration: "none", color: "inherit" }}>
              <div className="eyebrow" style={{ color: "#4E7EF0" }}>FIELD NOTE</div>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: "1.5rem", margin: 0 }}>The operating system is not the dashboard</h3>
              <p style={{ color: "#858C96", margin: 0 }}>Why critical-system teams need shared context, not more dashboards.</p>
              <a href="/#insights" className="text-link" style={{ alignSelf: "flex-start" }}>Read insight <ArrowRight size={16} /></a>
            </article>
            <article style={{ border: "1px solid #1C2129", background: "#0A0D11", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", textDecoration: "none", color: "inherit" }}>
              <div className="eyebrow" style={{ color: "#4E7EF0" }}>BRIEFING</div>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: "1.5rem", margin: 0 }}>Five signals that your data stack is becoming a bottleneck</h3>
              <p style={{ color: "#858C96", margin: 0 }}>Identify the early warnings before complexity stalls the mission.</p>
              <a href="/#insights" className="text-link" style={{ alignSelf: "flex-start" }}>Read insight <ArrowRight size={16} /></a>
            </article>
            <article style={{ border: "1px solid #1C2129", background: "#0A0D11", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", textDecoration: "none", color: "inherit" }}>
              <div className="eyebrow" style={{ color: "#4E7EF0" }}>PERSPECTIVE</div>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: "1.5rem", margin: 0 }}>Why high-performing teams design for the handoff</h3>
              <p style={{ color: "#858C96", margin: 0 }}>The best operators optimize for the moment the context changes hands.</p>
              <a href="/#insights" className="text-link" style={{ alignSelf: "flex-start" }}>Read insight <ArrowRight size={16} /></a>
            </article>
          </div>
        </section>

        {/* 09 INTERACTIVE ARCHITECTURE EXPLORER */}
        <section className="cx-section" id="architecture">
          <div className="cx-sec-label"><span>ARCHITECTURE</span><i /></div>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <p style={{ color: "#A9B1BC", maxWidth: "60ch", marginBottom: "40px" }}>Explore the Cortex intelligence stack layer by layer. Each node reveals purpose, inputs, outputs, and dependencies.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {[
                { label: "SIGNALS", desc: "Ingest & unify every operational feed", href: "/docs" },
                { label: "WORLD STATE", desc: "Build the shared operating picture", href: "/docs" },
                { label: "GRAPH", desc: "Trace relationships & causal chains", href: "/docs" },
                { label: "SIGNALS", desc: "Flowing context across the stack", href: "/docs" },
                { label: "AGENTS", desc: "Autonomous reasoning & simulation", href: "/docs" },
                { label: "SIMULATION", desc: "Run counterfactuals before committing", href: "/docs" },
                { label: "POLICY", desc: "Governance, permissions, audit", href: "/docs" },
                { label: "DECISION", desc: "Route the call with evidence", href: "/docs" },
              ].map((node, i) => (
                <a key={node.label} href={node.href} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", border: "1px solid #1C2129", background: "#0A0D11", textDecoration: "none", color: "inherit", transition: "border-color .2s ease, transform .2s ease" }}>
                  <strong style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "1.25rem", color: "#4E7EF0" }}>{node.label}</strong>
                  <small style={{ color: "#858C96" }}>{node.desc}</small>
                  <span style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#4E7EF0", fontSize: "12px" }}>Explore <ArrowRight size={14} /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 10 CTA */}
        <section className="cx-cta" id="contact">
          <hr className="cx-cta-rule" />
          <h2>Let's build<em>the right system.</em></h2>
          <button className="button-primary" onClick={openContact}>Talk to Cortex <ArrowRight size={16} /></button>
        </section>
      </main>

      {/* Footer */}
      <footer className="cx-footer">
        <div className="cx-footer-grid">
          <div className="cx-footer-brand">
            <div className="brand">
              <span className="brand-mark-shell"><img src={asset.mark} alt="" className="brand-mark" /></span>
              <span className="brand-wordmark">CORTEX</span>
            </div>
            <p>Clarity for critical systems.</p>
          </div>
          <div className="cx-footer-col"><span>Platform</span><a href="/platform">How it works</a><a href="/platform">Integrations</a><a href="/platform">Security</a><a href="/platform">Changelog</a></div>
          <div className="cx-footer-col"><span>Products</span><a href="/product/workflo">Workflo</a><a href="/product/nexus">Nexus</a><a href="/product/astra">ASTRA</a></div>
          <div className="cx-footer-col"><span>Resources</span><a href="/docs">Documentation</a><a href="/#cases">Case Studies</a><a href="/#insights">Insights</a><a href="/docs">API Reference</a></div>
          <div className="cx-footer-col"><span>Company</span><a href="/company">About</a><a href="/company">Careers</a><a href="/company">Press</a><a href="/sales">Contact</a></div>
        </div>
        <div className="cx-footer-bottom">
          <span>© {new Date().getFullYear()} Cortex Systems, Inc.</span>
          <span>Privacy <span style={{ color: "#161B23" }}> / </span> Terms</span>
          <span>Made for the moments that matter.</span>
        </div>
      </footer>

      {/* Modals */}
      {searchOpen && (
        <div className="overlay-shell search-overlay-shell" role="dialog" aria-modal="true" aria-label="Global search">
          <div className="search-modal">
            <div className="search-modal-top">
              <span className="eyebrow">GLOBAL SEARCH</span>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button>
            </div>
            <div className="search-input-wrap">
              <Search size={21} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Cortex" />
            </div>
            {!query.trim() && recentSearches.length > 0 && (
              <div className="recent-searches">
                <div className="recent-search-list">{recentSearches.map((item) => <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>)}</div>
              </div>
            )}
            <div className="search-results">
              {filteredSearch.length ? Object.entries(groupedSearch).map(([category, items]) => (
                <div className="search-category" key={category}>
                  <div className="search-category-label">{category}</div>
                  {items.map((item) => (
                    <a href={item.href} key={item.title} onClick={(e) => {
                      rememberSearch(item.title);
                      if (item.label === "AI Core") { e.preventDefault(); setSearchOpen(false); setAiCoreOpen(true); }
                      else { setSearchOpen(false); }
                    }}>
                      <strong>{highlightMatch(item.title, query)}</strong>
                      <ArrowRight size={14} />
                    </a>
                  ))}
                </div>
              )) : (
                <div className="search-empty">No results yet. Try a product, platform, insight, or report.</div>
              )}
            </div>
            <div className="search-modal-foot"><span>Select a result</span><span>Press Enter to open</span></div>
          </div>
        </div>
      )}

      {aiCoreOpen && (
        <div className="overlay-shell aicore-shell" role="dialog" aria-modal="true" aria-label="AI Core assistant">
          <div className="aicore-panel">
            <button className="modal-close" onClick={() => setAiCoreOpen(false)} aria-label="Close AI Core"><X size={20} /></button>
            <div className="aicore-heading">
              <div className="eyebrow">AI CORE</div>
              <h2>Ask the system<em>clearly.</em></h2>
              <p>A compact Cortex assistant for finding the right product, platform concept, or next step.</p>
            </div>
            <div className="aicore-reply">
              <span>AI CORE</span>
              {aiCoreTyping ? <div className="aicore-typing" role="status" aria-label="AI Core is typing"><i /><i /><i /></div> : (
                <>
                  <p>{aiCoreReply}</p>
                  <a className="aicore-source" href={aiCoreSource.href}><BookOpen size={14} /> Source: {aiCoreSource.label} <ArrowRight size={14} /></a>
                </>
              )}
            </div>
            <form className="aicore-form" onSubmit={askAiCore}>
              <input value={aiCoreInput} onChange={(e) => setAiCoreInput(e.target.value)} placeholder="Ask AI Core" aria-label="Ask AI Core" />
              <button className="button-primary" type="submit">Ask <ArrowRight size={16} /></button>
            </form>
            <div className="aicore-suggestions">{aiCoreFollowUps.map((f) => <button key={f} type="button" onClick={() => setAiCoreInput(f)}>{f}</button>)}</div>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="overlay-shell contact-modal-shell" role="dialog" aria-modal="true" aria-label="Talk to Cortex">
          <div className="contact-modal">
            <button className="modal-close" onClick={closeContact} aria-label="Close contact form"><X size={20} /></button>
            {contactSubmitted ? (
              <div className="contact-success">
                <div className="success-icon"><Check size={24} /></div>
                <div className="eyebrow">MESSAGE RECEIVED</div>
                <h2>Your working session has been added to the Cortex intake queue.</h2>
                <p>Pick a product to explore while we prepare the session.</p>
                <div className="cx-success-actions">
                  {products.map((p) => (
                    <a key={p.slug} href={`/product/${p.slug}`} className="button-primary">Explore {p.name} <ArrowRight size={14} /></a>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={submitContact} noValidate>
                <div className="contact-modal-heading">
                  <div className="eyebrow">START A CONVERSATION</div>
                  <h2>Bring us the hard question.</h2>
                  <p>We'll make the first conversation useful.</p>
                </div>
                {contactSubmitError && <div className="contact-submit-error" role="alert">{contactSubmitError}</div>}
                <div className="contact-fields">
                  <label><span>Name</span><input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} aria-invalid={contactErrors.name ? "true" : "false"} /></label>
                  <label><span>Email</span><input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} aria-invalid={contactErrors.email ? "true" : "false"} /></label>
                  <label className="contact-product-field"><span>Company</span><input type="text" value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} aria-invalid={contactErrors.company ? "true" : "false"} /></label>
                  <label><span>Role</span><input type="text" value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} /></label>
                  <label><span>Company size</span><input type="text" value={contactForm.companySize} onChange={(e) => setContactForm({ ...contactForm, companySize: e.target.value })} placeholder="e.g., 200-500" /></label>
                  <label className="contact-product-field"><span>Product</span>
                    <select value={contactForm.product} onChange={(e) => setContactForm({ ...contactForm, product: e.target.value })}>
                      <option value="">Select a product</option>
                      {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                    </select>
                  </label>
                  <label className="contact-message-field"><span>Decision / problem</span>
                    <textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows={5} placeholder="Describe the decision you're facing or the problem you need to solve..." aria-invalid={contactErrors.message ? "true" : "false"} />
                  </label>
                  <label className="contact-product-field"><span>Preferred timing</span>
                    <select value={contactForm.timing} onChange={(e) => setContactForm({ ...contactForm, timing: e.target.value })}>
                      <option value="">Select timing</option>
                      <option value="this-week">This week</option>
                      <option value="next-2-weeks">Next 2 weeks</option>
                      <option value="this-month">This month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </label>
                </div>
                {contactErrors.message && <div className="contact-submit-error" role="alert">{contactErrors.message}</div>}
                <div className="contact-modal-footer">
                  <button className="button-primary" type="submit" disabled={contactSubmitting}>
                    {contactSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Sending...</> : <>Send request <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}