import { useState } from "react";
import { productDesign, workloads } from "@/lib/designContent";
export default function WorkloadExplorer() {
  const [active, setActive] = useState(0);
  const item = workloads[active];
  return (
    <div className="cx-workload-explorer">
      <div
        role="group"
        aria-label="Explore workloads"
        className="cx-workload-options"
      >
        {workloads.map((workload, i) => (
          <button
            key={workload.name}
            aria-pressed={i === active}
            aria-controls="workload-detail"
            onClick={() => setActive(i)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {workload.name}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div id="workload-detail" className="cx-workload-detail">
        <p className="cx-kicker">
          Illustrative application / {String(active + 1).padStart(2, "0")}
        </p>
        <h3>{item.problem}</h3>
        <p>{item.role}</p>
        <p className="cx-kicker">Architecture to inspect</p>
        {item.products.map(slug => (
          <a
            className="cx-text-link"
            key={slug}
            href={`/products/${slug}#architecture`}
          >
            {productDesign[slug].name} — {productDesign[slug].category} ↗
          </a>
        ))}
        <p className="cx-workload-note">
          Product mapping, not a customer outcome. Review the architecture and
          discuss deployment requirements with Cortex.
        </p>
      </div>
    </div>
  );
}
