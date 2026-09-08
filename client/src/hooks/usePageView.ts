/* Silverline Systems reminder: page views are the quietest signal in the funnel.
 * One hook, every route, consent-gated — nothing to remember per page. */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/analytics/events";

export function usePageView() {
  const [path] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    trackPageView(path);
  }, [path]);
}
