/* Cinematic system: datasheet metric. Every number must have provenance — pass
 * honest structural facts only; label anything illustrative. */
export default function Metric({ value, label, meta }: { value: string; label: string; meta?: string }) {
  return (
    <div className="cx-metric">
      <div className="cx-metric-value">{value}</div>
      <div className="cx-metric-rule" aria-hidden="true" />
      <div className="cx-metric-label">{label}</div>
      {meta && <div className="cx-metric-meta">{meta}</div>}
    </div>
  );
}
