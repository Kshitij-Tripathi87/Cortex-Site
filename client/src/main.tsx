import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import App from "./App";
import "./index.css";

// Cinematic scroll foundation: Lenis drives smooth, consistent scroll velocity
// for the whole site. Reduced motion keeps native scrolling untouched.
function initSmoothScroll() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

initSmoothScroll();

createRoot(document.getElementById("root")!).render(<App />);
