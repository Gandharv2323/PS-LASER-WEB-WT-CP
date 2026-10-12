// Single source of truth for the new PS Laser site's routes and navigation.
// Every header/footer/page link must use these constants — never hard-code paths.

export const routes = {
  home: "/",
  about: "/about-us",
  engineering: "/engineering-services",
  architectural: "/architectural-services",
  gallery: "/gallery",
  patternDesign: "/pattern-design",
  blogs: "/blogs",
  contact: "/contact-us",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

export type NavItem = { href: RoutePath; label: string };

/** Primary navigation, in display order (header + footer). */
export const mainNav: NavItem[] = [
  { href: routes.home, label: "Home" },
  { href: routes.about, label: "About Us" },
  { href: routes.engineering, label: "Engineering" },
  { href: routes.architectural, label: "Architectural" },
  { href: routes.gallery, label: "Gallery" },
  { href: routes.patternDesign, label: "Pattern Design" },
  { href: routes.blogs, label: "Blog" },
  { href: routes.contact, label: "Contact Us" },
];

/**
 * Where each service (by `services[].slug` in src/lib/pslaser/data.ts) is described in depth.
 * Engineering services live on /engineering-services with a section whose id === slug.
 */
const SERVICE_PAGE: Record<string, RoutePath> = {
  "laser-cutting": routes.engineering,
  "cnc-bending": routes.engineering,
  "turret-punching": routes.engineering,
  "laser-welding": routes.engineering,
  fabrication: routes.engineering,
  "powder-coating": routes.engineering,
  "design-cam": routes.engineering,
  architectural: routes.architectural,
};

/** Deep link for a service slug, e.g. "/engineering-services#cnc-bending". */
export function serviceHref(slug: string): string {
  const page = SERVICE_PAGE[slug] ?? routes.engineering;
  return page === routes.architectural ? page : `${page}#${slug}`;
}

/** True when `pathname` is (or is inside) `href`. Home only matches exactly. */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
