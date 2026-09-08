/* Cinematic system: product briefs (001–008) and case-study briefs.
 * Numbered, structural, honest — every figure labeled or omitted. */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import Reveal from "@/components/motion/Reveal";
import ProductMotion from "@/components/motion/ProductMotion";
import SectionNumber from "@/components/editorial/SectionNumber";
import Statement, { Dim } from "@/components/editorial/Statement";
import TechnicalLabel from "@/components/editorial/TechnicalLabel";
import StatBlock from "@/components/product/StatBlock";
import PipelineStrip from "@/components/product/PipelineStrip";
import ArchitectureDiagram from "@/components/product/ArchitectureDiagram";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structuredData";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { caseStudies, products, type CaseStudyDetail, type ProductDetail } from "@/lib/cortexContent";

export default function DetailPage({ kind, slug }: { kind: "product" | "case-study"; slug: string }) {
  const [, navigate] = useLocation();
  const product = kind === "product" ? products.find((item) => item.slug === slug) : undefined;
  const story = kind === "case-study" ? caseStudies.find((item) => item.slug === slug) : undefined;

  useEffect(() => {
    if (!product && !story) navigate("/404");
  }, [navigate, product, story]);

  useEffect(() => {
    if (product) track(FUNNEL_EVENTS.productViewed, { product: product.slug });
  }, [product]);

  if (!product && !story) return null;
  if (product) return <ProductDetailPage product={product} />;
  return <CaseStudyDetailPage story={story!} />;
}

function ProductTag({ tag }: { tag: string }) {
  const tone = tag === "SIMULATION" ? "is-sim" : "is-live";
  return <span className={`cx-tag ${tone}`}>{tag}</span>;
}

/* ------------------------------------------------------------------ */
/* Product brief                                                       */
/* ------------------------------------------------------------------ */

function ProductDetailPage({ product }: { product: ProductDetail }) {
  const path = `/products/${product.slug}`;
  const others = products.filter((item) => item.slug !== product.slug);

  return (
    <div className="cx-page">
      <SEO
        path={path}
        jsonLd={[
          productJsonLd({ name: product.name, path, description: product.description }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path },
          ]),
        ]}
      />
      <SiteHeader />
      <main>
        {/* 001 — FILM */}
        <header className="cx-product-hero">
          <div className="cx-product-hero-bg" style={{ backgroundImage: `url(${product.image})` }} aria-hidden="true" />
          <div className="cx-wrap">
            <Link href="/products" className="cx-text-link">
              <ArrowLeft size={15} /> Product overview
            </Link>
            <p className="cx-kicker" style={{ marginTop: "2.4rem" }}>
              001 / {product.category}
            </p>
            <h1>{product.name}</h1>
            <p className="cx-product-state" style={{ maxWidth: "24ch" }}>
              {product.statement} <span className="cx-dim">{product.statementDim}</span>
            </p>
            <div className="cx-solution-tags" style={{ margin: "1.6rem 0 2.2rem" }}>
              <ProductTag tag={product.tag} />
              <span className="cx-tag is-info">{product.status}</span>
            </div>
            <div className="cx-hero-ctas" style={{ marginTop: 0 }}>
              <Link
                href="/demo"
                className="cx-btn cx-btn-primary"
                onClick={() => track(FUNNEL_EVENTS.demoStarted, { product: product.slug })}
              >
                See it run <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="cx-btn cx-btn-ghost">
                Talk to Cortex
              </Link>
            </div>
          </div>
        </header>

        {/* 002 — STATEMENT */}
        <section className="cx-section cx-section-tight" aria-label={`${product.name} declaration`}>
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={0}>
              <SectionNumber index="002" label="Declaration" />
              <Statement wide>
                {product.declaration} <Dim>{product.declarationDim}</Dim>
              </Statement>
            </ProductMotion>
          </div>
        </section>

        {/* 003 — WHERE IT ACTS */}
        <section className="cx-section cx-section-tight" aria-label="Where it acts">
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={1}>
              <SectionNumber index="003" label="Where it acts" />
              <Statement>
                {product.whereItActs.title.split(".")[0]}.{" "}
                <Dim>{product.whereItActs.title.split(".").slice(1).join(".").trim() || product.intro}</Dim>
              </Statement>
            </ProductMotion>
            <div className="cx-pagenum-body" style={{ marginTop: "2.5rem" }}>
              <ProductMotion slug={product.slug} index={2}>
                <p className="cx-lede">{product.whereItActs.body}</p>
              </ProductMotion>
              <ProductMotion slug={product.slug} index={3}>
                <ul className="cx-capability-list">
                  {product.whereItActs.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} aria-hidden="true" /> {bullet}
                    </li>
                  ))}
                </ul>
              </ProductMotion>
            </div>
          </div>
        </section>

        {/* 004 — MOVEMENT */}
        <section className="cx-section cx-section-tight" aria-label="Movement">
          <div className="cx-wrap">
            <div className="cx-split">
              <ProductMotion slug={product.slug} index={4} className="cx-split-sticky">
                <SectionNumber index="004" label="Movement" />
                <Statement>
                  Four moves. <Dim>No paperwork.</Dim>
                </Statement>
                <p className="cx-lede" style={{ marginTop: "1.6rem" }}>
                  The working rhythm of {product.name} — select a stage to inspect it.
                </p>
              </ProductMotion>
              <ProductMotion slug={product.slug} index={5}>
                <PipelineStrip label={`${product.name} movement`} steps={product.movement} />
              </ProductMotion>
            </div>
          </div>
        </section>

        {/* 005 — MECHANISM */}
        <section className="cx-section cx-section-tight" aria-label="Mechanism">
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={6}>
              <SectionNumber index="005" label="Mechanism" />
              <Statement>
                {product.mechanism.title.split(".")[0]}.{" "}
                <Dim>{product.mechanism.title.split(".").slice(1).join(".").trim() || "Illustrated, not measured."}</Dim>
              </Statement>
            </ProductMotion>
            <div className="cx-pagenum-body" style={{ marginTop: "2.5rem" }}>
              <ProductMotion slug={product.slug} index={7}>
                <div className="cx-diagram">
                  <ArchitectureDiagram variant={product.slug} title={`${product.name} mechanism diagram`} />
                </div>
              </ProductMotion>
              <ProductMotion slug={product.slug} index={8}>
                <p className="cx-lede">{product.mechanism.body}</p>
                <ul className="cx-capability-list" style={{ marginTop: "1.6rem" }}>
                  {product.mechanism.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} aria-hidden="true" /> {bullet}
                    </li>
                  ))}
                </ul>
                {product.mechanism.note && (
                  <p className="cx-lede" style={{ marginTop: "1.6rem" }}>
                    <span className="cx-tag is-sim">Sandboxed</span>{" "}
                    <span style={{ display: "block", marginTop: "0.9rem" }}>{product.mechanism.note}</span>
                  </p>
                )}
              </ProductMotion>
            </div>
          </div>
        </section>

        {/* 006 — STACK */}
        <section className="cx-section cx-section-tight" aria-label="The stack">
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={9}>
              <SectionNumber index="006" label="The stack" />
              <Statement>
                Three parts. <Dim>Each verifiable alone.</Dim>
              </Statement>
            </ProductMotion>
            <ProductMotion slug={product.slug} index={10}>
              <div className="cx-workload-grid">
                {product.stack.map((spec) => (
                  <div key={spec.title} className="cx-workload">
                    <TechnicalLabel>{spec.meta}</TechnicalLabel>
                    <h3 style={{ marginTop: "0.8rem" }}>{spec.title}</h3>
                    <p>{spec.body}</p>
                  </div>
                ))}
              </div>
            </ProductMotion>
          </div>
        </section>

        {/* 007 — PROOF */}
        <section className="cx-section cx-section-tight" aria-label="Proof">
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={11}>
              <SectionNumber index="007" label="Proof" />
              <Statement>
                Structure, counted. <Dim>Outcomes, never invented.</Dim>
              </Statement>
            </ProductMotion>
            <ProductMotion slug={product.slug} index={12}>
              <div style={{ marginTop: "2.5rem" }}>
                <StatBlock label={`${product.name} structure`} stats={product.proof} />
                <p style={{ marginTop: "1.4rem" }}>
                  <TechnicalLabel>{product.proofNote}</TechnicalLabel>
                </p>
              </div>
            </ProductMotion>
          </div>
        </section>

        {/* 008 — HANDOFF */}
        <section className="cx-section" aria-label="Continue">
          <div className="cx-wrap">
            <ProductMotion slug={product.slug} index={13}>
              <div className="cx-closing">
                <SectionNumber index="008" label="Handoff" />
                <h2>One layer. Three systems.</h2>
                <p className="cx-closing-sub">{product.handoff}</p>
                <div className="cx-closing-ctas">
                  <Link
                    href="/demo"
                    className="cx-btn cx-btn-primary"
                    onClick={() => track(FUNNEL_EVENTS.demoStarted, { product: product.slug })}
                  >
                    Book a working session <ArrowRight size={15} />
                  </Link>
                  <Link href="/contact" className="cx-btn cx-btn-ghost">
                    Talk to Cortex
                  </Link>
                </div>
                <nav className="cx-closing-routes" aria-label="Other systems">
                  {others.map((item) => (
                    <Link key={item.slug} href={`/products/${item.slug}`}>
                      {item.name} — {item.category}
                    </Link>
                  ))}
                  <Link href="/platform">The platform</Link>
                </nav>
              </div>
            </ProductMotion>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Case-study brief                                                    */
/* ------------------------------------------------------------------ */

function CaseStudyDetailPage({ story }: { story: CaseStudyDetail }) {
  const path = `/case-study/${story.slug}`;
  const others = caseStudies.filter((item) => item.slug !== story.slug);

  return (
    <div className="cx-page">
      <SEO
        path={path}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/resources/case-studies" },
          { name: story.company, path },
        ])}
      />
      <SiteHeader />
      <main>
        {/* INDEX */}
        <header className="cx-product-hero">
          <div className="cx-wrap">
            <Link href="/resources/case-studies" className="cx-text-link">
              <ArrowLeft size={15} /> Selected stories
            </Link>
            <p className="cx-kicker" style={{ marginTop: "2.4rem" }}>
              Case study / {story.company}
            </p>
            <h1>{story.title}</h1>
            <p className="cx-product-cat">{story.sector}</p>
            <blockquote className="cx-story-quote" style={{ marginTop: "1.6rem", maxWidth: "26ch" }}>
              “{story.quote}”
            </blockquote>
            <p style={{ marginTop: "1.2rem" }}>
              <TechnicalLabel>{story.source}</TechnicalLabel>
            </p>
            <div className="cx-solution-tags" style={{ margin: "1.8rem 0 0" }}>
              <span className="cx-tag is-info">{story.systemUsed}</span>
              <span className="cx-tag">Illustrated brief</span>
            </div>
          </div>
        </header>

        <section className="cx-section cx-section-tight" aria-label={`${story.company} deployment`}>
          <div className="cx-wrap">
            <Reveal>
              <div className="cx-story-hero-img" style={{ backgroundImage: `url(${story.image})` }} role="img" aria-label={`${story.company} deployment artwork`} />
            </Reveal>
          </div>
        </section>

        {/* CONSTRAINT */}
        <section className="cx-section cx-section-tight" aria-label="The constraint">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="Constraint" label={story.company} />
              <Statement>{story.constraint.title}</Statement>
            </Reveal>
            <div className="cx-pagenum-body" style={{ marginTop: "2.5rem" }}>
              <Reveal>
                <p className="cx-lede">{story.constraint.body}</p>
              </Reveal>
              <Reveal delay={0.08}>
                <ul className="cx-capability-list">
                  {story.constraint.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} aria-hidden="true" /> {bullet}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* COUNT */}
        <section className="cx-section cx-section-tight" aria-label="Deployment structure">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="Count" label="Deployment structure" />
              <Statement>
                Counted, not claimed. <Dim>Structure from the brief.</Dim>
              </Statement>
            </Reveal>
            <Reveal delay={0.06}>
              <div style={{ marginTop: "2.5rem" }}>
                <StatBlock label={`${story.company} deployment structure`} stats={story.figures} />
                <p style={{ marginTop: "1.4rem" }}>
                  <TechnicalLabel>{story.figuresNote}</TechnicalLabel>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* METHOD */}
        <section className="cx-section cx-section-tight" aria-label="Method">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="Method" label="How Cortex helped" />
              <Statement>
                Make the next right move <Dim>easier to see.</Dim>
              </Statement>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="cx-pagenum-body" style={{ marginTop: "2.5rem" }}>
                <p className="cx-lede">
                  {story.systemUsed} on one layer — signals unified, decisions routed, records sealed.
                </p>
                <ul className="cx-capability-list">
                  {story.approach.map((item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SIGNAL */}
        <section className="cx-section cx-section-tight" aria-label="Signal">
          <div className="cx-wrap">
            <Reveal>
              <SectionNumber index="Signal" label="What changed" />
              <Statement>
                Progress you can <Dim>feel in the system.</Dim>
              </Statement>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="cx-workload-grid">
                {story.outcomes.map((outcome, i) => (
                  <div key={outcome} className="cx-workload">
                    <TechnicalLabel>Signal / 0{i + 1}</TechnicalLabel>
                    <h3 style={{ marginTop: "0.8rem" }}>{outcome}</h3>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CLOSE */}
        <section className="cx-section" aria-label="Continue">
          <div className="cx-wrap">
            <Reveal>
              <div className="cx-closing">
                <h2>Your system is next.</h2>
                <p className="cx-closing-sub">
                  Bring us the hard question. We will make the first conversation useful —
                  one decision, mapped against the layer.
                </p>
                <div className="cx-closing-ctas">
                  <Link
                    href="/contact"
                    className="cx-btn cx-btn-primary"
                    onClick={() => track(FUNNEL_EVENTS.contactStarted, { source: "case-study" })}
                  >
                    Talk to Cortex <ArrowRight size={15} />
                  </Link>
                  <Link href="/products" className="cx-btn cx-btn-ghost">
                    Tour the systems
                  </Link>
                </div>
                <nav className="cx-closing-routes" aria-label="More briefs">
                  {others.map((item) => (
                    <Link key={item.slug} href={`/case-study/${item.slug}`}>
                      {item.company}
                    </Link>
                  ))}
                  <Link href="/resources/case-studies">All briefs</Link>
                </nav>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
