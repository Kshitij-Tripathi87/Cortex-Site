/* Cinematic system: product chapter. Index, giant name, statement, working
 * copy, movement chips, framed visual, one exit. Alternates sides. */
import { Fragment } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export type ProductPanelProps = {
  index: string;
  name: string;
  cat: string;
  state: string;
  copy: string;
  flow: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  caption: string;
  href: string;
  flip?: boolean;
};

export default function ProductPanel({
  index,
  name,
  cat,
  state,
  copy,
  flow,
  tags,
  image,
  imageAlt,
  caption,
  href,
  flip = false,
}: ProductPanelProps) {
  return (
    <article className={`cx-product-panel${flip ? " is-flip" : ""}`}>
      <div>
        <p className="cx-product-index">
          <b>{index}</b> / {cat}
        </p>
        <h3 className="cx-product-name">{name}</h3>
        <p className="cx-product-cat">{cat}</p>
        <p className="cx-product-state">{state}</p>
        <p className="cx-product-copy">{copy}</p>
        <ul className="cx-mini-flow" aria-label={`${name} movement`}>
          {flow.map((stage, i) => (
            <Fragment key={stage}>
              {i > 0 && (
                <li className="cx-flow-arrow" aria-hidden="true">
                  →
                </li>
              )}
              <li>{stage}</li>
            </Fragment>
          ))}
        </ul>
        <div className="cx-solution-tags" style={{ marginBottom: "2rem" }}>
          {tags.map((tag) => (
            <span key={tag} className="cx-tag">
              {tag}
            </span>
          ))}
        </div>
        <Link href={href} className="cx-text-link">
          Explore {name} <ArrowRight size={15} />
        </Link>
      </div>
      <figure className="cx-frame" style={{ margin: 0 }}>
        <img src={image} alt={imageAlt} loading="lazy" />
        <figcaption>{caption}</figcaption>
      </figure>
    </article>
  );
}
