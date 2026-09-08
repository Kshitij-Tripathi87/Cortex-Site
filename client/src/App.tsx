/* Silverline Systems reminder: keep navigation calm, indexed, and product-led; charcoal is the trust layer, cobalt is the signal. */
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ConsentBanner from "./components/ConsentBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePageView } from "./hooks/usePageView";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import SectionPage from "./pages/SectionPage";
import ResourcesPage from "./pages/ResourcesPage";
import LegalPage from "./pages/LegalPage";
import PricingPage from "./pages/PricingPage";
import StatusPage from "./pages/StatusPage";
import ContactPage from "./pages/ContactPage";
import DemoPage from "./pages/DemoPage";
import AdminWaitlistPage from "./pages/AdminWaitlistPage";

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

function LegacyProductRedirect({ slug }: { slug: string }) {
  const map: Record<string, string> = {
    sense: "workflo",
    decide: "nexus",
    scale: "astra",
  };
  return <LegacyRedirect to={`/products/${map[slug] ?? slug}`} />;
}

function Router() {
  usePageView();
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Products (canonical) */}
      <Route path="/products" component={() => <SectionPage type="product" />} />
      <Route path="/products/:slug">{(params) => <DetailPage kind="product" slug={params.slug} />}</Route>

      {/* Legacy product paths → canonical */}
      <Route path="/product">{() => <LegacyRedirect to="/products" />}</Route>
      <Route path="/product/:slug">{(params) => <LegacyProductRedirect slug={params.slug} />}</Route>

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
    </Switch>
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
