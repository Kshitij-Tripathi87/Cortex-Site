import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import IntelligenceField from "@/components/3d/IntelligenceField";
import Reveal from "@/components/motion/Reveal";
import SectionNumber from "@/components/editorial/SectionNumber";
import Divider from "@/components/editorial/Divider";
import Timeline from "@/components/editorial/Timeline";
import ProductScene from "@/components/3d/ProductScene";
import SystemSequence from "@/components/system/SystemSequence";
import WorkloadExplorer from "@/components/system/WorkloadExplorer";
import ProductEvidence from "@/components/product/ProductEvidence";
import {
  intelligenceStages,
  operatingStages,
  productDesign,
  type ProductSlug,
} from "@/lib/designContent";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structuredData";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";

export default function Home() {
  const reduce = useReducedMotion();
  return (
    <div className="cx-page cx-design-page">
      <SEO path="/" jsonLd={[websiteJsonLd(), organizationJsonLd()]} />
      <Header overlay cta={{ label: "Book a demo", href: "/demo" }} />
      <a className="cx-skip" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <section
          className="cx-hero cx-signature"
          aria-label="Cortex introduction"
        >
          <IntelligenceField className="cx-hero-field" />
          <div className="cx-hero-interface" aria-hidden="true">
            <span className="cx-hero-readout"><i /> LIVE FIELD / SIGNAL GRAPH</span>
            <span className="cx-hero-corner"><i /> WORLD STATE / ACTIVE</span>
            <span className="cx-hero-corner"><i /> CONTEXT / CONVERGING</span>
            <span className="cx-hero-scanline" />
          </div>
          <div className="cx-hero-scrim" aria-hidden="true" />
          <div className="cx-wrap">
            <div className="cx-hero-meta">
              <p className="cx-kicker">Cortex / Intelligence systems</p>
              <span className="cx-kicker">Field study 001 · Conceptual</span>
            </div>
            <h1 className="cx-hero-title">
              {["Intelligence", "for critical", "systems."].map((line, i) => (
                <span className="cx-line-mask" key={line}>
                  <motion.span
                    className="cx-line-inner"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <p className="cx-hero-sub">
              Cortex connects operational data, reasoning, simulation, and
              evidence into one decision layer.
            </p>
            <div className="cx-hero-ctas">
              <Link
                href="/platform"
                className="cx-btn cx-btn-primary"
                onClick={() =>
                  track(FUNNEL_EVENTS.heroCta, { target: "/platform" })
                }
              >
                Explore Cortex <ArrowRight size={15} />
              </Link>
              <Link href="/demo" className="cx-btn cx-btn-ghost">
                Book a demo <ArrowRight size={15} />
              </Link>
            </div>
            <div className="cx-hero-foot">
              <a href="#premise" className="cx-scrollcue">
                Scroll to explore <span aria-hidden="true">↓</span>
              </a>
              <p className="cx-hero-coords">
                WORLD STATE / REASONING / EVIDENCE
                <br />A SYSTEM TO UNDERSTAND. NOT A BLACK BOX.
              </p>
            </div>
          </div>
        </section>
        <section
          className="cx-section"
          id="premise"
          aria-labelledby="premise-title"
        >
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="001" label="The problem" />
              <h2 id="premise-title" className="cx-statement cx-statement-wide">
                Complexity is not the problem.
                <br />
                <span className="cx-dim">Invisible relationships are.</span>
              </h2>
              <p className="cx-lede cx-editorial-offset">
                Complex systems generate enormous amounts of data. But data is
                not a decision. Cortex connects the signals, the reasoning, and
                the evidence behind an action.
              </p>
            </Reveal>
            <Divider signal label="From complexity to context" />
          </div>
        </section>
        <section
          className="cx-section cx-section-tight"
          aria-labelledby="layer-title"
        >
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="002" label="The intelligence layer" />
              <h2 className="cx-statement" id="layer-title">
                Between signal
                <br />
                <span className="cx-dim">and action.</span>
              </h2>
              <p className="cx-lede">
                Six stages. One inspectable chain of context. Scroll to trace
                the model, or select a stage to investigate it.
              </p>
            </Reveal>
            <SystemSequence
              stages={intelligenceStages}
              label="The intelligence layer"
              scrollLinked
            />
          </div>
        </section>
        <section className="cx-section" aria-labelledby="operation-title">
          <div className="cx-wrap">
            <div className="cx-split">
              <Reveal className="cx-split-sticky">
                <SectionNumber index="003" label="How Cortex works" />
                <h2 className="cx-statement" id="operation-title">
                  Reasoning is not
                  <br />
                  <span className="cx-dim">authorization.</span>
                </h2>
                <p className="cx-lede">
                  Understand. Compare. Recommend. Then stop for the owner who
                  has authority to act.
                </p>
                <p className="cx-boundary-note">
                  DEMO / SIMULATION
                  <br />
                  This is an architecture walkthrough. No connected system is
                  controlled by this page.
                </p>
              </Reveal>
              <SystemSequence
                stages={operatingStages}
                label="How Cortex works"
              />
            </div>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="products-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="004" label="The Cortex system" />
              <h2
                id="products-title"
                className="cx-statement cx-statement-wide"
              >
                Three systems.
                <br />
                <span className="cx-dim">One intelligence layer.</span>
              </h2>
            </Reveal>
            {(Object.keys(productDesign) as ProductSlug[]).map((slug, i) => {
              const p = productDesign[slug];
              return (
                <article key={slug} className="cx-product-chapter">
                  <Reveal>
                    <div className="cx-chapter-heading">
                      <span className="cx-kicker">
                        System / {String(i + 1).padStart(3, "0")}
                      </span>
                      <span className="cx-kicker">{p.category}</span>
                    </div>
                    <h3 className="cx-chapter-name">{p.name}</h3>
                  </Reveal>
                  <ProductScene slug={slug} />
                  <div className="cx-chapter-copy">
                    <h4>{p.headline}</h4>
                    <div>
                      <p>{p.intro}</p>
                      <ol
                        className="cx-product-flow"
                        aria-label={`${p.name} conceptual workflow`}
                      >
                        {p.flow.map(s => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                      <Link href={`/products/${slug}`} className="cx-text-link">
                        Explore {p.name} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="cx-section" aria-labelledby="evidence-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="005" label="Evidence" />
              <h2 id="evidence-title" className="cx-statement">
                Evidence,
                <br />
                <span className="cx-dim">not promises.</span>
              </h2>
            </Reveal>
            <ProductEvidence />
          </div>
        </section>
        <section className="cx-section" aria-labelledby="workloads-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="006" label="Applications" />
              <h2
                className="cx-statement cx-statement-wide"
                id="workloads-title"
              >
                Built for systems
                <br />
                <span className="cx-dim">where decisions matter.</span>
              </h2>
            </Reveal>
            <WorkloadExplorer />
          </div>
        </section>
        <section className="cx-section" aria-labelledby="trust-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="007" label="Security & trust" />
              <h2 className="cx-statement" id="trust-title">
                Trust is part
                <br />
                <span className="cx-dim">of the system.</span>
              </h2>
            </Reveal>
            <div className="cx-trust-surface">
              <div className="cx-trust-seal" aria-hidden="true">
                <span>IDENTITY</span>
                <div>
                  <span>AUTHORIZE</span>
                  <strong>VERIFY</strong>
                  <span>RECORD</span>
                </div>
                <span>ACCOUNTABILITY</span>
              </div>
              <div className="cx-trust-list">
                {[
                  [
                    "Identity & access",
                    "Define who can view, recommend, and authorize. These are different permissions.",
                  ],
                  [
                    "Data protection",
                    "Review data boundaries, retention, and infrastructure requirements for your deployment.",
                  ],
                  [
                    "Auditability",
                    "Keep the source, scope, and owner attached to the decision record.",
                  ],
                ].map(([title, body]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
            <nav className="cx-security-links" aria-label="Trust documentation">
              <Link href="/security" className="cx-text-link">
                Security overview ↗
              </Link>
              <Link href="/legal/privacy" className="cx-text-link">
                Privacy ↗
              </Link>
              <Link href="/status" className="cx-text-link">
                Status ↗
              </Link>
            </nav>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="company-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="008" label="The company" />
              <h2 className="cx-statement cx-statement-wide" id="company-title">
                For environments where complexity
                <br />
                <span className="cx-dim">cannot be abstracted away.</span>
              </h2>
              <div className="cx-editorial-offset">
                <p className="cx-lede">
                  Our engineering direction is straightforward: expose
                  relationships, keep assumptions visible, and make the boundary
                  between a recommendation and an action explicit.
                </p>
                <Link href="/company" className="cx-text-link">
                  The Cortex philosophy ↗
                </Link>
              </div>
            </Reveal>
            <div className="cx-evolution">
              <div>
                <p className="cx-kicker">Cortex evolution / public website</p>
                <h3>
                  A record of what
                  <br />
                  we can show.
                </h3>
                <p>
                  Website milestones, not product-release claims. Product
                  milestones will be published when they have supporting
                  evidence.
                </p>
              </div>
              <Timeline
                items={[
                  {
                    year: "2026",
                    title: "Public marketing foundation",
                    body: "Product routes, technical content, consent, and contact journeys in the public website.",
                    status: "Implemented",
                  },
                  {
                    year: "2026",
                    title: "Cinematic design system",
                    body: "A shared visual language, Intelligence Field, architecture briefs, and browser journey tests.",
                    status: "Implemented",
                    active: true,
                  },
                ]}
              />
            </div>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="close-title">
          <div className="cx-wrap">
            <div className="cx-closing">
              <SectionNumber index="009" label="Start a conversation" />
              <h2 id="close-title">
                Let's build
                <br />
                the right system.
              </h2>
              <p className="cx-closing-sub">
                A technical requirement. A deployment problem. An architecture
                worth discussing. Bring us the context.
              </p>
              <div className="cx-closing-ctas">
                <Link href="/contact" className="cx-btn cx-btn-primary">
                  Talk to Cortex <ArrowRight size={16} />
                </Link>
                <Link href="/demo" className="cx-btn cx-btn-ghost">
                  Request a technical briefing
                </Link>
              </div>
              <p className="cx-kicker">
                Both paths contact the Cortex team. Neither opens a live product
                console.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
