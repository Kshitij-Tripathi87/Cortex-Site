/* Silverline Systems reminder: keep navigation calm, indexed, and product-led; charcoal is the trust layer, cobalt is the signal. */
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ConsentBanner from "./components/ConsentBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePageView } from "./hooks/usePageView";
import Home from "./pages/Home";
const DetailPage = lazy(() => import("./pages/DetailPage"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const AdminWaitlistPage = lazy(() => import("./pages/AdminWaitlistPage"));

/**
 * Client-side fallback for legacy URLs. The server issues a 301 for these
 * same paths; this covers static hosting and in-app navigation.
 */
function LegacyRedirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);
  return null;
}

function Router() {
  usePageView();
  return (
    <Suspense fallback={<div className="cx-route-loading" role="status">Loading Cortex…</div>}><Switch>
      <Route path="/" component={Home} />

      {/* Products (canonical) */}
      <Route path="/products" component={() => <SectionPage type="product" />} />
      <Route path="/products/:slug">{(params) => <DetailPage kind="product" slug={params.slug} />}</Route>

      {/* Legacy product path → canonical (path normalization only) */}
      <Route path="/product">{() => <LegacyRedirect to="/products" />}</Route>

      {/* Platform + solutions */}
      <Route path="/platform" component={() => <SectionPage type="platform" />} />
      <Route path="/solutions" component={() => <SectionPage type="solutions" />} />
      <Route path="/industries" component={() => <SectionPage type="industries" />} />
      <Route path="/security" component={() => <SectionPage type="security" />} />

      {/* Resources */}
      <Route path="/resources" component={() => <ResourcesPage view="overview" />} />
      <Route path="/resources/case-studies" component={() => <ResourcesPage view="case-studies" />} />
      <Route path="/resources/insights" component={() => <ResourcesPage view="insights" />} />
      <Route path="/resources/blog" component={() => <ResourcesPage view="blog" />} />
      <Route path="/case-study/:slug">{(params) => <DetailPage kind="case-study" slug={params.slug} />}</Route>

      {/* Conversion */}
      <Route path="/pricing" component={PricingPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/demo" component={DemoPage} />

      {/* Company + docs (existing) */}
      <Route path="/company" component={() => <SectionPage type="company" />} />
      <Route path="/docs" component={() => <SectionPage type="docs" />} />
      <Route path="/sales" component={() => <SectionPage type="sales" />} />

      {/* Legal */}
      <Route path="/legal" component={() => <LegalPage />} />
      <Route path="/legal/:slug">{(params) => <LegalPage slug={params.slug} />}</Route>

      {/* Status + admin */}
      <Route path="/status" component={StatusPage} />
      <Route path="/admin/waitlist" component={AdminWaitlistPage} />

      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch></Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
          <ConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
