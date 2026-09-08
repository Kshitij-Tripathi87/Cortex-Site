/* Cinematic system: Home. One continuous argument — signal to decision to
 * proof — paced by section numbers, carried by semantic HTML. */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Lock, ScrollText, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import IntelligenceField from "@/components/3d/IntelligenceField";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Magnetic from "@/components/motion/Magnetic";
import SectionNumber from "@/components/editorial/SectionNumber";
import Statement, { Dim } from "@/components/editorial/Statement";
import Divider from "@/components/editorial/Divider";
import StatBlock from "@/components/product/StatBlock";
import PipelineStrip from "@/components/product/PipelineStrip";
import ProductPanel from "@/components/product/ProductPanel";
import ArchitectureDiagram from "@/components/product/ArchitectureDiagram";
import Timeline from "@/components/editorial/Timeline";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structuredData";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { caseStudies } from "@/lib/cortexContent";

const FLOW_STAGES = [
  {
    index: "001",
    name: "UNIFY",
    desc: "Every feed mapped into one operating picture.",
    detail: "Schedules, rosters, fleets, ledgers — signals stream in from the systems teams already trust and resolve into one picture.",
  },
  {
    index: "002",
    name: "FORECAST",
    desc: "Trajectories projected while the window is open.",
    detail: "The core projects where conditions are heading — with assumptions and confidence on the surface, never buried.",
  },
  {
    index: "003",
    name: "DECIDE",
    desc: "Ranked options, evidence attached.",
    detail: "Options ranked by consequence, cost, and reversibility — each routed to the owner who can act on it.",
  },
  {
    index: "004",
    name: "SEAL",
    desc: "What was decided, sealed with proof.",
    detail: "Every action sealed with authorship, timestamp, and terms — verifiable in seconds by people never in the room.",
  },
];

function FlowStages() {
  const [active, setActive] = useState(0);
  const stage = FLOW_STAGES[active];
  return (
    <div>
      <div className="cx-flow" role="group" aria-label="How intelligence moves through Cortex" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {FLOW_STAGES.map((item, i) => (
          <button
            key={item.index}
            type="button"
            className={`cx-flow-stage${i === active ? " is-active" : ""}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <span className="cx-flow-index">{item.index}</span>
            <span className="cx-flow-name">{item.name}</span>
            <p className="cx-flow-desc">{item.desc}</p>
          </button>
        ))}
      </div>
      <div className="cx-flow-panel">
        <div>
          <h3>
            {stage.index} — {stage.name}
          </h3>
          <p>{stage.detail}</p>
        </div>
        <div className="cx-flow-visual" aria-hidden="true">
          <span style={{ fontFamily: "var(--cx-mono)", fontSize: "clamp(3rem, 6vw, 5rem)", color: "var(--cx-cobalt-bright)", letterSpacing: "0.08em" }}>
            {stage.index}
          </span>
        </div>
      </div>
    </div>
  );
}

const SOLUTIONS = [
  {
    title: "Healthcare operations",
    body: "Patient access, staffing, and service signals unified — so escalations are decided on the full picture, not fragments.",
    tags: ["Workflo", "Nexus"],
  },
  {
    title: "Risk & compliance",
    body: "Policy, product, and operational data in one context — recommendations traceable to evidence and owners.",
    tags: ["Nexus", "Workflo"],
  },
  {
    title: "Industrial systems",
    body: "Site telemetry joined with maintenance and supply context — proven responses reusable across every site.",
    tags: ["ASTRA", "Nexus"],
  },
];

export default function Home() {
  return (
    <div className="cx-page">
      <SEO path="/" jsonLd={[websiteJsonLd(), organizationJsonLd()]} />
      <Header overlay />

      <main>
        {/* 00 — HERO */}
        <section className="cx-hero" aria-label="Cortex introduction">
          <IntelligenceField className="cx-hero-field" />
          <div className="cx-hero-scrim" aria-hidden="true" />
          <div className="cx-wrap">
            <div className="cx-hero-meta">
              <p className="cx-kicker">Cortex / The Intelligence Layer</p>
              <span className="cx-hero-live">
                <span className="cx-status-dot" aria-hidden="true" /> FIELD 001 — LIVE
              </span>
            </div>
            <h1 className="cx-hero-title">
              <span className="cx-line-mask">
                <span className="cx-line-inner">See the system.</span>
              </span>
              <span className="cx-line-mask">
                <span className="cx-line-inner">Seal the decision.</span>
              </span>
            </h1>
            <p className="cx-hero-sub">
              Cortex unifies your signals, forecasts what matters, and seals what was decided —
              Workflo, Nexus, and ASTRA on one layer.
            </p>
            <div className="cx-hero-ctas">
              <Link
                href="/platform"
                className="cx-btn cx-btn-primary"
                onClick={() => track(FUNNEL_EVENTS.heroCta, { target: "/platform" })}
              >
                Explore the system <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="cx-btn cx-btn-ghost">
                Talk to Cortex
              </Link>
            </div>
            <div className="cx-hero-foot">
              <span className="cx-scrollcue">
                Scroll to explore <span className="cx-scrollcue-line" aria-hidden="true" />
              </span>
              <p className="cx-hero-coords">
                SIGNALS → DECISIONS → PROOF
                <br />
                CORTEX / PUBLIC SITE v1
              </p>
            </div>
          </div>
        </section>

        {/* 01 — STATEMENT */}
        <section className="cx-section" aria-labelledby="premise">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="01" label="The premise" />
              <div id="premise">
                <Statement>
                  Operations fail in the gaps between systems.{" "}
                  <Dim>Cortex closes them — signal to decision to proof.</Dim>
                </Statement>
              </div>
              <p className="cx-lede" style={{ marginTop: "2rem" }}>
                Three systems on one layer: Nexus forecasts, ASTRA rehearses, Workflo seals.
                Every claim on this page is structural — what the mechanism does, not what it promises.
              </p>
            </Reveal>
            <Divider signal label="End of premise" />
          </div>
        </section>

        {/* 02 — FLOW */}
        <section className="cx-section cx-section-tight" aria-labelledby="flow">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="02" label="How it moves" />
              <div id="flow">
                <Statement>
                  Four moves. <Dim>No paperwork.</Dim>
                </Statement>
              </div>
              <p className="cx-lede" style={{ marginTop: "1.6rem" }}>
                Intelligence travels one direction through Cortex — from noise to proof.
                Select a stage to inspect it.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <FlowStages />
            </Reveal>
          </div>
        </section>

        {/* 03–05 — PRODUCTS */}
        <section className="cx-section" aria-labelledby="systems">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="03" label="The systems" />
              <div id="systems">
                <Statement wide>
                  Three systems. <Dim>One layer beneath the work.</Dim>
                </Statement>
              </div>
            </Reveal>
            <div className="cx-product-panels">
              <Reveal>
                <ProductPanel
                  index="01"
                  name="Workflo"
                  cat="Execution Assurance"
                  state="The record the work creates — before anyone asks for it."
                  copy="Governance that arrives after the work is paperwork. Workflo seals each handoff where it happens, with authorship, timestamp, and terms."
                  flow={["ACT", "SEAL", "ANCHOR", "PROVE"]}
                  tags={["Live pilot", "Early access"]}
                  image="/images/workflo-sealed.jpg"
                  imageAlt="A sealed corridor of records — the Workflo proof surface"
                  caption="Workflo / Sealed record surface"
                  href="/products/workflo"
                />
              </Reveal>
              <Reveal>
                <ProductPanel
                  index="02"
                  name="Nexus"
                  cat="Operations Intelligence"
                  state="The forecast you can act on — before the window closes."
                  copy="Dozens of feeds in, one forecast out. Nexus ranks what matters and routes it to the owner who can act, evidence attached."
                  flow={["UNIFY", "FORECAST", "RANK", "ROUTE"]}
                  tags={["Live demo", "Coming soon"]}
                  image="/images/nexus-network.jpg"
                  imageAlt="Converging signal paths — the Nexus forecast core"
                  caption="Nexus / Forecast core"
                  href="/products/nexus"
                  flip
                />
              </Reveal>
              <Reveal>
                <ProductPanel
                  index="03"
                  name="ASTRA"
                  cat="Mission Engineering"
                  state="Rehearse the mission — before the mission rehearses you."
                  copy="Consequential choices deserve rehearsal. ASTRA tests courses of action in a sandbox the live system never feels."
                  flow={["ORDER", "BRANCH", "REHEARSE", "SEAL"]}
                  tags={["Simulation", "Coming soon"]}
                  image="/images/astra-mission.jpg"
                  imageAlt="A mission corridor under rehearsal — the ASTRA sandbox"
                  caption="ASTRA / Mission sandbox"
                  href="/products/astra"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* 06 — ARCHITECTURE */}
        <section className="cx-section" aria-labelledby="layer">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="04" label="One layer" />
              <div id="layer">
                <Statement>
                  Signals unify. <Dim>Forecasts rank. Actions seal.</Dim>
                </Statement>
              </div>
            </Reveal>
            <div className="cx-split" style={{ marginTop: "3rem" }}>
              <Reveal className="cx-split-sticky">
                <p className="cx-lede">
                  The Cortex layer sits beneath the tools teams already trust. Feeds converge on
                  one forecast core; decisions fan out with evidence; actions seal into records
                  anyone can verify.
                </p>
                <p style={{ marginTop: "1.8rem" }}>
                  <Link href="/platform" className="cx-text-link">
                    Tour the platform <ArrowRight size={15} />
                  </Link>
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="cx-diagram">
                  <ArchitectureDiagram
                    variant="nexus"
                    title="The Cortex layer: signals unify, forecasts rank, actions seal"
                  />
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.05}>
              <div style={{ marginTop: "3rem" }}>
                <StatBlock
                  label="Cortex layer structure"
                  stats={[
                    { value: "03", label: "systems on the layer", meta: "workflo · nexus · astra" },
                    { value: "01", label: "operating picture", meta: "shared across functions" },
                    { value: "04", label: "sealed stages", meta: "act → seal → anchor → prove" },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 07 — EVIDENCE */}
        <section className="cx-section" aria-labelledby="field">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="05" label="In the field" />
              <div id="field">
                <Statement>
                  Illustrated briefs. <Dim>Honest structure.</Dim>
                </Statement>
              </div>
              <p className="cx-lede" style={{ marginTop: "1.6rem" }}>
                Operating briefs from the field — each describes a deployment's structure.
                Illustrated accounts, not measured trials.
              </p>
            </Reveal>
            <Stagger className="cx-evidence-grid" gap={0.1}>
              {caseStudies.map((story) => (
                <StaggerItem key={story.slug}>
                  <Link href={`/case-study/${story.slug}`} className="cx-evidence-card">
                    <blockquote>“{story.title}”</blockquote>
                    <p>{story.constraint.body}</p>
                    <span className="cx-evidence-foot">
                      <span className="cx-evidence-src">
                        {story.company} / {story.sector}
                      </span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* 08 — SOLUTIONS */}
        <section className="cx-section" aria-labelledby="acts">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="06" label="Where it acts" />
              <div id="acts">
                <Statement>
                  Shaped to the constraint. <Dim>Not the vertical slide.</Dim>
                </Statement>
              </div>
            </Reveal>
            <Stagger className="cx-solutions" gap={0.08}>
              {SOLUTIONS.map((solution) => (
                <StaggerItem key={solution.title}>
                  <Link href="/solutions" className="cx-solution-row">
                    <h3>{solution.title}</h3>
                    <div>
                      <p>{solution.body}</p>
                      <span className="cx-solution-tags">
                        {solution.tags.map((tag) => (
                          <span key={tag} className="cx-tag">
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                    <span className="cx-solution-go" aria-hidden="true">
                      <ArrowRight size={17} />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* 09 — PATH */}
        <section className="cx-section" aria-labelledby="path">
          <div className="cx-wrap">
            <div className="cx-split">
              <Reveal className="cx-split-sticky">
                <SectionNumber index="07" label="From pilot to platform" />
                <div id="path">
                  <Statement>
                    Start with one decision. <Dim>Prove it end to end.</Dim>
                  </Statement>
                </div>
                <p className="cx-lede" style={{ marginTop: "1.6rem" }}>
                  No rip-and-replace. The layer earns its place one sealed decision at a time —
                  then spreads to the feeds around it.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <Timeline
                  items={[
                    {
                      year: "01",
                      title: "Pilot — one decision, proved",
                      body: "Pick the decision that hurts most. Cortex instruments it, forecasts it, and seals the record — in weeks, alongside your systems.",
                      active: true,
                      status: "Entry",
                    },
                    {
                      year: "02",
                      title: "Platform — feeds unify",
                      body: "The operating picture spreads to adjacent feeds. Forecasts sharpen, options route themselves, evidence compounds.",
                    },
                    {
                      year: "03",
                      title: "Enterprise — governed scale",
                      body: "Role-aware access, auditable trails, and sealed records across functions — governance that moves at operational speed.",
                    },
                  ]}
                />
              </Reveal>
            </div>
            <Reveal delay={0.05}>
              <div style={{ marginTop: "3rem" }}>
                <PipelineStrip
                  label="How a pilot runs"
                  steps={[
                    { index: "001", title: "NAME THE DECISION", body: "One working session. We map the decision, its signals, and its owners — then instrument exactly that." },
                    { index: "002", title: "RUN IT SEALED", body: "Forecasts route to owners; actions seal into records. Your team works normally — the proof accumulates." },
                    { index: "003", title: "VERIFY TOGETHER", body: "You verify every record independently. If the mechanism doesn't hold, the pilot ends there." },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 10 — TRUST */}
        <section className="cx-section" aria-labelledby="trust">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="08" label="Sealed by design" />
              <div id="trust">
                <Statement>
                  Trust is a property. <Dim>Not a promise.</Dim>
                </Statement>
              </div>
            </Reveal>
            <Stagger className="cx-security-grid" gap={0.1}>
              <StaggerItem className="cx-security-cell">
                <ShieldCheck size={22} aria-hidden="true" />
                <h3>Sealed by default</h3>
                <p>Records carry their own proof — authorship, timestamp, terms — from the moment of creation.</p>
              </StaggerItem>
              <StaggerItem className="cx-security-cell">
                <Lock size={22} aria-hidden="true" />
                <h3>Governed access</h3>
                <p>Role-aware views put the right context in front of the right operator — and nothing else.</p>
              </StaggerItem>
              <StaggerItem className="cx-security-cell">
                <ScrollText size={22} aria-hidden="true" />
                <h3>Auditable always</h3>
                <p>Every decision trail is reviewable end to end. Verify independently, on your schedule.</p>
              </StaggerItem>
            </Stagger>
            <Reveal>
              <div className="cx-security-links">
                <Link href="/security" className="cx-text-link">
                  Read the security brief <ArrowRight size={15} />
                </Link>
                <Link href="/legal/ai-terms" className="cx-text-link">
                  Review AI terms <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 11 — CLOSING */}
        <section className="cx-section" aria-labelledby="close">
          <div className="cx-wrap">
            <Reveal>
              <div className="cx-closing">
                <h2 id="close">Bring us the hard question.</h2>
                <p className="cx-closing-sub">
                  The first conversation is a working session: one decision your team needs to
                  make better, mapped against the layer. Useful even if you never buy.
                </p>
                <div className="cx-closing-ctas">
                  <Magnetic>
                    <Link
                      href="/contact"
                      className="cx-btn cx-btn-primary"
                      onClick={() => track(FUNNEL_EVENTS.contactStarted, { source: "home-closing" })}
                    >
                      Talk to Cortex <ArrowRight size={15} />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/demo"
                    className="cx-btn cx-btn-ghost"
                    onClick={() => track(FUNNEL_EVENTS.demoStarted, { source: "home-closing" })}
                  >
                    Book a working session
                  </Link>
                </div>
                <nav className="cx-closing-routes" aria-label="Continue exploring">
                  <Link href="/platform">Platform</Link>
                  <Link href="/products">Products</Link>
                  <Link href="/solutions">Solutions</Link>
                  <Link href="/resources">Resources</Link>
                  <Link href="/status">Status</Link>
                </nav>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
