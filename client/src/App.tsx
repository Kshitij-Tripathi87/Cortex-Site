/* Silverline Systems reminder: keep navigation calm, indexed, and product-led; charcoal is the trust layer, cobalt is the signal. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import SectionPage from "./pages/SectionPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={() => <SectionPage type="product" />} />
      <Route path="/platform" component={() => <SectionPage type="platform" />} />
      <Route path="/docs" component={() => <SectionPage type="docs" />} />
      <Route path="/sales" component={() => <SectionPage type="sales" />} />
      <Route path="/company" component={() => <SectionPage type="company" />} />
      <Route path="/product/:slug">{(params) => <DetailPage kind="product" slug={params.slug} />}</Route>
      <Route path="/case-study/:slug">{(params) => <DetailPage kind="case-study" slug={params.slug} />}</Route>
      <Route path="/404" component={NotFound} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
