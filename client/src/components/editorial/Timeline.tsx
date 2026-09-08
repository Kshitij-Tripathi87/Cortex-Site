/* Cinematic system: evolution timeline. Real milestones only. */
export type TimelineItem = {
  year: string;
  title: string;
  body: string;
  active?: boolean;
  status?: string;
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="cx-timeline" style={{ listStyle: "none", margin: 0 }}>
      {items.map((item) => (
        <li key={`${item.year}-${item.title}`} className={`cx-timeline-item${item.active ? " is-active" : ""}`}>
          <span className="cx-timeline-year">{item.year}</span>
          {item.status && (
            <span className="cx-tag is-info" style={{ marginLeft: "0.8rem" }}>
              {item.status}
            </span>
          )}
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
