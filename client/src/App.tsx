import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const DetailPage = lazy(() => import("./pages/DetailPage"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

function Router() {
  return (
    <Suspense fallback={<div className="route-loading">Loading Cortex…</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={() => <SectionPage type="product" />} />
        <Route path="/products/:slug">{(params) => <DetailPage kind="product" slug={params.slug} />}</Route>
        <Route path="/platform" component={() => <SectionPage type="platform" />} />
        <Route path="/solutions" component={() => <SectionPage type="solutions" />} />
        <Route path="/industries" component={() => <SectionPage type="industries" />} />
        <Route path="/security" component={() => <SectionPage type="security" />} />
        <Route path="/resources" component={() => <ResourcesPage view="overview" />} />
        <Route path="/resources/case-studies" component={() => <ResourcesPage view="case-studies" />} />
        <Route path="/resources/insights" component={() => <ResourcesPage view="insights" />} />
        <Route path="/resources/blog" component={() => <ResourcesPage view="blog" />} />
        <Route path="/case-study/:slug">{(params) => <DetailPage kind="case-study" slug={params.slug} />}</Route>
        <Route path="/pricing" component={PricingPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/demo" component={DemoPage} />
        <Route path="/company" component={() => <SectionPage type="company" />} />
        <Route path="/docs" component={() => <SectionPage type="docs" />} />
        <Route path="/sales" component={() => <SectionPage type="sales" />} />
        <Route path="/legal" component={() => <LegalPage />} />
        <Route path="/legal/:slug">{(params) => <LegalPage slug={params.slug} />}</Route>
        <Route path="/status" component={StatusPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <Router />;
}
