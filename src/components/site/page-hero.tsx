import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { routes } from "@/lib/site/nav";
import styles from "./page-hero.module.css";

export type Crumb = { label: string; href?: string };

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Background image (public path). Darkened automatically for legibility. */
  image: string;
  imageAlt?: string;
  /** CSS object-position for the image, e.g. "50% 30%". */
  imagePosition?: string;
  /** Trail after "Home". The last crumb is the current page (no href). */
  breadcrumb?: Crumb[];
  /** Buttons etc. shown under the intro. */
  actions?: ReactNode;
  /** Optional caption for honest labelling, e.g. "Manufacturer catalogue image". */
  imageCaption?: string;
  /** "md" (default, ~70vh max) or "lg" (taller). */
  size?: "md" | "lg";
};

/**
 * Dark inner-page hero. Every non-home page should start with this so the fixed
 * header can sit transparently on top of it.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
  imagePosition,
  breadcrumb,
  actions,
  imageCaption,
  size = "md",
}: PageHeroProps) {
  const crumbs: Crumb[] = breadcrumb ? [{ label: "Home", href: routes.home }, ...breadcrumb] : [];
  const imgStyle: CSSProperties | undefined = imagePosition ? { objectPosition: imagePosition } : undefined;

  return (
    <section className={`s-tone-ink ${styles.hero}`} data-size={size}>
      <div className={`s-enter-fade ${styles.media}`}>
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" style={imgStyle} />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={`s-container ${styles.inner}`}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={`s-enter ${styles.crumbs}`}>
            <ol>
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={`${c.label}-${i}`}>
                    {c.href && !last ? (
                      <Link href={c.href}>{c.label}</Link>
                    ) : (
                      <span aria-current={last ? "page" : undefined}>{c.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <div className={styles.copy}>
          {eyebrow && (
            <p className="s-eyebrow s-enter" style={{ "--enter-delay": "60ms" } as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h1 className={`s-h1 s-enter ${styles.title}`} style={{ "--enter-delay": "120ms" } as CSSProperties}>
            {title}
          </h1>
          {intro && (
            <div className={`s-lead s-enter ${styles.intro}`} style={{ "--enter-delay": "220ms" } as CSSProperties}>
              {intro}
            </div>
          )}
          {actions && (
            <div className="s-btn-row s-enter" style={{ "--enter-delay": "320ms" } as CSSProperties}>
              {actions}
            </div>
          )}
        </div>
      </div>
      {imageCaption && <p className={styles.caption}>{imageCaption}</p>}
    </section>
  );
}
