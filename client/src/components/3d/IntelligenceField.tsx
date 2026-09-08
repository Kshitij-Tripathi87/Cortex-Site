import SceneBoundary from "./SceneBoundary";
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
    const gl = canvas.getContext("webgl2");
    const capable = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return capable;
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
  const [active, setActive] = useState(true);
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
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setCapable(!reduce && !dataSaver && (!memory || memory >= 4) && webglAvailable());
    const query = window.matchMedia("(max-width: 1024px)");
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

    let inView = true;
    const syncVisibility = () => {
      rig.current.visible.current = inView && !document.hidden;
      setActive(rig.current.visible.current);
    };
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        syncVisibility();
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
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [capable]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <div className="cx-hero-poster" style={{ backgroundImage: `url(${poster})` }} />
      {capable && (
        <SceneBoundary><Suspense fallback={null}>
          <FieldCanvas rig={rig.current} compact={compact} active={active} />
        </Suspense></SceneBoundary>
      )}
    </div>
  );
}
