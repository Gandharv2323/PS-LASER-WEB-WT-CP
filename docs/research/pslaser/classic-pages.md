# PS Laser classic multi-page site: CONTRACT

Design = the classic Kakade-style look (Bootstrap 4 + boxicons + AOS + owl, `kakadelaser.css`, recoloured orange `#EF7D00`). Content = PS Laser only (facts: `docs/research/pslaser/brief.md`, data: `src/lib/pslaser/data.ts`). Never copy Kakade text/images. Never show "Unit of P S Enterprises" anywhere.

## Routes (route group `src/app/(classic)/`)

| Route | File | Owner |
|---|---|---|
| `/` | `src/app/(classic)/page.tsx` | agent A (layout/home) |
| `/about-us` | `src/app/(classic)/about-us/page.tsx` | agent A |
| `/contact-us` | `src/app/(classic)/contact-us/page.tsx` | agent A |
| `/engineering-services` | `src/app/(classic)/engineering-services/page.tsx` | agent B |
| `/architectural-services` | `src/app/(classic)/architectural-services/page.tsx` | agent B |
| `/gallery` | `src/app/(classic)/gallery/page.tsx` | agent B |
| `/pattern-design` | `src/app/(classic)/pattern-design/page.tsx` | agent B |
| `/blogs` | `src/app/(classic)/blogs/page.tsx` (+ sub-routes if wanted) | agent B |

Other routes: `/modern` (modern redesign, `(site)` group), `/advanced` (old dark page, `(legacy)` group).

Agent B owns `src/app/(classic)/{engineering-services,architectural-services,gallery,pattern-design,blogs}/**` and `src/components/sites/pslaser-pages/**` (put page-specific CSS there, e.g. a `pages.css` imported from your page files, or CSS modules). Agent A owns everything else in `(classic)`, the classic header/footer, `src/app/(classic)/kakadelaser.css`, and `page-banner.tsx`. Do not edit each other's files; ask via the orchestrator.

## What the `(classic)` layout supplies (do NOT render these in pages)

- Bootstrap 4 / boxicons / AOS / owl CSS, `kakadelaser.css`, Roboto font.
- `<SiteHeader/>` (fixed, ~100px tall on desktop; the banner already compensates), `<SiteFooter/>`, floating WhatsApp button, back-to-top, AOS init.
- Everything is wrapped in `<div className="ps-home">`, so all `.ps-home ...` scoped rules and CSS variables apply: `--ps-orange #EF7D00`, `--ps-orange-dark #D96F00`, `--ps-orange-tint #FFF4E8`, `--ps-charcoal #1D1D1B`.
- AOS is initialised globally (duration 800, easing `ease-out-cubic`, once: true, disabled on prefers-reduced-motion) and refreshed on route change. Just use `data-aos="fade-up"` etc. on elements.

## Page file shape

```tsx
import type { Metadata } from "next";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";

export const metadata: Metadata = {
  title: "Engineering Services",          // root template renders "%s | PS Laser"
  description: "One or two sentences, PS Laser facts only.",
};

export default function Page() {
  return (
    <>
      <PageBanner
        title="Engineering Services"
        subtitle="Laser cutting, CNC bending, punching, welding and powder coating under one roof."
        image="/sites/pslaser/gallery/laser-cutting-bg.jpg"   // optional
        breadcrumb={[{ label: "Engineering Services" }]}       // optional; "Home" is prepended automatically
      />
      <section id="..." className="services">...</section>
    </>
  );
}
```

Server components by default; add `"use client"` only in small child components. Use `next/link` for internal links. Use `whatsapp(message)` from `@/lib/pslaser/data` for quote CTAs (open in new tab, `rel="noopener noreferrer"`).

## `<PageBanner>` (src/components/sites/kakadelaser/page-banner.tsx)

Props: `title: string`, `subtitle?: string`, `image?: string` (defaults to the factory hero image), `breadcrumb?: { label: string; href?: string }[]`. Full-width image band with dark gradient overlay, white H1, orange accent rule, breadcrumb "Home / ...". Includes top padding for the fixed header. Rendered as `<section className="ps-banner">`.

## Anchor slugs used by the header

Engineering dropdown links to `/engineering-services#<service slug>` for every `services[].slug` in `data.ts` (`laser-cutting`, `cnc-bending`, `turret-punching`, `laser-welding`, `fabrication`, `powder-coating`, `design-cam`, `architectural`). Agent B: give each service block on `/engineering-services` an `id` equal to its slug (the `architectural` one may just link onward to `/architectural-services`). `.ps-home section[id]` already gets `scroll-margin-top: 100px`; for non-section elements add `className="ps-anchor"` (also gets scroll-margin).

Home links to `/#machines` (machines section stays on home).

## Styling conventions

- Reuse Kakade class patterns: `section.services` + `.section-title h3 > span`, `.box-img` cards, `.btn.btn-primary` (orange under `.ps-home`), `.ps-card`, `.ps-card-img`, `.ps-card-actions`, `.ps-icon`, `.ps-specs`, `.ps-category`.
- Mobile first; check 360/375/768/1440, no horizontal overflow. Images: plain `<img loading="lazy">` with the eslint-disable comment, as on the home page, or `next/image`.
- No invented years, client names, certifications or numbers. Only facts from `brief.md`/`data.ts`.
