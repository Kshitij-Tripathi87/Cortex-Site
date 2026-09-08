import { useEffect } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import SectionNumber from "@/components/editorial/SectionNumber";
import ProductMotion from "@/components/motion/ProductMotion";
import ArchitectureDiagram from "@/components/product/ArchitectureDiagram";
import ProductScene from "@/components/3d/ProductScene";
import ProductEvidence from "@/components/product/ProductEvidence";
import SystemSequence from "@/components/system/SystemSequence";
import { productDesign, type ProductSlug } from "@/lib/designContent";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structuredData";
export default function DesignProductPage({ slug }: { slug: ProductSlug }) {
  const p = productDesign[slug];
  useEffect(() => {
    if (window.location.hash === "#architecture") {
      const frame = requestAnimationFrame(() =>
        document.getElementById("architecture")?.scrollIntoView()
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [slug]);
  const path = `/products/${slug}`;
  return (
    <div className="cx-page cx-design-page">
      <SEO
        path={path}
        jsonLd={[
          productJsonLd({ name: p.name, path, description: p.intro }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: p.name, path },
          ]),
        ]}
      />
      <Header />
      <a href="#product-main" className="cx-skip">
        Skip to content
      </a>
      <main id="product-main">
        <header className="cx-design-product-hero">
          <div className="cx-wrap">
            <nav aria-label="Breadcrumb" className="cx-kicker">
              <Link href="/">Home</Link> /{" "}
              <Link href="/products">Products</Link> / {p.name}
            </nav>
            <p className="cx-kicker">001 / {p.category}</p>
            <h1>{p.name}</h1>
            <div className="cx-chapter-copy">
              <h2>{p.headline}</h2>
              <div>
                <p>{p.intro}</p>
                <Link href="/demo" className="cx-btn cx-btn-primary">
                  Request a technical briefing ↗
                </Link>
                <p className="cx-kicker">
                  Architecture brief / not a live product interface
                </p>
              </div>
            </div>
            <ProductScene slug={slug} />
          </div>
        </header>
        <section className="cx-section" aria-labelledby="capability-title">
          <div className="cx-wrap">
            <ProductMotion slug={slug}>
              <SectionNumber index="002" label="Core capability" />
              <h2 className="cx-statement" id="capability-title">
                {p.capability}
              </h2>
              <p className="cx-lede cx-editorial-offset">{p.body}</p>
            </ProductMotion>
          </div>
        </section>
        <section
          className="cx-section"
          id="architecture"
          aria-labelledby="architecture-title"
        >
          <div className="cx-wrap">
            <ProductMotion slug={slug} index={1}>
              <SectionNumber index="003" label="Architecture" />
              <h2 className="cx-statement" id="architecture-title">
                A system you
                <br />
                <span className="cx-dim">can trace.</span>
              </h2>
            </ProductMotion>
            <div className="cx-architecture-layout">
              <ArchitectureDiagram
                variant={slug}
                title={`${p.name} mechanism diagram`}
              />
              <div>
                <p className="cx-kicker">Conceptual architecture</p>
                <h3>
                  Inputs. Boundaries.
                  <br />
                  Reviewable outputs.
                </h3>
                <ol className="cx-architecture-key">
                  {p.flow.map((step, i) => (
                    <li key={step}>
                      <strong>{step}</strong>
                      <p>{p.details[i]}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="workflow-title">
          <div className="cx-wrap">
            <ProductMotion slug={slug} index={2}>
              <SectionNumber index="004" label="How it works" />
              <h2 id="workflow-title" className="cx-statement">
                Follow the work.
                <br />
                <span className="cx-dim">Inspect every boundary.</span>
              </h2>
            </ProductMotion>
            <SystemSequence
              label={`${p.name} workflow`}
              stages={p.flow.map((name, i) => ({
                name,
                body: p.details[i],
                output: name,
              }))}
            />
            <p className="cx-boundary-note">
              DEMO / SIMULATION — selecting a stage only changes this
              illustration. Live execution requires a separate deployed
              integration and explicit authorization.
            </p>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="proof-title">
          <div className="cx-wrap">
            <SectionNumber index="005" label="Performance / evidence" />
            <h2 className="cx-statement" id="proof-title">
              Evidence before
              <br />
              <span className="cx-dim">a performance claim.</span>
            </h2>
            <ProductEvidence slug={slug} />
          </div>
        </section>
        <section className="cx-section" aria-labelledby="uses-title">
          <div className="cx-wrap">
            <SectionNumber index="006" label="Workloads / use cases" />
            <h2 className="cx-statement" id="uses-title">
              Where the model
              <br />
              <span className="cx-dim">meets the work.</span>
            </h2>
            <p className="cx-lede">
              Illustrative applications, not reported customer deployments.
            </p>
            <ol className="cx-use-list">
              {p.workloads.map((workload, i) => (
                <li key={workload}>
                  <span className="cx-kicker">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <h3>{workload}</h3>
                  <Link href="/contact" className="cx-text-link">
                    Discuss requirements ↗
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="security-title">
          <div className="cx-wrap">
            <SectionNumber index="007" label="Security / trust" />
            <h2 className="cx-statement" id="security-title">
              Know what the
              <br />
              <span className="cx-dim">boundary guarantees.</span>
            </h2>
            <p className="cx-lede cx-editorial-offset">{p.trust}</p>
            <nav
              className="cx-security-links"
              aria-label="Product trust resources"
            >
              <Link href="/security" className="cx-text-link">
                Security overview ↗
              </Link>
              <Link href="/legal/privacy" className="cx-text-link">
                Data & privacy ↗
              </Link>
              <Link href="/legal/ai-terms" className="cx-text-link">
                AI terms ↗
              </Link>
            </nav>
          </div>
        </section>
        <section className="cx-section" aria-labelledby="handoff-title">
          <div className="cx-wrap">
            <div className="cx-closing">
              <SectionNumber index="008" label="Technical briefing" />
              <h2 id="handoff-title">
                Bring the constraint.
                <br />
                Explore the system.
              </h2>
              <p className="cx-closing-sub">
                Discuss your environment, requirements, and the evidence you
                need to evaluate {p.name}.
              </p>
              <div className="cx-closing-ctas">
                <Link href="/demo" className="cx-btn cx-btn-primary">
                  Request a technical briefing ↗
                </Link>
                <Link href="/contact" className="cx-btn cx-btn-ghost">
                  Talk to Cortex
                </Link>
              </div>
              <nav className="cx-closing-routes" aria-label="Other systems">
                {(Object.keys(productDesign) as ProductSlug[])
                  .filter(s => s !== slug)
                  .map(s => (
                    <Link key={s} href={`/products/${s}`}>
                      {productDesign[s].name} — {productDesign[s].category}
                    </Link>
                  ))}
              </nav>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
