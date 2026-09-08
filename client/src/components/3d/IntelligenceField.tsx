/* Cinematic system: Intelligence Field shell. Capability detection, poster
 * fallback, pointer/scroll rig, offscreen pause. The story is never canvas-only:
 * HTML copy always carries the message. */
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { FieldRig } from "./FieldCanvas";

const FieldCanvas = lazy(() => import("./FieldCanvas"));

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type IntelligenceFieldProps = {
  className?: string;
  poster?: string;
};

export default function IntelligenceField({ className, poster = "/images/hero-field-poster.jpg" }: IntelligenceFieldProps) {
  const reduce = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [capable, setCapable] = useState(false);

  const rig = useRef<FieldRig>({
    scroll: { current: 0 },
    pointer: { current: { x: 0, y: 0 } },
    visible: { current: true },
  });

  useEffect(() => {
    const dataSaver =
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    setCapable(!reduce && !dataSaver && webglAvailable());
    const query = window.matchMedia("(max-width: 720px)");
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [reduce]);

  // Rig: pointer parallax, scroll drift, offscreen pause. Refs only — no renders.
  useEffect(() => {
    if (!capable) return;
    const host = hostRef.current;
    if (!host) return;
    let raf = 0;

    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      rig.current.pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      rig.current.pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        const progress = 1 - (rect.bottom - window.innerHeight * 0.35) / (rect.height + window.innerHeight * 0.65);
        rig.current.scroll.current = progress;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        rig.current.visible.current = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(host);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [capable]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <div className="cx-hero-poster" style={{ backgroundImage: `url(${poster})` }} />
      {capable && (
        <Suspense fallback={null}>
          <FieldCanvas rig={rig.current} compact={compact} />
        </Suspense>
      )}
    </div>
  );
}
