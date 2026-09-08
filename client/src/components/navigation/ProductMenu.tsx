/* Cinematic system: compact product dropdown. Three systems, one layer. */
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export const PRODUCT_LINKS = [
  { name: "Workflo", category: "Execution Assurance", href: "/products/workflo" },
  { name: "Nexus", category: "Operations Intelligence", href: "/products/nexus" },
  { name: "ASTRA", category: "Mission Engineering", href: "/products/astra" },
] as const;

export default function ProductMenu() {
  return (
    <div className="cx-product-menu" role="menu" aria-label="Products">
      {PRODUCT_LINKS.map((product) => (
        <Link key={product.href} href={product.href} className="cx-product-item" role="menuitem">
          <strong>{product.name}</strong>
          <small>{product.category}</small>
          <ArrowRight size={15} />
        </Link>
      ))}
    </div>
  );
}
