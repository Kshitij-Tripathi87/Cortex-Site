import PublishedEvidence from "./PublishedEvidence";
import { Link } from "wouter";
import type { ProductSlug } from "@/lib/designContent";
/** Never substitute structural counts for measured performance. */
export default function ProductEvidence({ slug }: { slug?: ProductSlug }) {
  return (
    <>
      <div className="cx-evidence-register">
        <div className="cx-evidence-intro">
          <span className="cx-tag">Publication status</span>
          <h3>
            Inspect the model.
            <br />
            Ask for the measurement.
          </h3>
          <p>
            Architecture illustrations explain intent; they are not performance
            evidence. Only published benchmark entries with complete provenance
            can appear below. No customer outcome is implied.
          </p>
        </div>
        <div className="cx-evidence-entries">
          <a href={slug ? `#architecture` : "/products/nexus#architecture"}>
            <span className="cx-kicker">01 / Architecture</span>
            <h3>Follow the system boundaries ↗</h3>
            <p>Conceptual model · inputs, constraints, and review points.</p>
          </a>
          <Link href="/docs">
            <span className="cx-kicker">02 / Technical documentation</span>
            <h3>Read the technical context ↗</h3>
            <p>
              Documentation · evaluate scope before making a deployment
              decision.
            </p>
          </Link>
          <Link href="/contact">
            <span className="cx-kicker">03 / Validation request</span>
            <h3>Define an evidence review ↗</h3>
            <p>
              Request environment, methodology, date, limitations, and source
              artifacts. No result is implied.
            </p>
          </Link>
        </div>
      </div>
      <PublishedEvidence slug={slug} />
    </>
  );
}
