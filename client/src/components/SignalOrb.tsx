/* Silverline Systems reminder: the signal visual is a controlled 3D instrument—cobalt carries energy, charcoal carries trust, and motion stays purposeful. */
export default function SignalOrb({ variant = "orb" }: { variant?: "orb" | "stack" | "grid" }) {
  return <div className={`signal-3d signal-3d-${variant}`} aria-hidden="true"><div className="signal-3d-core" /><div className="signal-3d-ring ring-a" /><div className="signal-3d-ring ring-b" /><div className="signal-3d-ring ring-c" /><div className="signal-3d-node node-a" /><div className="signal-3d-node node-b" /><div className="signal-3d-node node-c" /><div className="signal-3d-trace trace-a" /><div className="signal-3d-trace trace-b" /><div className="signal-3d-trace trace-c" /></div>;
}
