import { useEffect, useRef, useState } from "react";
import { publishedEvidence, type EvidenceResource } from "@shared/evidence";
import type { ProductSlug } from "@/lib/designContent";
export default function PublishedEvidence({ slug }: { slug?: ProductSlug }) {
  const host = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<EvidenceResource[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch("/api/content/resource", { signal: controller.signal })
          .then(response => (response.ok ? response.json() : null))
          .then(data => setEntries(publishedEvidence(data)))
          .catch(() => {
            /* Static hosting, offline, or incomplete CMS: show no metrics. */
          });
      },
      { rootMargin: "200px" }
    );
    if (host.current) observer.observe(host.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, []);
  const matching = entries.filter(
    entry => !slug || entry.metadata.product === slug
  );
  return (
    <div ref={host} className="cx-published-evidence">
      {matching.length === 0 ? (
        <p className="cx-kicker">
          No sourced benchmark loaded. Ask for a deployment-specific evidence
          review.
        </p>
      ) : (
        matching.map(entry => (
          <article className="cx-benchmark" key={entry.slug}>
            <p className="cx-kicker">
              Published benchmark / {entry.metadata.product}
            </p>
            <h3>{entry.title}</h3>
            <p className="cx-benchmark-value">
              {entry.metadata.value}
              <span>{entry.metadata.unit}</span>
            </p>
            <p>{entry.body}</p>
            <dl>
              {[
                ["Environment", entry.metadata.environment],
                ["Measured", entry.metadata.measuredAt],
                ["Methodology", entry.metadata.methodology],
                ["Limitations", entry.metadata.limitations],
                ["Published", entry.published_at.slice(0, 10)],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <a
              className="cx-text-link"
              href={entry.metadata.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Inspect source & methodology ↗
            </a>
          </article>
        ))
      )}
    </div>
  );
}
