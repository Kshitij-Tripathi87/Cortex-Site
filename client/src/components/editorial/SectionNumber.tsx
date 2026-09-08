/* Cinematic system: numbered pacing. Mono, understated, never louder than the headline. */
export default function SectionNumber({ index, label }: { index: string; label: string }) {
  return (
    <p className="cx-secnum" aria-label={`Section ${index}: ${label}`}>
      <b>{index}</b> / {label}
    </p>
  );
}
