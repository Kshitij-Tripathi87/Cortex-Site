import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import CortexHeroScene from "@/components/3d/CortexHeroScene";
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
        <section className="cx-hero cx-signature cx-hero-immersive" aria-label="Cortex introduction">
          <div className="cx-hero-field-shell" aria-hidden="true">
            <CortexHeroScene />
          </div>
          <div className="cx-hero-grid" aria-hidden="true" />
          <div className="cx-hero-vignette" aria-hidden="true" />

          <div className="cx-hero-instrument cx-hero-instrument-top" aria-hidden="true">
            <span><i /> CORTEX / SYSTEM FIELD</span>
            <span>INTERACTION READY</span>
          </div>

          <div className="cx-hero-corners" aria-hidden="true">
            <span className="cx-hero-corner cx-hero-corner-a">WORLD STATE / LINKED</span>
            <span className="cx-hero-corner cx-hero-corner-b">SIGNALS / ACTIVE</span>
            <span className="cx-hero-corner cx-hero-corner-c">EVIDENCE / TRACEABLE</span>
          </div>

          <div className="cx-wrap cx-hero-content">
            <motion.div
              className="cx-hero-centerline"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <span className="cx-kicker cx-kicker-signal">CORTEX / INTELLIGENCE SYSTEMS</span>
              <span className="cx-hero-index">FIELD 001 / INTERACTIVE</span>
            </motion.div>

            <h1 className="cx-hero-title cx-hero-title-centered">
              {[
                ["Complex systems.", false],
                ["Clear decisions.", true],
              ].map(([line, accent], i) => (
                <span className="cx-line-mask" key={String(line)}>
                  <motion.span
                    className={`cx-line-inner${accent ? " cx-line-accent" : ""}`}
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1.05,
                      delay: 0.25 + i * 0.14,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="cx-hero-sub cx-hero-sub-centered"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.62 }}
            >
              Cortex connects operational data, reasoning, simulation, and evidence into one decision layer.
            </motion.p>

            <motion.div
              className="cx-hero-ctas cx-hero-ctas-centered"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.78 }}
            >
              <Link
                href="/demo"
                className="cx-btn cx-btn-primary cx-btn-cinematic"
                onClick={() => track(FUNNEL_EVENTS.heroCta, { target: "/demo" })}
              >
                <span>Book a demo</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/platform" className="cx-btn cx-btn-ghost cx-btn-cinematic">
                <span>Explore platform</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              className="cx-hero-bottom"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.05 }}
            >
              <span className="cx-hero-scrollline"><i /></span>
              <a href="#premise" className="cx-scrollcue cx-scrollcue-centered">
                Scroll to explore <span aria-hidden="true">↓</span>
              </a>
              <span className="cx-hero-bottom-meta">DATA / CONTEXT / REASONING / EVIDENCE</span>
            </motion.div>
          </div>
        </section>

        <section className="cx-section" id="premise" aria-labelledby="premise-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="001" label="The problem" />
              <h2 id="premise-title" className="cx-statement cx-statement-wide">
                Complexity is not the problem.
                <br />
                <span className="cx-dim">Invisible relationships are.</span>
              </h2>
              <p className="cx-lede cx-editorial-offset">
                Complex systems generate enormous amounts of data. But data is not a decision. Cortex connects the signals, the reasoning, and the evidence behind an action.
              </p>
            </Reveal>
            <Divider signal label="From complexity to context" />
          </div>
        </section>

        <section className="cx-section cx-section-tight" aria-labelledby="layer-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="002" label="The intelligence layer" />
              <h2 className="cx-statement" id="layer-title">
                Between signal
                <br />
                <span className="cx-dim">and action.</span>
              </h2>
              <p className="cx-lede">
                Six stages. One inspectable chain of context. Scroll to trace the model, or select a stage to investigate it.
              </p>
            </Reveal>
            <SystemSequence stages={intelligenceStages} label="The intelligence layer" scrollLinked />
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
                  Understand. Compare. Recommend. Then stop for the owner who has authority to act.
                </p>
                <p className="cx-boundary-note">
                  DEMO / SIMULATION
                  <br />
                  This is an architecture walkthrough. No connected system is controlled by this page.
                </p>
              </Reveal>
              <SystemSequence stages={operatingStages} label="How Cortex works" />
            </div>
          </div>
        </section>

        <section className="cx-section" aria-labelledby="products-title">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="004" label="The Cortex system" />
              <h2 id="products-title" className="cx-statement cx-statement-wide">
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
                      <span className="cx-kicker">System / {String(i + 1).padStart(3, "0")}</span>
                      <span className="cx-kicker">{p.category}</span>
                    </div>
                    <h3 className="cx-chapter-name">{p.name}</h3>
                  </Reveal>
                  <ProductScene slug={slug} />
                  <div className="cx-chapter-copy">
                    <h4>{p.headline}</h4>
                    <div>
                      <p>{p.intro}</p>
                      <ol className="cx-product-flow" aria-label={`${p.name} conceptual workflow`}>
                        {p.flow.map((s) => <li key={s}>{s}</li>)}
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
              <h2 className="cx-statement cx-statement-wide" id="workloads-title">
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
                  ["Identity & access", "Define who can view, recommend, and authorize. These are different permissions."],
                  ["Data protection", "Review data boundaries, retention, and infrastructure requirements for your deployment."],
                  ["Auditability", "Keep the source, scope, and owner attached to the decision record."],
                ].map(([title, body]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
            <nav className="cx-security-links" aria-label="Trust documentation">
              <Link href="/security" className="cx-text-link">Security overview ↗</Link>
              <Link href="/legal/privacy" className="cx-text-link">Privacy ↗</Link>
              <Link href="/status" className="cx-text-link">Status ↗</Link>
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
                  Our engineering direction is straightforward: expose relationships, keep assumptions visible, and make the boundary between a recommendation and an action explicit.
                </p>
                <Link href="/company" className="cx-text-link">The Cortex philosophy ↗</Link>
              </div>
            </Reveal>
            <div className="cx-evolution">
              <div>
                <p className="cx-kicker">Cortex evolution / public website</p>
                <h3>A record of what<br />we can show.</h3>
                <p>Website milestones, not product-release claims. Product milestones will be published when they have supporting evidence.</p>
              </div>
              <Timeline
                items={[
                  { year: "2026", title: "Public marketing foundation", body: "Product routes, technical content, consent, and contact journeys in the public website.", status: "Implemented" },
                  { year: "2026", title: "Cinematic design system", body: "A shared visual language, Intelligence Field, architecture briefs, and browser journey tests.", status: "Implemented", active: true },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="cx-section" aria-labelledby="close-title">
          <div className="cx-wrap">
            <div className="cx-closing">
              <SectionNumber index="009" label="Start a conversation" />
              <h2 id="close-title">Let's build<br />the right system.</h2>
              <p className="cx-closing-sub">A technical requirement. A deployment problem. An architecture worth discussing. Bring us the context.</p>
              <div className="cx-closing-ctas">
                <Link href="/demo" className="cx-btn cx-btn-primary"><span>Book a demo</span> <ArrowRight size={16} /></Link>
                <Link href="/platform" className="cx-btn cx-btn-ghost"><span>Explore platform</span> <ArrowRight size={16} /></Link>
              </div>
              <p className="cx-kicker">The demo path collects a working-session request. The platform path is a public product overview.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
