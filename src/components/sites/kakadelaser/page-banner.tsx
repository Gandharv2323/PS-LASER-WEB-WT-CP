import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export type PageBannerProps = {
  title: string;
  subtitle?: string;
  /** Background image path (public/). Defaults to the laser-head hero image. */
  image?: string;
  /** Trail after "Home". The last item is the current page (rendered without a link). */
  breadcrumb?: BreadcrumbItem[];
};

const DEFAULT_IMAGE = "/sites/pslaser/factory/website-hero-laser-head-ai.jpg";

/**
 * Classic inner-page hero: full-width image band, dark overlay, white heading,
 * orange accent rule and breadcrumb. Styles live in (classic)/kakadelaser.css (.ps-banner).
 */
export function PageBanner({ title, subtitle, image = DEFAULT_IMAGE, breadcrumb }: PageBannerProps) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...(breadcrumb ?? [{ label: title }])];

  return (
    <section className="ps-banner" aria-labelledby="ps-banner-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ps-banner-img" src={image} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="ps-banner-overlay" aria-hidden="true" />
      <div className="container ps-banner-inner">
        <nav aria-label="Breadcrumb">
          <ol className="ps-banner-crumbs">
            {trail.map((item, i) => {
              const last = i === trail.length - 1;
              return (
                <li key={`${item.label}-${i}`} aria-current={last ? "page" : undefined}>
                  {item.href && !last ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 id="ps-banner-title">{title}</h1>
        <span className="ps-banner-rule" aria-hidden="true" />
        {subtitle ? <p className="ps-banner-sub">{subtitle}</p> : null}
      </div>
    </section>
  );
}
