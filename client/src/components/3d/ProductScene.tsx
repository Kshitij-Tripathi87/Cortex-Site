import SceneBoundary from "./SceneBoundary";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ProductSlug } from "@/lib/designContent";
const ProductCanvas = lazy(() => import("./ProductCanvas"));
const captions = {
  workflo: "An isolated execution boundary. A record carried out.",
  nexus: "Signals converge on context. Options emerge for review.",
  astra: "One mission. Multiple architectures. Explicit trade-offs.",
};
/** Art-directed product studies. Static poster is always underneath; canvas is
 * lazy, decorative, and mounted only near the viewport on capable devices. */
export default function ProductScene({ slug }: { slug: ProductSlug }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (
      reduce ||
      nav.connection?.saveData ||
      (nav.deviceMemory && nav.deviceMemory < 4) ||
      matchMedia("(max-width: 720px)").matches
    ) {
      setCapable(false);
      return;
    }
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      setCapable(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setCapable(false);
    }
  }, [reduce]);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const image = {
    workflo: "workflo-sealed.jpg",
    nexus: "nexus-network.jpg",
    astra: "astra-mission.jpg",
  }[slug];
  return (
    <figure className={`cx-product-study is-${slug}`} ref={ref}>
      <div className="cx-product-study-art" aria-hidden="true">
        <img
          src={`/images/${image}`}
          alt=""
          loading="lazy"
          width="1440"
          height="800"
        />
        {near && capable && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <ProductCanvas slug={slug} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      <div className="cx-study-instrument" aria-hidden="true">
        <span>CX / {slug.toUpperCase()}</span>
        <span>Architecture study</span>
        <span>
          +<br />+<br />+
        </span>
      </div>
      <figcaption>
        <span>{captions[slug]}</span>
        <span>Conceptual illustration · not live telemetry</span>
      </figcaption>
    </figure>
  );
}
