/* Cinematic system: interactive process accordion. One stage engaged at a time;
 * the engaged stage expands its working note. */
import { useState } from "react";

export type PipelineStep = {
  index: string;
  title: string;
  body: string;
};

export default function PipelineStrip({ steps, label }: { steps: PipelineStep[]; label: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="cx-pipeline" role="group" aria-label={label}>
      {steps.map((step, i) => {
        const engaged = i === active;
        return (
          <button
            key={step.index}
            type="button"
            className={`cx-pipe-step${engaged ? " is-active" : ""}`}
            aria-expanded={engaged}
            onClick={() => setActive(i)}
          >
            <span className="cx-pipe-index">{step.index}</span>
            <span className="cx-pipe-name">{step.title}</span>
            <span className="cx-pipe-state">{engaged ? "Active" : "Standby"}</span>
            <span className="cx-pipe-desc">{step.body}</span>
          </button>
        );
      })}
    </div>
  );
}
