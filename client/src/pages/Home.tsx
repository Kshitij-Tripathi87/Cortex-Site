import { useEffect, useState } from "react";

const products = [
  { code: "01", name: "Workflo", label: "Execution assurance", flow: "CODE → SANDBOX → EXECUTION → HASH → RECEIPT", image: "/images/workflo-sealed.jpg", copy: "Sealed execution with a verifiable record attached to every action." },
  { code: "02", name: "Nexus", label: "Operations intelligence", flow: "DATA → WORLD STATE → GRAPH → SIGNALS → SIMULATION → DECISION", image: "/images/nexus-network.jpg", copy: "A living operational model that makes relationships visible before decisions are made." },
  { code: "03", name: "ASTRA", label: "Mission engineering", flow: "MISSION → REQUIREMENTS → ARCHITECTURES → CONSTRAINTS → TRADE-OFFS → PLAN", image: "/images/astra-mission.jpg", copy: "Mission architectures explored against constraints, trade-offs, and evidence." },
];

const stages = ["RAW SIGNALS", "CONTEXT", "REASONING", "SIMULATION", "DECISION", "EVIDENCE"];
const useCases = ["Complex operations", "Critical software", "Supply networks", "Mission engineering", "Infrastructure", "Enterprise AI"];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="cortex-site">
      <header className={`site-header ${scrolled ? "is-solid" : ""}`}>
        <a className="wordmark" href="#top" aria-label="Cortex home"><span className="mark">⌁</span><span>CORTEX</span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#platform">Platform</a><a href="#products">Products</a><a href="#solutions">Solutions</a><a href="#evidence">Resources</a><a href="#company">Company</a>
        </nav>
        <div className="header-actions"><span className="status-dot"><i /> SYSTEMS OPERATIONAL</span><a className="header-cta" href="#contact">Talk to Cortex <b>↗</b></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Open menu">{menuOpen ? "CLOSE" : "MENU"}</button></div>
      </header>
      {menuOpen && <div className="mobile-menu"><a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a><a href="#products" onClick={() => setMenuOpen(false)}>Products</a><a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a><a href="#evidence" onClick={() => setMenuOpen(false)}>Resources</a><a href="#company" onClick={() => setMenuOpen(false)}>Company</a><a href="#contact" onClick={() => setMenuOpen(false)}>Talk to Cortex ↗</a></div>}

      <main id="top">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">CORTEX / INTELLIGENCE SYSTEMS <span>FIELD STUDY 001 · CONCEPTUAL</span></p>
            <h1>INTELLIGENCE<br />FOR CRITICAL<br /><em>SYSTEMS.</em></h1>
            <p className="hero-intro">Cortex connects operational data, reasoning, simulation, and evidence into one decision layer.</p>
            <div className="hero-actions"><a className="button button-blue" href="#platform">Explore Cortex <b>↗</b></a><a className="button button-outline" href="#contact">Talk to Cortex</a></div>
          </div>
          <div className="field-wrap" aria-label="Abstract intelligence field visualization">
            <div className="field-orbit orbit-a" /><div className="field-orbit orbit-b" /><div className="field-core"><span>CX</span></div>
            {[...Array(18)].map((_, i) => <span key={i} className={`field-node node-${i + 1}`} />)}
            <span className="field-label label-a">SIGNAL PROPAGATION</span><span className="field-label label-b">WORLD STATE / 001</span><span className="field-label label-c">CORE PROCESSING</span>
          </div>
          <div className="scroll-cue">SCROLL TO EXPLORE <span>──────── ↓</span></div>
        </section>

        <section className="statement section-rule" id="platform"><div className="section-index">001 / THE PROBLEM</div><div className="statement-inner"><h2>COMPLEXITY IS NOT<br />THE PROBLEM.<br /><span>INVISIBLE RELATIONSHIPS ARE.</span></h2><p>Complex systems generate enormous amounts of data. But data is not a decision. Cortex makes the signals, the reasoning, and the evidence behind an action inspectable.</p></div></section>

        <section className="layer section-rule"><div className="section-index">002 / THE INTELLIGENCE LAYER</div><div className="layer-heading"><h2>BETWEEN SIGNAL<br /><span>AND ACTION.</span></h2><p>Six stages. One inspectable chain of context.</p></div><div className="stage-strip">{stages.map((stage, i) => <button key={stage} className={activeStage === i ? "active" : ""} onClick={() => setActiveStage(i)}><span>0{i + 1}</span>{stage}<i /></button>)}</div><div className="layer-readout"><span>ACTIVE STATE / {String(activeStage + 1).padStart(2, "0")}</span><strong>{stages[activeStage]}</strong><p>{activeStage < 3 ? "Signals are contextualized into a model that can be inspected and challenged." : "Possible paths converge into a decision record with its supporting evidence attached."}</p></div></section>

        <section className="works section-rule"><div className="section-index">003 / HOW CORTEX WORKS</div><div className="works-grid"><div><h2>REASONING IS NOT<br /><span>AUTHORIZATION.</span></h2><p>Understand. Compare. Recommend. Then stop for the owner who has authority to act.</p><small>DEMO / SIMULATION<br />This is an architecture walkthrough. No connected system is controlled by this page.</small></div><div className="diagram"><div className="diagram-line top">OBSERVE <b>→</b> UNDERSTAND <b>→</b> SIMULATE</div><div className="diagram-core">CORTEX<br /><span>DECISION LAYER</span></div><div className="diagram-line bottom">RECOMMEND <b>→</b> AUTHORIZE <b>→</b> VERIFY</div><div className="diagram-meta">OWNER IN THE LOOP / INSPECTABLE PATH / EXPLICIT BOUNDARY</div></div></div></section>

        <section className="products section-rule" id="products"><div className="section-index">004 / THE CORTEX SYSTEM</div><h2>THREE SYSTEMS.<br /><span>ONE INTELLIGENCE LAYER.</span></h2>{products.map((product) => <article className="product-row" id={product.name.toLowerCase()} key={product.name}><div className="product-meta"><span>{product.code} / {product.label}</span><h3>{product.name}</h3><p>{product.copy}</p><a href={`#${product.name.toLowerCase()}`} className="inline-link">Explore {product.name} ↗</a></div><div className="product-visual"><img src={product.image} alt="" /><div className="visual-overlay"><span>ARCHITECTURE STUDY</span><strong>{product.flow}</strong><small>CONCEPTUAL ILLUSTRATION · NOT LIVE TELEMETRY</small></div></div></article>)}</section>

        <section className="evidence section-rule" id="evidence"><div className="section-index">005 / EVIDENCE</div><div className="evidence-grid"><div><h2>EVIDENCE,<br /><span>NOT PROMISES.</span></h2><p>Technical notes, measured outcomes, and demonstrations with provenance attached. No synthetic performance claims.</p></div><div className="evidence-list"><a href="#contact"><span>01 / TECHNICAL NOTE</span><strong>Decision records as system artifacts <b>↗</b></strong></a><a href="#contact"><span>02 / METHODOLOGY</span><strong>How we expose invisible relationships <b>↗</b></strong></a><a href="#contact"><span>03 / DEMONSTRATION</span><strong>Trace a signal through the layer <b>↗</b></strong></a></div></div></section>

        <section className="solutions section-rule" id="solutions"><div className="section-index">006 / APPLICATION</div><h2>BUILT FOR SYSTEMS<br /><span>WHERE DECISIONS MATTER.</span></h2><div className="use-case-grid">{useCases.map((item, i) => <a href="#contact" key={item}><span>0{i + 1}</span><strong>{item}</strong><b>↗</b></a>)}</div></section>

        <section className="trust section-rule"><div className="section-index">007 / TRUST</div><div className="trust-grid"><div><h2>TRUST IS PART<br /><span>OF THE SYSTEM.</span></h2><p>Identity, access control, data protection, auditability, and governance are not add-ons. They are part of how a decision becomes actionable.</p></div><div className="trust-stack"><div><span>IDENTITY & ACCESS</span><strong>WHO CAN SEE, RECOMMEND, AUTHORIZE</strong></div><div><span>DATA PROTECTION</span><strong>BOUNDARIES, RETENTION, INFRASTRUCTURE</strong></div><div><span>AUDITABILITY</span><strong>SOURCE, SCOPE, OWNER ATTACHED</strong></div></div></div></section>

        <section className="company section-rule" id="company"><div className="section-index">008 / THE COMPANY</div><h2>FOR ENVIRONMENTS WHERE<br /><span>COMPLEXITY CANNOT BE<br />ABSTRACTED AWAY.</span></h2><p>Expose relationships. Keep assumptions visible. Make the boundary between a recommendation and an action explicit.</p><a className="inline-link" href="#contact">The Cortex philosophy ↗</a></section>

        <section className="contact section-rule" id="contact"><div className="section-index">009 / START A CONVERSATION</div><h2>LET'S BUILD<br /><span>THE RIGHT SYSTEM.</span></h2><p>A technical requirement. A deployment problem. An architecture worth discussing. Bring us the context.</p><div className="hero-actions"><a className="button button-blue" href="mailto:hello@cortex.systems">Talk to Cortex <b>↗</b></a><a className="button button-outline" href="mailto:hello@cortex.systems?subject=Technical briefing">Request a technical briefing</a></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><div><a className="wordmark" href="#top"><span className="mark">⌁</span><span>CORTEX</span></a><p>Intelligence for critical systems.</p></div><div className="footer-links"><div><span>PRODUCTS</span><a href="#workflo">Workflo</a><a href="#nexus">Nexus</a><a href="#astra">ASTRA</a></div><div><span>EXPLORE</span><a href="#platform">Platform</a><a href="#solutions">Solutions</a><a href="#evidence">Resources</a></div><div><span>TRUST</span><a href="#contact">Security</a><a href="#contact">Status</a><a href="#contact">Contact</a></div></div></div><div className="footer-bottom"><span>© 2026 CORTEX</span><span>PUBLIC SITE / V1</span><span>SYSTEMS OPERATIONAL ●</span></div></footer>
    </div>
  );
}
