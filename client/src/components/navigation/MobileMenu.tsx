/* Cinematic system: full-screen navigation overlay. Staggered links, calm exit. */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, X } from "lucide-react";
import { PRIMARY_NAV } from "@shared/site";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`cx-mobilemenu${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Site navigation" aria-hidden={!open}>
      <div className="cx-mobilemenu-top">
        <span className="cx-brand">
          <span className="cx-brand-mark">
            <img src="/assets/cortex-mark.svg" alt="" width={20} height={20} />
          </span>
          <span className="cx-brand-word">CORTEX</span>
        </span>
        <button ref={closeRef} className="cx-icon-btn" onClick={onClose} aria-label="Close navigation" tabIndex={open ? 0 : -1}>
          <X size={22} />
        </button>
      </div>
      <nav className="cx-menu-links" aria-label="Mobile">
        {PRIMARY_NAV.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="cx-menu-link"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            <small>0{index + 1}</small> {item.label}
          </Link>
        ))}
        <Link href="/contact" className="cx-menu-link" onClick={onClose} tabIndex={open ? 0 : -1}>
          <small>06</small> Contact
        </Link>
      </nav>
      <div className="cx-menu-foot">
        <Link href="/contact" className="cx-btn cx-btn-primary" onClick={onClose} tabIndex={open ? 0 : -1}>
          Talk to Cortex <ArrowRight size={15} />
        </Link>
        <Link href="/status" className="cx-status" onClick={onClose} tabIndex={open ? 0 : -1}>
          <span className="cx-status-dot" aria-hidden="true" /> SYSTEMS OPERATIONAL
        </Link>
      </div>
    </div>
  );
}
