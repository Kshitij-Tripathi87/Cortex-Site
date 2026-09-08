/* Silverline Systems reminder: use the detail page as an operating brief—indexed sections, clear specifications, silver planes, and cobalt reserved for decisive actions. */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, CircleArrowOutUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structuredData";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { caseStudies, products } from "@/lib/cortexContent";

export default function DetailPage({ kind, slug }: { kind: "product" | "case-study"; slug: string }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  const product = kind === "product" ? products.find((item) => item.slug === slug) : undefined;
  const story = kind === "case-study" ? caseStudies.find((item) => item.slug === slug) : undefined;

  useEffect(() => {
    if (!product && !story) navigate("/404");
  }, [navigate, product, story]);

  useEffect(() => {
    if (product) track(FUNNEL_EVENTS.productViewed, { product: product.slug });
  }, [product]);

  if (!product && !story) return null;

  if (product) {
    return <ProductDetail product={product} />;
  }

  return <CaseStudyDetail story={story!} />;
}

function ProductDetail({ product }: { product: (typeof products)[number] }) {
  const path = `/products/${product.slug}`;
  return (
    <div className="detail-site">
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
        <section className="detail-hero product-detail-hero" data-reveal>
          <div className="detail-hero-index">PRODUCT</div>
          <div className="detail-hero-copy">
            <Link href="/products" className="back-link"><ArrowLeft size={15} /> Product overview</Link>
            <h1>{product.title}</h1>
            <p className="detail-intro">{product.intro}</p>
            <div className="detail-hero-actions">
              <Link className="button-primary" href="/contact">Talk through your use case <ArrowRight size={16} /></Link>
              <a className="text-link" href="#specs">View specifications <ArrowRight size={16} /></a>
            </div>
          </div>
          <div className="detail-hero-signal plain-surface"><span className="signal-label">CORTEX / {product.name.toUpperCase()}</span></div>
        </section>
        <section id="specs" className="detail-spec-band" data-reveal>
          <div className="detail-rail">SPECIFICATIONS</div>
          <div className="detail-spec-copy">
            <div><p className="eyebrow">THE {product.name.toUpperCase()} SYSTEM</p><h2>{product.description}</h2></div>
            <div className="spec-grid">{product.capabilities.map((item) => <div className="spec-item" key={item}><strong>{item}</strong><Check size={15} /></div>)}</div>
          </div>
        </section>
        {product.sections.map((section, index) => <section data-reveal className={`detail-content-section ${index % 2 ? "section-alt" : ""}`} key={section.label}><div className="detail-rail">{section.label.split(" /")[1] || section.label}</div><div className="detail-content-grid"><div><p className="eyebrow">{section.label}</p><h2>{section.title}</h2></div><div><p className="detail-body-copy">{section.body}</p><ul className="detail-points">{section.points.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul></div></div></section>)}
        <section className="detail-cta" data-reveal><p className="eyebrow light-eyebrow">KEEP GOING</p><h2>See how {product.name} fits<br /><em>your system.</em></h2><Link href="/demo" className="button-cobalt">Book a working session <ArrowRight size={16} /></Link></section>
      </main>
      <SiteFooter />
    </div>
  );
}

function EditorialImage({ src, alt, label, className }: { src: string; alt: string; label: string; className: string }) {
  const [loaded, setLoaded] = useState(false);
  return <div className={`${className} image-loading-surface ${loaded ? "is-loaded" : ""}`}>
    <div className="image-skeleton" aria-hidden="true" />
    <img src={src} alt={alt} onLoad={() => setLoaded(true)} />
    <span>{label}</span>
  </div>;
}

function CaseStudyDetail({ story }: { story: (typeof caseStudies)[number] }) {
  const path = `/case-study/${story.slug}`;
  return (
    <div className="detail-site">
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
        <section className="detail-hero story-detail-hero" data-reveal>
          <EditorialImage className="story-detail-image" src={story.image} alt={`${story.company} editorial case study`} label={story.sector} />
          <div className="story-detail-copy">
            <Link href="/resources/case-studies" className="back-link"><ArrowLeft size={15} /> Selected stories</Link>
            <p className="eyebrow">CASE STUDY / {story.company}</p>
            <h1>{story.title}</h1>
            <blockquote>“{story.quote}”</blockquote>
          </div>
        </section>
        <section className="story-overview" data-reveal><div className="detail-rail">OVERVIEW</div><div className="story-overview-grid"><div><p className="eyebrow">THE CONTEXT</p><h2>{story.company} needed a clearer view of the system around each decision.</h2></div><div><p className="detail-body-copy">{story.overview}</p><p className="detail-body-copy"><strong>The challenge:</strong> {story.challenge}</p></div></div></section>
        <section className="story-approach" data-reveal><div className="detail-rail">APPROACH</div><div className="story-approach-content"><div><p className="eyebrow">HOW CORTEX HELPED</p><h2>Make the next right move easier to see.</h2></div><div className="approach-list">{story.approach.map((item) => <div className="approach-item" key={item}><p>{item}</p><CircleArrowOutUpRight size={17} /></div>)}</div></div></section>
        <section className="story-outcomes" data-reveal><div className="detail-rail">OUTCOMES</div><div><p className="eyebrow light-eyebrow">THE SIGNAL</p><h2>Progress you can<br /><em>feel in the system.</em></h2><div className="outcome-grid">{story.outcomes.map((item) => <div key={item}><strong>{item}</strong></div>)}</div></div></section>
        <section className="detail-cta" data-reveal><p className="eyebrow light-eyebrow">YOUR SYSTEM IS NEXT</p><h2>Bring us the<br /><em>hard question.</em></h2><Link href="/contact" className="button-cobalt">Talk to Cortex <ArrowRight size={16} /></Link></section>
      </main>
      <SiteFooter />
    </div>
  );
}
