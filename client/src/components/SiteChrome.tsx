/* Silverline Systems reminder: chrome is calm infrastructure — charcoal trust layer,
 * indexed navigation, cobalt reserved for the decisive action. */

import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { FOOTER_COLUMNS, PRIMARY_NAV } from "@shared/site";
import { openConsentPreferences } from "./ConsentBanner";

const mark = "/assets/cortex-mark.svg";

export function SiteHeader({ cta = { label: "Talk to Cortex", href: "/contact" } }: { cta?: { label: string; href: string } }) {
  return (
    <header className="detail-header">
      <Link href="/" className="brand" aria-label="Cortex home">
        <span className="brand-mark-shell">
          <img src={mark} alt="" className="brand-mark" />
        </span>
        <span className="brand-wordmark">CORTEX</span>
      </Link>
      <nav className="detail-nav" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href={cta.href} className="detail-header-cta">
        {cta.label} <ArrowRight size={15} />
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="detail-footer-multi">
      <div className="detail-footer-brand">
        <span className="brand-mark-shell">
          <img src={mark} alt="" className="brand-mark" />
        </span>
        <span className="brand-wordmark">CORTEX</span>
        <p>Intelligence for critical systems.</p>
        <Link href="/status" className="status-pill">
          <span className="status-dot" aria-hidden="true" /> Systems operational
        </Link>
      </div>
      <div className="detail-footer-grid">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <span>{column.heading}</span>
            {column.links.map((link) => (
              <Link key={link.href + link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="detail-footer-bottom">
        <span>© 2026 Cortex Systems, Inc.</span>
        <button type="button" className="footer-consent-link" onClick={openConsentPreferences}>
          Cookie preferences
        </button>
        <span>Made for the moments that matter.</span>
      </div>
    </footer>
  );
}
