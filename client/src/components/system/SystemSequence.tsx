import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Stage = { name: string; body: string; output: string };
/** Native scroll drives a conceptual model. Selecting a stage takes control;
 * no clock-driven content changes and no live actions. */
export default function SystemSequence({
  stages,
  label,
  scrollLinked = false,
}: {
  stages: Stage[];
  label: string;
  scrollLinked?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const reduce = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!scrollLinked || reduce || manual) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!host.current) return;
        const r = host.current.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(
            0.999,
            (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.3)
          )
        );
        setActive(Math.floor(progress * stages.length));
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [scrollLinked, reduce, manual, stages.length]);
  const stage = stages[active];
  return (
    <div ref={host} className="cx-sequence">
      <div className="cx-sequence-label">
        <span>Conceptual architecture / not a live product</span>
        <span>
          {scrollLinked && !reduce && !manual
            ? "Scroll to trace"
            : "Select to inspect"}
        </span>
      </div>
      <div className="cx-sequence-steps" role="group" aria-label={label}>
        {stages.map((item, i) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={active === i}
            aria-controls={id}
            onClick={() => {
              setManual(true);
              setActive(i);
            }}
          >
            <span>{String(i + 1).padStart(3, "0")}</span>
            <strong>{item.name}</strong>
            <span aria-hidden="true">{active === i ? "−" : "+"}</span>
          </button>
        ))}
      </div>
      <div className="cx-sequence-result" id={id}>
        <div className="cx-signal-model" aria-hidden="true" data-stage={active}>
          <svg viewBox="0 0 400 220">
            <path d="M20 40L150 110L20 180M20 110H380M150 110L260 40L380 110L260 180Z" />
            {[
              [20, 40],
              [20, 110],
              [20, 180],
              [150, 110],
              [260, 40],
              [260, 180],
              [380, 110],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === 3 ? 12 : 5}
                className={i <= active ? "is-active" : ""}
              />
            ))}
          </svg>
          <span>{stage.output}</span>
        </div>
        <div>
          <p className="cx-kicker">
            {String(active + 1).padStart(3, "0")} / {label}
          </p>
          <h3>{stage.name}</h3>
          <p>{stage.body}</p>
          {scrollLinked && manual && !reduce && (
            <button className="cx-text-link" onClick={() => setManual(false)}>
              Resume scroll guidance ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
