/*
 * Cortex Header — Minimal Cyber-Brutalist Navigation
 *
 * Locked behavior:
 * - Transparent over hero (near-black background)
 * - After scroll: near-black, thin border, condensed height
 * - Ask Cortex = visual command-center (not fake AI chatbot)
 */

import { Menu, X, Search, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation } from "wouter";
import AnimatedButton from "./AnimatedButton";

const navItems = [
  { label: "Platform", href: "/platform" },
  { label: "Products", href: "/product" },
  { label: "Resources", href: "/docs" },
  { label: "Company", href: "/company" },
];

const askCortexItems = [
  { label: "Explore Workflo", href: "/product/workflo" },
  { label: "Explore Nexus", href: "/product/nexus" },
  { label: "Explore ASTRA", href: "/product/astra" },
  { label: "Explore Architecture", href: "/platform" },
  { label: "View Documentation", href: "/docs" },
  { label: "Talk to Cortex", href: "/sales" },
];

export default function Header() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setScrolled(window.scrollY > 60);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAskOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
      setAskOpen(false);
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`
          cortex-header
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-between
          px-[4.5vw] py-4
          transition-all duration-300 ease-out
          ${scrolled
            ? "bg-background/95 border-b border-border backdrop-blur-lg"
            : "bg-transparent border-b border-transparent"
          }
          ${scrolled ? "py-3" : "py-5"}
        `}
      >
        {/* Brand */}
        <Link href="/" className="cortex-brand flex items-center gap-3 text-foreground text-decoration-none flex-shrink-0" aria-label="Cortex home">
          <span className="cortex-mark w-8 h-8 grid place-items-center bg-primary border border-primary/50 font-mono text-xs tracking-widest">
            CX
          </span>
          <span className="font-space font-bold text-sm tracking-[0.2em]">CORTEX</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-[clamp(1.2rem,2.8vw,3rem)] ml-auto" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`
                text-xs font-medium tracking-wider uppercase
                transition-colors duration-200
                hover:text-primary
                ${location === item.href ? "text-primary" : "text-muted-foreground"}
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="cortex-search-trigger flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
            aria-label="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 border border-border rounded text-[10px] bg-card">⌘K</kbd>
          </button>

          {/* Ask Cortex — Command Center */}
          <div className="relative">
            <button
              onClick={() => setAskOpen(!askOpen)}
              onMouseLeave={() => { if (!askOpen) setAskOpen(false); }}
              className="cortex-ask-trigger flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="Ask Cortex"
              aria-expanded={askOpen}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Cortex</span>
              <ArrowRight className={`w-3 h-3 transition-transform ${askOpen ? "rotate-90" : ""}`} />
            </button>

            {askOpen && (
              <div
                className="cortex-ask-panel absolute right-0 top-full mt-2 w-[320px] bg-popover border border-border p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] animate-in slide-in-from-top-2 duration-200"
                role="menu"
              >
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary mb-3">CORTEX COMMANDS</div>
                <ul className="space-y-1">
                  {askCortexItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="cortex-ask-item flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-glass-light transition-all rounded-none"
                        onClick={() => setAskOpen(false)}
                        role="menuitem"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <AnimatedButton variant="primary" size="default" showArrow={false}>
            Book a Demo
          </AnimatedButton>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 text-foreground hover:text-primary transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`
          md:hidden fixed top-0 left-0 right-0 z-40
          bg-background border-b border-border
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
        `}
        style={{ height: mobileOpen ? "auto" : 0 }}
      >
        <nav className="px-[4.5vw] py-6 space-y-4" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-base font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="cortex-search-modal fixed inset-0 z-[60] flex items-start justify-end p-[76px]_[4.5vw]_[4.5vw] bg-background/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary">SEARCH</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search Cortex..."
                className="w-full bg-transparent border-none outline-none text-3xl font-space font-semibold text-foreground placeholder:text-muted-foreground font-mono tracking-[0.15em]"
                autoFocus
              />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Type to search products, docs, case studies...</p>
          </div>
        </div>
      )}
    </>
  );
}