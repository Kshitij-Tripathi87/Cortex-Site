/* Cinematic system: status ticker. A quiet mono strip of system states looping
 * beneath the hero. Pure CSS motion; still under reduced motion. */
const DEFAULT_ITEMS = [
  "Sealed execution",
  "Ranked options",
  "Sandboxed rehearsal",
  "One operating picture",
  "Verifiable proof",
  "Signal → decision → proof",
];

export default function Ticker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  return (
    <div className="cx-ticker" role="marquee" aria-label="Cortex system states">
      <div className="cx-ticker-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="cx-ticker-group" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span key={item} className="cx-ticker-item">
                {item} <i aria-hidden="true">+</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
