/* Cinematic system: minimal, dense, premium footer. */
import { Link } from "wouter";
import { openConsentPreferences } from "../ConsentBanner";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Products",
    links: [
      { label: "Workflo", href: "/products/workflo" },
      { label: "Nexus", href: "/products/nexus" },
      { label: "ASTRA", href: "/products/astra" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Platform", href: "/platform" },
      { label: "Solutions", href: "/solutions" },
      { label: "Resources", href: "/resources" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Acceptable Use", href: "/legal/acceptable-use" },
      { label: "AI Terms", href: "/legal/ai-terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="cx-footer">
      <div className="cx-wrap">
        <div className="cx-footer-grid">
          <div className="cx-footer-brand">
            <span className="cx-brand">
              <span className="cx-brand-mark">
                <img src="/assets/cortex-mark.svg" alt="" width={20} height={20} />
              </span>
              <span className="cx-brand-word">CORTEX</span>
            </span>
            <p>Intelligence for critical systems.</p>
            <Link href="/status" className="cx-status">
              <span className="cx-status-dot" aria-hidden="true" /> SYSTEMS OPERATIONAL
            </Link>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.heading} className="cx-footer-col" aria-label={column.heading}>
              <span>{column.heading}</span>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              {column.heading === "Legal" && (
                <button type="button" className="cx-footer-link-btn" onClick={openConsentPreferences}>
                  Cookie preferences
                </button>
              )}
            </nav>
          ))}
        </div>
        <div className="cx-footer-bottom">
          <span>© 2026 Cortex</span>
          <span>CORTEX / PUBLIC SITE v1</span>
        </div>
      </div>
    </footer>
  );
}
