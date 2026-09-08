/* Cinematic system: sparse header. Transparent over the hero, solid instrument after.
 * Products dropdown, status utility, persistent CTA, search entry. */
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, Menu, Search } from "lucide-react";
import { PRIMARY_NAV } from "@shared/site";
import ProductMenu from "./ProductMenu";
import MobileMenu from "./MobileMenu";

type HeaderProps = {
  overlay?: boolean;
  onSearch?: () => void;
  cta?: { label: string; href: string };
};

export default function Header({ overlay = false, onSearch, cta = { label: "Talk to Cortex", href: "/contact" } }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const solid = !overlay || scrolled;

  return (
    <>
      <header className={`cx-header${solid ? " is-solid" : " is-overlay"}`}>
        <div className="cx-wrap cx-header-inner">
          <Link href="/" className="cx-brand" aria-label="Cortex home">
            <span className="cx-brand-mark">
              <img src="/assets/cortex-mark.svg" alt="" width={20} height={20} />
            </span>
            <span className="cx-brand-word">CORTEX</span>
          </Link>
          <nav className="cx-nav" aria-label="Primary">
            {PRIMARY_NAV.map((item) =>
              item.label === "Products" ? (
                <span key={item.href} className="cx-product-wrap">
                  <Link href={item.href} className="cx-nav-link" aria-haspopup="true">
                    Products <ChevronDown size={13} />
                  </Link>
                  <ProductMenu />
                </span>
              ) : (
                <Link key={item.href} href={item.href} className="cx-nav-link">
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="cx-header-utility">
            <Link href="/security" className="cx-nav-link cx-security-utility">Security</Link>
            <Link href="/status" className="cx-status">
              <span aria-hidden="true">↗</span> VIEW SYSTEM STATUS
            </Link>
            {onSearch && (
              <button className="cx-icon-btn" onClick={onSearch} aria-label="Search Cortex">
                <Search size={17} />
              </button>
            )}
            <Link href={cta.href} className="cx-btn cx-btn-primary cx-header-cta">
              {cta.label} <ArrowRight size={14} />
            </Link>
            <button
              className="cx-icon-btn cx-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
