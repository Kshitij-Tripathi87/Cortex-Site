/* Silverline Systems reminder: resources are evidence, not filler. Case studies,
 * insights, and field notes — each with a clear next step, never a dead end. */

import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { api, ApiError } from "@/lib/api/client";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/events";
import { NewsletterSchema } from "@shared/schemas";
import { caseStudies } from "@/lib/cortexContent";

export type ResourcesView = "overview" | "case-studies" | "insights" | "blog";

const INSIGHT_POSTS = [
  { type: "FIELD NOTE", title: "The operating system is not the dashboard", author: "Maya Chen", role: "VP, Product" },
  { type: "BRIEFING", title: "Five signals that your data stack is becoming a bottleneck", author: "Jon Bell", role: "Research Lead" },
  { type: "PERSPECTIVE", title: "Why high-performing teams design for the handoff", author: "Priya Nair", role: "Chief of Staff" },
];

const VIEW_META: Record<ResourcesView, { path: string; eyebrow: string; title: string; intro: string }> = {
  overview: {
    path: "/resources",
    eyebrow: "RESOURCES",
    title: "Signals worth sharing.",
    intro: "Case studies, insights, and field notes — for the people deciding what comes next.",
  },
  "case-studies": {
    path: "/resources/case-studies",
    eyebrow: "RESOURCES / CASE STUDIES",
    title: "Selected stories.",
    intro: "How teams moved from “what happened?” to “what do we do next?”",
  },
  insights: {
    path: "/resources/insights",
    eyebrow: "RESOURCES / INSIGHTS",
    title: "Ideas for the next system.",
    intro: "Short, opinionated briefings from the Cortex desk.",
  },
  blog: {
    path: "/resources/blog",
    eyebrow: "RESOURCES / BLOG",
    title: "Field notes.",
    intro: "Perspectives on intelligent operations, published as we learn.",
  },
};

function useReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

export default function ResourcesPage({ view }: { view: ResourcesView }) {
  const [, navigate] = useLocation();
  useReveal();
  const meta = VIEW_META[view];

  useEffect(() => {
    if (!meta) navigate("/404");
  }, [meta, navigate]);
  if (!meta) return null;

  return (
    <div className="detail-site">
      <SEO path={meta.path} />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href={view === "overview" ? "/" : "/resources"} className="back-link">
              <ArrowLeft size={15} /> {view === "overview" ? "Cortex home" : "All resources"}
            </Link>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p className="section-page-intro">{meta.intro}</p>
            {view !== "overview" && <ResourcesTabs active={view} />}
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / RESOURCES<small>stories / insights / notes</small>
            </span>
          </div>
        </section>

        {view === "overview" && <OverviewBody />}
        {view === "case-studies" && <CaseStudiesBody />}
        {(view === "insights" || view === "blog") && <InsightsBody view={view} />}

        <NewsletterBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function ResourcesTabs({ active }: { active: ResourcesView }) {
  const tabs: { view: ResourcesView; label: string; href: string }[] = [
    { view: "case-studies", label: "Case studies", href: "/resources/case-studies" },
    { view: "insights", label: "Insights", href: "/resources/insights" },
    { view: "blog", label: "Blog", href: "/resources/blog" },
  ];
  return (
    <div className="resources-tabs" role="tablist" aria-label="Resource types">
      {tabs.map((tab) => (
        <Link key={tab.view} href={tab.href} role="tab" aria-selected={active === tab.view} className={active === tab.view ? "is-active" : ""}>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function OverviewBody() {
  return (
    <section className="section-page-list" data-reveal>
      <div className="detail-rail">LIBRARY</div>
      <div className="section-page-list-copy">
        <p className="eyebrow">START HERE</p>
        <h2>
          Three shelves, <span>one standard.</span>
        </h2>
        <div className="page-link-list">
          <Link href="/resources/case-studies">
            <div>
              <strong>Case studies</strong>
              <small>Selected stories across healthcare, financial, and industrial systems.</small>
            </div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/resources/insights">
            <div>
              <strong>Insights</strong>
              <small>Briefings for operators, builders, and curious minds.</small>
            </div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/resources/blog">
            <div>
              <strong>Blog</strong>
              <small>Field notes from the Cortex desk, published as we learn.</small>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaseStudiesBody() {
  return (
    <section className="section-page-list" data-reveal>
      <div className="detail-rail">STORIES</div>
      <div className="section-page-list-copy">
        <p className="eyebrow">EVIDENCE</p>
        <h2>
          Proof, <span>not promises.</span>
        </h2>
        <div className="resources-cards">
          {caseStudies.map((story) => (
            <Link
              key={story.slug}
              href={`/case-study/${story.slug}`}
              className="resource-card"
              onClick={() => track(FUNNEL_EVENTS.resourceDownloaded, { type: "case-study", slug: story.slug })}
            >
              <p className="eyebrow">{story.sector.toUpperCase()}</p>
              <strong>{story.title}</strong>
              <p>“{story.quote}”</p>
              <span className="resource-card-action">
                Read the story <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsBody({ view }: { view: ResourcesView }) {
  return (
    <section className="section-page-list" data-reveal>
      <div className="detail-rail">{view === "insights" ? "INSIGHTS" : "NOTES"}</div>
      <div className="section-page-list-copy">
        <p className="eyebrow">{view === "insights" ? "FROM THE CORTEX DESK" : "FRESH PERSPECTIVES"}</p>
        <h2>
          {view === "insights" ? "Read " : "Think "}
          <span>{view === "insights" ? "closely." : "clearly."}</span>
        </h2>
        <div className="insights-list resources-insights">
          {INSIGHT_POSTS.map((post) => (
            <article className="insight-row" key={post.title}>
              <div className="insight-accent" aria-hidden="true" />
              <div>
                <p className="eyebrow">{post.type}</p>
                <h3>{post.title}</h3>
                <p className="insight-author">
                  {post.author} · {post.role}
                </p>
              </div>
              <ArrowRight size={17} className="arrow-up-right" />
            </article>
          ))}
        </div>
        <p className="resources-note">Full articles publish with the CMS launch — subscribe below for the first ones.</p>
      </div>
    </section>
  );
}

function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = NewsletterSchema.safeParse({ email, source: "resources" });
    if (!parsed.success) {
      setState("error");
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }
    setState("submitting");
    setError("");
    try {
      await api.subscribeNewsletter(parsed.data);
      setState("success");
      track(FUNNEL_EVENTS.newsletterSubscribed, { from: "resources" });
    } catch (requestError) {
      setState("error");
      setError(requestError instanceof ApiError ? requestError.message : "We could not save your subscription.");
    }
  };

  return (
    <section className="newsletter-band" data-reveal>
      <div>
        <p className="eyebrow light-eyebrow">STAY CLOSE</p>
        <h2>
          One useful email, <em>when it matters.</em>
        </h2>
        <p>No noise. New case studies, briefings, and early-access windows.</p>
      </div>
      {state === "success" ? (
        <p className="newsletter-success">
          <Check size={16} /> You’re subscribed. The next briefing is on its way.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="newsletter-form">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            aria-label="Work email"
            autoComplete="email"
          />
          <button className="button-primary" type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Subscribing…
              </>
            ) : (
              <>
                Subscribe <ArrowRight size={16} />
              </>
            )}
          </button>
          {state === "error" && (
            <small className="newsletter-error" role="alert">
              {error}
            </small>
          )}
        </form>
      )}
    </section>
  );
}
