/* Cinematic system: product briefs (001–008) and case-study briefs.
 * Numbered, structural, honest — every figure labeled or omitted. */
import DesignProductPage from "./DesignProductPage";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import Reveal from "@/components/motion/Reveal";
import SectionNumber from "@/components/editorial/SectionNumber";
import Statement, { Dim } from "@/components/editorial/Statement";
import TechnicalLabel from "@/components/editorial/TechnicalLabel";
import StatBlock from "@/components/product/StatBlock";
import { breadcrumbJsonLd } from "@/lib/seo/structuredData";
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

/* ------------------------------------------------------------------ */
/* Product brief                                                       */
/* ------------------------------------------------------------------ */

function ProductDetailPage({ product }: { product: ProductDetail }) {
  return <DesignProductPage slug={product.slug} />;
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
            <p className="cx-boundary-note">ILLUSTRATIVE SCENARIO — not a verified customer deployment, testimonial, or measured outcome.</p>
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
