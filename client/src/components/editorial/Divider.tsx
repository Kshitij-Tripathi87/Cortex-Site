/* Cinematic system: hairline rules, optionally carrying a signal sweep. */
export default function Divider({ signal = false, label }: { signal?: boolean; label?: string }) {
  if (signal) return <div className="cx-signal-line" role="separator" aria-label={label ?? "Section divider"} />;
  return <hr className="cx-divider" aria-label={label ?? "Section divider"} />;
}
