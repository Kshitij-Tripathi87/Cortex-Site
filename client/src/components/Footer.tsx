/*
 * Cortex Footer — Minimal Cyber-Brutalist
 */

import { Link, useLocation } from "wouter";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "How it works", href: "/platform" },
    { label: "Integrations", href: "/platform#integrations" },
    { label: "Security", href: "/platform#security" },
    { label: "Changelog", href: "/platform#changelog" },
  ],
  Products: [
    { label: "Workflo", href: "/product/workflo" },
    { label: "Nexus", href: "/product/nexus" },
    { label: "ASTRA", href: "/product/astra" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Case Studies", href: "/#case-studies" },
    { label: "Insights", href: "/#insights" },
    { label: "API Reference", href: "/docs#api" },
  ],
  Company: [
    { label: "About", href: "/company" },
    { label: "Careers", href: "/company#careers" },
    { label: "Press", href: "/company#press" },
    { label: "Contact", href: "/sales" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/cortex", label: "Twitter" },
  { icon: Github, href: "https://github.com/cortex", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/company/cortex", label: "LinkedIn" },
];

export default function Footer() {
  const [location] = useLocation();

  return (
    <footer className="cortex-footer bg-card border-t border-border py-16 px-[4.5vw]">
      <div className="max-w-[1440px] mx-auto">
        {/* Brand Row */}
        <div className="flex items-center justify-between mb-16">
          <div className="cortex-brand flex items-center gap-3 text-foreground">
            <span className="w-8 h-8 grid place-items-center bg-primary border border-primary/50 font-mono text-xs tracking-widest">
              CX
            </span>
            <span className="font-space font-bold text-sm tracking-[0.2em]">CORTEX</span>
          </div>
          <div className="flex items-center gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary">
                {category}
              </span>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0 text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border pt-6">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
            {new Date().getFullYear()} Cortex Systems, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}