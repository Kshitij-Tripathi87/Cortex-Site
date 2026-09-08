/* Silverline Systems reminder: a 404 is still Cortex — indexed, calm, and helpful.
 * Say what happened, offer the way back, never a dead end. */

import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <div className="detail-site">
      <SEO path="/404" title="Page not found — Cortex" description="The page you’re looking for doesn’t exist or was moved." noIndex />
      <SiteHeader />
      <main>
        <section className="section-page-hero" data-reveal>
          <div className="section-page-copy">
            <Link href="/" className="back-link">
              <ArrowLeft size={15} /> Cortex home
            </Link>
            <p className="eyebrow">404 / NOT FOUND</p>
            <h1>
              Off the
              <br />
              <em>system map.</em>
            </h1>
            <p className="section-page-intro">
              This page doesn’t exist or was moved. The system is fine — let’s get you back to it.
            </p>
            <div className="notfound-actions">
              <Link href="/" className="button-primary">
                Back to home <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="text-link">
                Talk to Cortex <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="section-page-visual plain-surface">
            <span className="visual-readout">
              CORTEX / 404<small>recalibrating</small>
            </span>
          </div>
        </section>

        <section className="section-page-list">
          <div className="detail-rail">WAYS BACK</div>
          <div className="section-page-list-copy">
            <p className="eyebrow">POPULAR ROUTES</p>
            <h2>
              Start <span>here.</span>
            </h2>
            <div className="page-link-list">
              <Link href="/platform">
                <div>
                  <strong>Platform</strong>
                  <small>The intelligence layer beneath the work.</small>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href="/products">
                <div>
                  <strong>Products</strong>
                  <small>Workflo, Nexus, and ASTRA.</small>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href="/resources">
                <div>
                  <strong>Resources</strong>
                  <small>Case studies, insights, and field notes.</small>
                </div>
                <ArrowRight size={16} />
              </Link>
              <Link href="/demo">
                <div>
                  <strong>Book a demo</strong>
                  <small>Walk through one real decision.</small>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
