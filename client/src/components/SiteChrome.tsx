/* Cinematic system: shared chrome. Same exports as before — every existing page
 * keeps working, now on the dark cinematic header/footer. */
import Header from "./navigation/Header";
import Footer from "./navigation/Footer";

export function SiteHeader({ cta = { label: "Talk to Cortex", href: "/contact" } }: { cta?: { label: string; href: string } }) {
  return <Header cta={cta} />;
}

export function SiteFooter() {
  return <Footer />;
}
