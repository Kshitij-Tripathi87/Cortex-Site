/* Silverline Systems reminder: asymmetric editorial layouts, indexed rules, restrained motion, and cobalt only for signal and action. */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Building2,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleArrowOutUpRight,
  Download,
  FileText,
  Menu,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const asset = {
  mark: "/assets/cortex-mark.svg",
  hero: "/assets/cortex-hero-machine-intelligence.svg",
  platform: "/assets/cortex-platform-sandbox.svg",
  caseStudy: "/assets/cortex-ops-infrastructure.svg",
  insights: "/assets/cortex-ops-infrastructure.svg",
};

const productTabs = [
  {
    id: "workflo",
    eyebrow: "EARLY ACCESS",
    name: "Workflo",
    title: "See the system, not just the signal.",
    body: "Cortex brings fragmented operational data into one continuously legible view—so teams can recognize the meaningful pattern before it becomes a costly surprise.",
    bullets: ["Unify live and historical signals", "Surface root causes, not just alerts", "Create a shared operating picture"],
    stat: "",
    statLabel: "faster issue resolution",
  },
  {
    id: "nexus",
    eyebrow: "COMING SOON",
    name: "Nexus",
    title: "Move from insight to action with context.",
    body: "Turn a question into a decision path. Cortex makes the evidence, trade-offs, and recommended next step visible to the people who need to move.",
    bullets: ["Ask questions in plain language", "Trace every recommendation to evidence", "Route decisions to the right owner"],
    stat: "",
    statLabel: "less time in review cycles",
  },
  {
    id: "astra",
    eyebrow: "COMING SOON",
    name: "ASTRA",
    title: "Make the better way repeatable.",
    body: "Codify what your best teams know into workflows that scale across functions, regions, and operating models—without adding another layer of complexity.",
    bullets: ["Standardize proven operating patterns", "Govern access and auditability", "Keep local teams moving fast"],
    stat: "",
    statLabel: "more reusable workflows",
  },
];

const cases = [
  {
    slug: "northstar-health", company: "Northstar Health",
    sector: "Healthcare operations",
    quote: "Cortex gave our teams a shared language for complexity. The conversation moved from ‘what happened?’ to ‘what do we do next?’",
    result: "",
    resultLabel: "fewer avoidable escalations",
    image: asset.caseStudy,
    tone: "light",
  },
  {
    slug: "vela-financial", company: "Vela Financial",
    sector: "Risk & compliance",
    quote: "We replaced a weekly reconciliation ritual with a living operating picture that risk, finance, and product can trust.",
    result: "",
    resultLabel: "returned to each team per week",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
    tone: "blue",
  },
  {
    slug: "aster-works", company: "Aster Works",
    sector: "Industrial systems",
    quote: "The value was not another dashboard. It was the confidence to make the call while the window was still open.",
    result: "",
    resultLabel: "faster cross-site decisions",
    image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=85",
    tone: "dark",
  },
];

const meetingDays = [
  { id: "2026-09-15", utcSlots: ["2026-09-15T14:00:00Z", "2026-09-15T15:30:00Z", "2026-09-15T18:00:00Z", "2026-09-15T20:30:00Z"] },
  { id: "2026-09-16", utcSlots: ["2026-09-16T14:00:00Z", "2026-09-16T15:30:00Z", "2026-09-16T18:00:00Z", "2026-09-16T20:30:00Z"] },
  { id: "2026-09-17", utcSlots: ["2026-09-17T14:00:00Z", "2026-09-17T15:30:00Z", "2026-09-17T18:00:00Z", "2026-09-17T20:30:00Z"] },
];

const insightPosts = [
  { type: "FIELD NOTE", date: "", title: "The operating system is not the dashboard", author: "Maya Chen", role: "VP, Product", accent: "cobalt" },
  { type: "BRIEFING", date: "", title: "Five signals that your data stack is becoming a bottleneck", author: "Jon Bell", role: "Research Lead", accent: "silver" },
  { type: "PERSPECTIVE", date: "", title: "Why high-performing teams design for the handoff", author: "Priya Nair", role: "Chief of Staff", accent: "charcoal" },
];

const documentationContext = [
  { keywords: ["workflo", "signal", "context"], answer: "Workflo connects operational signals into a shared context so teams can investigate what changed and why it matters.", source: { label: "Workflo product guide", href: "/docs" } },
  { keywords: ["nexus", "decision", "evidence"], answer: "Nexus turns a complex question into an evidence-backed decision path with visible trade-offs, owners, and next actions.", source: { label: "Nexus decision paths guide", href: "/docs" } },
  { keywords: ["astra", "workflow", "repeat"], answer: "ASTRA codifies proven operating patterns into governed workflows that travel across functions without flattening local expertise.", source: { label: "ASTRA workflow governance guide", href: "/docs" } },
  { keywords: ["platform", "architecture", "integration", "sandbox"], answer: "The Cortex platform connects the systems teams already trust, creates a shared operating context, and routes decisions into governed workflows.", source: { label: "Platform foundations guide", href: "/docs" } },
  { keywords: ["docs", "documentation", "api", "sdk"], answer: "Start with the documentation foundations for core concepts, then move into APIs, SDKs, integrations, and trust and governance.", source: { label: "Documentation overview", href: "/docs" } },
];

const searchItems = [
  { label: "Product", title: "Workflo", href: "/product/workflo" },
  { label: "Product", title: "Nexus", href: "/product/nexus" },
  { label: "Product", title: "ASTRA", href: "/product/astra" },
  { label: "Platform", title: "How Cortex works", href: "/#platform" },
  { label: "AI Core", title: "AI Core — documentation assistant", href: "#aicore" },
  { label: "Case study", title: "Northstar Health: shared language for complexity", href: "/case-study/northstar-health" },
  { label: "Case study", title: "Vela Financial: a living risk picture", href: "/case-study/vela-financial" },
  { label: "Case study", title: "Aster Works: confidence while the window is open", href: "/case-study/aster-works" },
  { label: "Documentation", title: "Architecture overview", href: "/#docs" },
  { label: "Insight", title: "The operating system is not the dashboard", href: "/#insights" },
  { label: "Company", title: "Investor and press center", href: "/#resources" },
];

function highlightMatch(text: string, query: string) {
  const term = query.trim();
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "ig"));
  return parts.map((part, index) => part.toLowerCase() === term.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatLocalDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", timeZone }).format(new Date(`${iso}T12:00:00Z`));
}

function formatLocalTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(iso));
}

function downloadCalendarInvite(iso: string, timeZone: string, product: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const toICS = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escapeICS = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cortex Systems//Cortex Conversation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cortex-${start.getTime()}@cortex.systems`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(start)}`,
    `DTEND:${toICS(end)}`,
    `SUMMARY:${escapeICS(`Cortex working session — ${product || "Cortex"}`)}`,
    `DESCRIPTION:${escapeICS("A 30-minute working session with the Cortex team.")}`,
    `LOCATION:${escapeICS("Cortex video meeting")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\\r\\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cortex-working-session.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return `${formatLocalDate(iso.slice(0, 10), timeZone)} at ${formatLocalTime(iso, timeZone)}`;
}

export default function Home() {
  const [activeProduct, setActiveProduct] = useState("workflo");
  const [activePlatformPoint, setActivePlatformPoint] = useState("connect");
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedCase, setSelectedCase] = useState<(typeof cases)[number] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("cortex-recent-searches") || "[]"); } catch { return []; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiCoreOpen, setAiCoreOpen] = useState(false);
  const [aiCoreTyping, setAiCoreTyping] = useState(false);
  const [aiCoreFollowUps, setAiCoreFollowUps] = useState(["Which product fits our operating model?", "Where should I start in the docs?", "Explain Cortex Sense"]);
  const [aiCoreInput, setAiCoreInput] = useState("");
  const [aiCoreReply, setAiCoreReply] = useState("Ask AI Core about a product, platform concept, or documentation path.");
  const [aiCoreSource, setAiCoreSource] = useState({ label: "Documentation overview", href: "/docs" });
  const [navScrolled, setNavScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitError, setContactSubmitError] = useState("");
  const activeTab = productTabs.find((tab) => tab.id === activeProduct) ?? productTabs[0];
  const currentCase = cases[caseIndex];
  const filteredSearch = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 7);
    return searchItems.filter((item) => `${item.label} ${item.title}`.toLowerCase().includes(normalized));
  }, [query]);
  const groupedSearch = useMemo(() => filteredSearch.reduce<Record<string, typeof searchItems>>((groups, item) => {
    (groups[item.label] ??= []).push(item);
    return groups;
  }, {}), [filteredSearch]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSelectedCase(null);
        setAiCoreOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || selectedCase || contactOpen || aiCoreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, selectedCase, contactOpen, aiCoreOpen]);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const platformPoints = Array.from(document.querySelectorAll<HTMLElement>("[data-platform-point]"));
    if (!platformPoints.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActivePlatformPoint(entry.target.getAttribute("data-platform-point") || "connect");
        }
      });
    }, { threshold: 0.62, rootMargin: "-18% 0px -28% 0px" });
    platformPoints.forEach((point) => observer.observe(point));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setNavScrolled(scrollY > 40);
      if (!reducedMotion) {
        document.documentElement.style.setProperty("--hero-parallax", `${Math.min(scrollY * 0.12, 70)}px`);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.removeProperty("--hero-parallax");
    };
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

  const nextCase = () => setCaseIndex((index) => (index + 1) % cases.length);
  const previousCase = () => setCaseIndex((index) => (index - 1 + cases.length) % cases.length);
  const downloadReport = (name: string) => toast.success(`${name} download prepared`, { description: "This demo link is ready to connect to your investor portal." });
  const openContact = () => { setContactSubmitted(false); setContactSubmitting(false); setSelectedProduct(""); setMeetingDate(""); setMeetingTime(""); setContactErrors({}); setContactSubmitError(""); setContactOpen(true); };
  const closeContact = () => { setContactOpen(false); setContactSubmitted(false); setContactSubmitting(false); setMeetingDate(""); setMeetingTime(""); setContactSubmitError(""); };
  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim()) errors.name = "Please enter your name.";
    const normalizedEmail = contactForm.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) errors.email = "Enter a valid work email.";
    if (!contactForm.company.trim()) errors.company = "Please enter your company.";
    if (!selectedProduct) errors.product = "Choose what you’d like to discuss.";
    if (contactForm.message.trim().length < 20) errors.message = "Tell us a little more so we can prepare.";
    setContactErrors(errors);
    setContactSubmitError("");
    if (Object.keys(errors).length !== 0) return;

    setContactSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: normalizedEmail,
          company: contactForm.company.trim(),
          product: selectedProduct,
          message: contactForm.message.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "We could not send your message. Please try again shortly.");
      }
      setContactSubmitted(true);
      toast.success("Message received", { description: "Pick a time while the context is fresh." });
    } catch (requestError) {
      setContactSubmitError(requestError instanceof Error ? requestError.message : "We could not send your message. Please try again shortly.");
    } finally {
      setContactSubmitting(false);
    }
  };
  const rememberSearch = (title: string) => {
    setRecentSearches((previous) => {
      const next = [title, ...previous.filter((item) => item !== title)].slice(0, 5);
      window.localStorage.setItem("cortex-recent-searches", JSON.stringify(next));
      return next;
    });
  };
  const askAiCore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = aiCoreInput.trim();
    if (!prompt || aiCoreTyping) return;
    const lower = prompt.toLowerCase();
    const grounded = documentationContext.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
    const reply = grounded?.answer || "AI Core can answer from the Cortex platform guides, including product fit, platform foundations, integrations, workflows, and documentation paths.";
    const source = grounded?.source || { label: "Cortex documentation overview", href: "/docs" };
    const followUps = lower.includes("sense") ? ["How does Sense connect signals?", "Show me the Sense foundations.", "What should we instrument first?"] : lower.includes("decide") ? ["How are decision trails governed?", "Compare Decide and Sense.", "Where do I start in the docs?"] : lower.includes("platform") || lower.includes("docs") ? ["Show platform foundations.", "How do integrations work?", "Explain Cortex governance."] : ["Which product fits our operating model?", "Where should I start in the docs?", "Explain Cortex Sense"];
    setAiCoreTyping(true);
    setAiCoreInput("");
    window.setTimeout(() => { setAiCoreReply(reply); setAiCoreSource(source); setAiCoreFollowUps(followUps); setAiCoreTyping(false); }, 620);
  };
  const confirmMeeting = () => {
    if (!meetingDate || !meetingTime) return;
    const inviteLabel = downloadCalendarInvite(meetingTime, timeZone, selectedProduct);
    toast.success("Meeting request saved", { description: `${inviteLabel} — your calendar invite downloaded.` });
    closeContact();
  };

  return (
    <div className="cortex-site min-h-screen bg-[#f4f5f7] text-[#151922]">
      <header className={`site-header ${navScrolled ? "is-scrolled" : "over-hero"}`}>
        <a className="brand" href="#top" aria-label="Cortex home">
          <span className="brand-mark-shell"><img src={asset.mark} alt="" className="brand-mark" /></span>
          <span className="brand-wordmark">CORTEX</span>
        </a>
        <nav className={`site-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a href="/product" onClick={() => setMobileOpen(false)}>Product</a>
          <a href="/platform" onClick={() => setMobileOpen(false)}>Platform</a>
          <a href="/docs" onClick={() => setMobileOpen(false)}>Docs</a>
          <a href="#insights" onClick={() => setMobileOpen(false)}>Insights</a>
          <a href="/company" onClick={() => setMobileOpen(false)}>Company</a>
        </nav>
        <div className="header-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Open global search">
            <Search size={16} /> <span>Search</span>
          </button>
          <button className="header-cta" onClick={openContact}>Talk to Cortex <ArrowRight size={15} /></button>
          <button className="menu-trigger" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" data-reveal>
          <div className="hero-copy">
            <div className="index-label">CORTEX</div>
            <h1>Clarity for<br /><em>critical</em> systems.</h1>
            <p className="hero-intro">The intelligence layer for critical systems.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={openContact}>See Cortex in action <ArrowDownRight size={17} /></button>
              <a className="text-link" href="#platform">Explore the platform <ArrowRight size={16} /></a>
            </div>
            <div className="hero-footnote"><span>Built for the moments<br />that matter.</span><span className="hero-rule" /><span>Enterprise-grade<br />by design.</span></div>
          </div>
          <div className="hero-visual" style={{ backgroundImage: `url(${asset.hero})` }}>
            

          </div>
        </section>

        <section id="product" className="section product-section" data-reveal>
          <div className="section-rail"><span>PRODUCT</span><span className="rail-line" /><span>PRODUCT</span></div>
          <div className="section-content product-content">
            <div className="section-heading split-heading">
              <div><p className="eyebrow">THE CORTEX SYSTEM</p><h2>Three products for<br /><span>the work ahead.</span></h2></div>
              <p className="section-lede">Workflo is in early access. Nexus and ASTRA are coming soon.</p>
            </div>
            <div className="product-layout">
              <div className="product-tabs" role="tablist" aria-label="Cortex products">
                {productTabs.map((tab) => <button key={tab.id} className={`product-tab ${activeProduct === tab.id ? "active" : ""}`} onClick={() => setActiveProduct(tab.id)} role="tab" aria-selected={activeProduct === tab.id}><span>{tab.eyebrow}</span><strong>{tab.name}</strong><ArrowRight size={16} /></button>)}
              </div>
              <div className="product-detail">
                <div className="product-detail-copy"><p className="eyebrow">{activeTab.eyebrow}</p><h3>{activeTab.name}</h3><p>{activeTab.body}</p><ul>{activeTab.bullets.map((bullet) => <li key={bullet}><Check size={15} /> {bullet}</li>)}</ul><a href={`/product/${activeProduct}`} className="text-link">Explore {activeTab.name} <ArrowRight size={16} /></a></div>
                <div className="product-stat"><span className="stat-value">{activeTab.stat}</span><span className="stat-label">{activeTab.statLabel}</span><span className="stat-index">{activeTab.name}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="section platform-section" data-reveal>
          <div className="platform-image plain-surface" style={{ backgroundImage: `url(${asset.platform})` }}><div className="platform-image-label">CORTEX / PLATFORM</div></div>
          <div className="platform-copy"><div className="index-label">PLATFORM</div><h2>Intelligence that fits the way your business <em>actually works.</em></h2><p>Connect the systems you already trust. Give every team the same underlying context, with the flexibility to work in the language of their function.</p><div className="platform-points"><div className={activePlatformPoint === "connect" ? "is-active" : ""} data-platform-point="connect" tabIndex={0}><strong>Connect</strong><p>Bring data, tools, and human expertise into one operating context.</p></div><div className={activePlatformPoint === "understand" ? "is-active" : ""} data-platform-point="understand" tabIndex={0}><strong>Understand</strong><p>Trace the relationships behind the signal, not just the surface event.</p></div><div className={activePlatformPoint === "act" ? "is-active" : ""} data-platform-point="act" tabIndex={0}><strong>Act</strong><p>Turn decisions into governed workflows that get better with use.</p></div></div><a className="button-dark" href="#docs">Read the architecture <ArrowRight size={16} /></a></div>
        </section>

        <section id="docs" className="docs-section" data-reveal>
          <div className="docs-topline"><span className="eyebrow">DOCUMENTATION</span><span>For builders, operators, and curious minds <ArrowRight size={15} /></span></div>
          <div className="docs-layout"><div><h2>Make the complex<br /><span>legible.</span></h2><p>Start with a clear mental model. Go deep when you need to. Our documentation is designed to help every role get to useful faster.</p><a href="#contact" className="text-link light-link">Browse the docs <ArrowRight size={16} /></a></div><div className="docs-cards"><a href="#contact" className="doc-card"><BookOpen size={19} /><span><strong>Platform foundations</strong><small>Core concepts and mental models</small></span><CircleArrowOutUpRight size={17} /></a><a href="#contact" className="doc-card"><BrainCircuit size={19} /><span><strong>Build with Cortex</strong><small>APIs, SDKs, and integrations</small></span><CircleArrowOutUpRight size={17} /></a><a href="#contact" className="doc-card"><ShieldCheck size={19} /><span><strong>Trust & governance</strong><small>Security, permissions, and controls</small></span><CircleArrowOutUpRight size={17} /></a></div></div>
        </section>


        <section id="insights" className="section insights-section" data-reveal>
          <div className="section-rail"><span>INSIGHTS</span><span className="rail-line" /><span>INSIGHTS</span></div>
          <div className="section-content"><div className="split-heading"><div><p className="eyebrow">FROM THE CORTEX DESK</p><h2>Ideas for the<br /><span>next system.</span></h2></div><a className="text-link" href="#contact">View all insights <ArrowRight size={16} /></a></div><div className="insights-layout"><div className="insights-feature" style={{ backgroundImage: `url(${asset.insights})` }}><div className="insights-feature-overlay" /><div className="insight-feature-copy"><p className="eyebrow light-eyebrow">FIELD NOTE</p><h3>The operating system is not the dashboard</h3><span>By Maya Chen <ArrowRight size={15} /></span></div></div><div className="insights-list">{insightPosts.slice(1).map((post) => <article className="insight-row" key={post.title}><div className={`insight-accent ${post.accent}`} /><div><p className="eyebrow">{post.type} <span>{post.date}</span></p><h3>{post.title}</h3><p className="insight-author">{post.author} · {post.role}</p></div><ArrowUpRightIcon /></article>)}</div></div></div>
        </section>

        <section id="resources" className="resources-section" data-reveal><div className="resources-head"><div><p className="eyebrow">COMPANY</p><h2>Signals worth<br /><span>sharing.</span></h2></div><p>For the people deciding what comes next.</p></div><div className="resource-columns"><div className="resource-panel"><div className="resource-panel-heading"><FileText size={20} /><span>Investor center</span></div><h3>The long view on<br />intelligent operations.</h3><p>Explore our latest company updates, financial reports, and governance materials.</p><button onClick={() => downloadReport("Investor overview")} className="resource-link">Download overview <Download size={15} /></button><button onClick={() => downloadReport("Shareholder letter")} className="resource-link">Shareholder letter <Download size={15} /></button></div><div className="resource-panel press"><div className="resource-panel-heading"><Sparkles size={20} /><span>Press center</span></div><h3>What’s being said<br />about Cortex.</h3><p>Company facts, brand assets, and selected coverage for journalists and analysts.</p><a href="#contact" className="resource-link">Visit press center <ArrowRight size={15} /></a><a href="#contact" className="resource-link">Download media kit <Download size={15} /></a></div></div></section>

        <section id="contact" className="contact-section" data-reveal><div className="contact-index">CONTACT</div><div><p className="eyebrow light-eyebrow">START A CONVERSATION</p><h2>See the system<br /><em>clearly.</em></h2><p>Bring us the hard question. We’ll make the first conversation useful.</p><button onClick={openContact} className="button-cobalt">Talk to Cortex <ArrowRight size={16} /></button></div><div className="contact-signal"><span /><span /><span /><span /><span /></div></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark-shell"><img src={asset.mark} alt="" className="brand-mark" /></span><span className="brand-wordmark">CORTEX</span><p>Clarity for critical systems.</p></div><div className="footer-links"><div><span>Explore</span><a href="/product">Product</a><a href="/platform">Platform</a><a href="/docs">Documentation</a></div><div><span>Company</span><a href="#insights">Insights</a><a href="/company">Investor center</a><a href="/company">Press center</a></div><div><span>Connect</span><a href="mailto:hello@cortex.systems">Contact</a><a href="#contact">LinkedIn</a><a href="#contact">X / Twitter</a></div></div><div className="footer-bottom"><span>© Cortex Systems, Inc.</span><span>Privacy <span className="footer-divider">/</span> Terms</span><span>Made for the moments that matter.</span></div></footer>

      {searchOpen && <div className="overlay-shell search-overlay-shell" role="dialog" aria-modal="true" aria-label="Global search"><div className="search-modal"><div className="search-modal-top"><span className="eyebrow">GLOBAL SEARCH</span><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button></div><div className="search-input-wrap"><Search size={21} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Cortex" /></div>{!query.trim() && recentSearches.length > 0 && <div className="recent-searches"><div className="search-category-label">RECENT SEARCHES</div><div className="recent-search-list">{recentSearches.map((item) => <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>)}</div></div>}<div className="search-results">{filteredSearch.length ? Object.entries(groupedSearch).map(([category, items]) => <div className="search-category" key={category}><div className="search-category-label">{category}</div>{items.map((item) => <a href={item.href} key={item.title} onClick={(event) => { rememberSearch(item.title); if (item.label === "AI Core") { event.preventDefault(); setSearchOpen(false); setAiCoreOpen(true); } else { setSearchOpen(false); } }}><strong>{highlightMatch(item.title, query)}</strong><ArrowUpRightIcon /></a>)}</div>) : <div className="search-empty">No results yet. Try a product, platform, insight, or report.</div>}</div><div className="search-modal-foot"><span>Select a result</span><span>Press Enter to open</span></div></div></div>}

      {selectedCase && <div className="overlay-shell case-modal-shell" role="dialog" aria-modal="true" aria-label={`${selectedCase.company} case study`}><div className="case-modal"><button className="modal-close" onClick={() => setSelectedCase(null)} aria-label="Close case study"><X size={20} /></button><div className="case-modal-image" style={{ backgroundImage: `url(${selectedCase.image})` }} /><div className="case-modal-copy"><p className="eyebrow">CASE STUDY / {selectedCase.sector}</p><h2>{selectedCase.company}</h2><blockquote>“{selectedCase.quote}”</blockquote><p>Cortex helped the team establish a single operating context across functions. The result was less time spent interpreting the system and more time acting on what it revealed.</p><a href={`/case-study/${selectedCase.slug}`} className="button-dark">Read the full case study <ArrowRight size={16} /></a></div></div></div>}

      {aiCoreOpen && <div className="overlay-shell aicore-shell" role="dialog" aria-modal="true" aria-label="AI Core assistant"><div className="aicore-panel"><button className="modal-close" onClick={() => setAiCoreOpen(false)} aria-label="Close AI Core"><X size={20} /></button><div className="aicore-heading"><p className="eyebrow">AI CORE</p><h2>Ask the system<br /><em>clearly.</em></h2><p>A compact Cortex assistant for finding the right product, platform concept, or next step.</p></div><div className="aicore-reply"><span>AI CORE</span>{aiCoreTyping ? <div className="aicore-typing" role="status" aria-label="AI Core is typing"><i /><i /><i /></div> : <><p>{aiCoreReply}</p><a className="aicore-source" href={aiCoreSource.href}><BookOpen size={14} /> Source: {aiCoreSource.label} <ArrowUpRightIcon /></a></>}</div><form className="aicore-form" onSubmit={askAiCore}><input value={aiCoreInput} onChange={(event) => setAiCoreInput(event.target.value)} placeholder="Ask AI Core" aria-label="Ask AI Core" /><button className="button-primary" type="submit">Ask <ArrowRight size={16} /></button></form><div className="aicore-suggestions">{aiCoreFollowUps.map((followUp) => <button key={followUp} type="button" onClick={() => setAiCoreInput(followUp)}>{followUp}</button>)}</div></div></div>}

      {contactOpen && <div className="overlay-shell contact-modal-shell" role="dialog" aria-modal="true" aria-label="Talk to Cortex"><div className="contact-modal"><button className="modal-close" onClick={closeContact} aria-label="Close contact form"><X size={20} /></button>{contactSubmitted ? <div className="contact-success contact-schedule"><div className="success-icon"><Check size={24} /></div><p className="eyebrow">MESSAGE RECEIVED</p><h2>Choose a<br /><em>time to meet.</em></h2><p>Pick a working session while the context is fresh.</p><div className="meeting-picker"><div className="meeting-step-label"><CalendarDays size={15} /> AVAILABLE WINDOWS</div><div className="meeting-dates">{meetingDays.map((day, index) => <button key={day.id} className={meetingDate === day.id ? "is-selected" : ""} onClick={() => { setMeetingDate(day.id); setMeetingTime(""); }}>{["Tuesday", "Wednesday", "Thursday"][index]}</button>)}</div>{meetingDate ? <div className="meeting-times"><span>AVAILABLE WINDOWS / {timeZone}</span>{meetingDays.find((day) => day.id === meetingDate)?.utcSlots.map((slot, slotIndex) => <button key={slot} className={meetingTime === slot ? "is-selected" : ""} onClick={() => setMeetingTime(slot)}>{["Morning", "Midday", "Afternoon", "Late afternoon"][slotIndex]}</button>)}</div> : <small className="meeting-hint">Select a day to see available times in {timeZone}.</small>}{meetingTime && <button className="meeting-download" onClick={() => downloadCalendarInvite(meetingTime, timeZone, selectedProduct)}><Download size={14} /> Download .ics invite</button>}</div><div className="contact-modal-footer schedule-footer"><button className="button-dark" onClick={confirmMeeting} disabled={!meetingDate || !meetingTime}>Confirm time <ArrowRight size={16} /></button><button className="button-ghost" onClick={closeContact}>Skip for now</button></div></div> : <form onSubmit={submitContact} noValidate><div className="contact-modal-heading"><p className="eyebrow">START A CONVERSATION</p><h2>Tell us what<br /><span>you’re building.</span></h2><p>Share a little context and we’ll make the first conversation useful.</p></div><div className="contact-fields"><label>Name<input value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} placeholder="Your name" />{contactErrors.name && <small>{contactErrors.name}</small>}</label><label>Work email<input type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} placeholder="you@company.com" />{contactErrors.email && <small>{contactErrors.email}</small>}</label><label>Company<input value={contactForm.company} onChange={(event) => setContactForm({ ...contactForm, company: event.target.value })} placeholder="Company name" />{contactErrors.company && <small>{contactErrors.company}</small>}</label><label className="contact-product-field">What would you like to discuss?<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}><option value="">Choose a product or service</option><option value="Workflo">Workflo</option><option value="Nexus">Nexus</option><option value="ASTRA">ASTRA</option><option value="Platform & integrations">Platform & integrations</option><option value="Enterprise partnership">Enterprise partnership</option></select>{contactErrors.product && <small>{contactErrors.product}</small>}</label><label className="contact-message-field">What are you working on?<textarea rows={4} value={contactForm.message} onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })} placeholder="A sentence or two is perfect." />{contactErrors.message && <small>{contactErrors.message}</small>}</label></div>{contactSubmitError && <p className="waitlist-form-error" role="alert">{contactSubmitError}</p>}<div className="contact-modal-footer"><span><FileText size={15} /> We respond shortly.</span><button className="button-primary" type="submit" disabled={contactSubmitting}>{contactSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Sending...</> : <>Send message <ArrowRight size={16} /></>}</button></div></form>}</div></div>}
    </div>
  );
}

function ArrowUpRightIcon() {
  return <ArrowDownRight size={17} className="arrow-up-right" />;
}
