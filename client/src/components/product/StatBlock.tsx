/* Cinematic system: datasheet stat grid. Honest structural facts only —
 * counts, coverage, structure. Never invented outcomes. */
import Metric from "../editorial/Metric";

export type Stat = {
  value: string;
  label: string;
  meta?: string;
};

export default function StatBlock({ stats, label }: { stats: Stat[]; label: string }) {
  return (
    <div className="cx-metric-row" role="list" aria-label={label}>
      {stats.map((stat) => (
        <div key={stat.label} role="listitem">
          <Metric value={stat.value} label={stat.label} meta={stat.meta} />
        </div>
      ))}
    </div>
  );
}
