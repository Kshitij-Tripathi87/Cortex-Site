import { useEffect, useState, type RefObject } from "react";

export type ScrollProgress = {
  /** 0 → section top reaches viewport top; 1 → section bottom leaves viewport */
  progress: number;
  /** Discrete activation step across `steps` slices of the scroll range */
  step: number;
};

/**
 * Scroll-driven progress for a section. Binds scroll position to 3D state,
 * heading transforms, and activation rails without a heavy dependency.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, steps: number): ScrollProgress {
  const [state, setState] = useState<ScrollProgress>({ progress: 0, step: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const step = Math.min(steps - 1, Math.max(0, Math.floor(progress * steps)));
      setState((prev) =>
        prev.progress === progress && prev.step === step ? prev : { progress, step },
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, steps]);

  return state;
}
