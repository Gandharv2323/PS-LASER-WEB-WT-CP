# PS Laser site system

The shared foundation for the new multi-page PS Laser site. If you are building one of the
remaining pages, read this first, then look at `src/app/(site)/page.tsx` (Home) to see the
system in use.

## 1. Content rules (hard)

- Brand is **PS Laser**. Never write "Unit of P S Enterprises". `company.legalName` exists
  in `data.ts`, but nothing on the site uses it. The footer legal line is just `GSTIN …`.
- Use only facts from `src/lib/pslaser/data.ts` and `docs/research/pslaser/brief.md`:
  7 machines, 8 services, materials, process, whyUs, products, quality, industries and
  contacts. Do not invent years, clients, certifications, counts, reviews or tolerances.
  The ±0.1 mm figure only appears on the old website, so don't use it either.
- Every "Get Quote" or enquiry CTA goes to WhatsApp through `whatsapp(message)` with a
  machine- or service-specific message. Use `machine.quoteMessage` or `service.quoteMessage`
  when one exists. Links open with `target="_blank" rel="noopener noreferrer"`.
  `<WhatsAppButton>` does this for you.
- Label images honestly:
  - Machine photos are manufacturer images. `MachineCard` already captions them.
  - Product and gallery images are illustrative renders. Caption them "Representative work",
    never "Project for X".
  - The factory front photo (`company.factoryPhoto`) is the only real photo of the premises.
- Brands: HSG Laser, Amada, Genesis and Wagner are "equipment we run". They are not partners
  or clients. Show them as text wordmarks only (`<BrandStrip/>`).

## 2. Architecture

```
src/app/layout.tsx              root: <html lang="en"><body>, base metadata, title template "%s | PS Laser"
src/app/(site)/layout.tsx       fonts + site.css + SiteHeader + <main id="main"> + SiteFooter + FloatingWhatsApp + RevealObserver
src/app/(site)/site.css         design tokens + base + `s-` utilities (global, plain CSS — no Tailwind)
src/app/(site)/page.tsx         Home "/"  (+ home.module.css)
src/app/(site)/<route>/page.tsx ← new pages go here
src/app/(legacy)/layout.tsx     Bootstrap/boxicons/aos/owl + kakadelaser.css (old pages only)
src/app/(legacy)/classic        /classic  (old PS classic page)
src/app/(legacy)/advanced       /advanced (old PS advanced page)
src/components/site/*           shared components (+ co-located *.module.css)
src/lib/site/nav.ts             routes, mainNav, serviceHref(), isActive()
src/lib/pslaser/data.ts         all PS Laser facts + whatsapp() + map links
```

Routes come from `src/lib/site/nav.ts`. Never hard-code a path.

| key | path |
|---|---|
| `routes.home` | `/` |
| `routes.about` | `/about-us` |
| `routes.engineering` | `/engineering-services` |
| `routes.architectural` | `/architectural-services` |
| `routes.gallery` | `/gallery` |
| `routes.patternDesign` | `/pattern-design` |
| `routes.blogs` | `/blogs` |
| `routes.contact` | `/contact-us` |

- `serviceHref(slug)` returns `/engineering-services#<slug>` for the seven engineering
  services and `/architectural-services` for `architectural`. **The Engineering page must
  give each service section `id={service.slug}`** (`laser-cutting`, `cnc-bending`,
  `turret-punching`, `laser-welding`, `fabrication`, `powder-coating`, `design-cam`). The
  header dropdown, the footer and the Home service cards all link to these anchors.
- Machine cards render `id={machine.slug}`, so `/engineering-services#hsg-3kw-fiber-laser`
  works on any page that lists machines.

### Map and contact data (`data.ts`)

`company.mapUrl` / `mapShare` = `https://maps.app.goo.gl/X8i2e6Cf3ZbHLR8g7`, `mapDirections`,
`mapEmbed` (iframe src), `MAP_LAT`, `MAP_LNG`, `contacts[]` (4 people; `primary` = WhatsApp
number), `company.email`, `company.address`, `company.gstin`, `equipmentBrands[]`.

## 3. Design tokens (`site.css`, `:root`)

| Group | Tokens |
|---|---|
| Colour | `--c-ink #141414`, `--c-ink-2 #1d1d1b`, `--c-ink-3 #2a2a27`, `--c-paper #f6f4f0`, `--c-paper-2 #ece9e3`, `--c-white`, `--c-steel-100/300/500/600/700`, `--c-accent #ef7d00`, `--c-accent-hover #d96f00`, `--c-accent-ink #141414`, `--c-line`, `--c-line-strong`, `--c-line-inv`, `--c-line-inv-strong`, `--c-whatsapp` |
| Type | `--font-ui` (Manrope), `--font-display` (Barlow Condensed 500/600/700), `--fs-display`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-h4`, `--fs-lead`, `--fs-body`, `--fs-small`, `--fs-eyebrow`, `--lh-tight/heading/body`, `--tracking-eyebrow` |
| Space | `--container 1360px`, `--container-narrow 880px`, `--gutter clamp(16px,4vw,48px)`, `--space-1…9` (4,8,12,16,24,32,48,64,96), `--section-y`, `--section-y-tight`, `--header-h` (64 / 76 px ≥1024), `--radius 2px`, `--radius-lg 4px` |
| Motion | `--ease cubic-bezier(.2,.7,.2,1)`, `--ease-in-out`, `--dur-1 180ms` (hover), `--dur-2 320ms` (menus), `--dur-3 560ms` (reveal), `--dur-4 760ms` (hero) |
| Layers | `--z-float 40` (WhatsApp FAB), `--z-header 50`, `--z-overlay 80` (lightbox) |

Colour usage:

- Orange is the single accent. Use it for buttons, rules, numbers and small highlights.
- **Text on orange is ink, never white.** White on orange fails contrast.
- Don't use orange for body-size text on light backgrounds; `--c-accent-hover` is the
  minimum there. On dark backgrounds orange text is fine.
- `--font-ui` and `--font-display` are defined on `.s-root`, not on `:root`, because
  next/font defines its variables there. Anything outside `.s-root`, such as a portal to
  `body`, won't get the fonts. Portal into `.s-root` instead, as `Lightbox` does.

### Tones

Put `s-tone-paper | s-tone-paper-2 | s-tone-white | s-tone-ink | s-tone-ink-2` on a band, or
pass `tone` to `<Section>`. A tone sets `--tone-bg`, `--tone-fg`, `--tone-muted`,
`--tone-line` and `--tone-line-strong`. Components read these, so they adapt to light and
dark bands automatically.

Suggested rhythm: alternate light and dark bands, and never put two dark bands next to each
other above the footer (the footer is ink).

## 4. CSS conventions

- **No Tailwind on the new site.** `globals.css` (Tailwind/shadcn) isn't imported anywhere.
  Styling is:
  1. global `s-` utilities in `site.css`
  2. a CSS Module next to each component
  3. a page-level module, e.g. `src/app/(site)/about-us/about.module.css`
- Utilities: `s-container`, `s-container--narrow`, `s-section`, `s-section--tight`,
  `s-section--flush`, `s-tone-*`, `s-grid` (auto-fill by `--min`), `s-rule-grid` (hairline
  grid), `s-rule`, `s-eyebrow`, `s-display`, `s-h1`, `s-h2`, `s-h3`, `s-h4`, `s-lead`,
  `s-muted`, `s-small`, `s-accent`, `s-num`, `s-prose`, `s-visually-hidden`, `s-btn` (+
  `--secondary`, `--light`, `--dark`, `--link`, `--sm`, `--lg`, `--block`), `s-btn-row`
  (+ `--stack` = full-width buttons under 480px), `s-media` (aspect-ratio frame for
  `next/image fill`; set `--ratio`), `s-enter` / `s-enter-fade` (CSS entrance; stagger with
  `--enter-delay`).
- Base element styles have zero specificity (`:where(.s-root) :where(h2)`), so any class
  overrides them.
- When a module class has to override a global `s-` utility that sets the same property,
  raise specificity, e.g. `.copy .intro` rather than `.intro`. Module and global CSS load
  order isn't guaranteed.
- Keyframes used from a CSS Module must be defined in that same module, because
  `animation` names are localised.
- Images:
  - Always use `next/image` with `fill` inside an `s-media` frame (or with explicit
    width/height). This avoids layout shift.
  - Give `sizes` on every image.
  - Use `priority` only for hero images.
- Hover and transition timings use `--dur-*` and `--ease`. A global
  `prefers-reduced-motion: reduce` rule shortens every transition and animation inside
  `.s-root`.
- Mobile first. No page may scroll horizontally between 320 and 1920 px. `.s-root` has
  `overflow-x: clip` as a safety net; don't rely on it.
- Grids: choose column counts that divide the item count, so there are no ragged rows. See
  `serviceGrid` and `machineGrid` in `home.module.css`, where the first of 7 machines is
  `featured` and spans 2 columns, giving 8 slots.

## 5. Components (`src/components/site/`)

You can import from `@/components/site` (barrel) or from each file directly.

### Layout chrome (already in the site layout, don't re-add)

- `SiteHeader` (client)
  - Fixed. Transparent with light text at the top of the page, solid paper once the page
    scrolls or the menu opens.
  - Active link comes from `usePathname` (`aria-current="page"`).
  - Desktop nav appears at ≥1180px, with a hover/focus dropdown under Engineering listing
    the engineering services. Below that it shows a full-screen menu with a clip-path
    animation, a focus trap, Escape (returns focus to the toggle) and body scroll lock. The
    menu closes on route change.
  - **Every page must start with a dark hero** (`<PageHero>` or a custom dark band at
    least `--header-h` tall), otherwise the transparent header sits on light content.
- `SiteFooter`: logo, blurb, all 8 pages, all 8 services (`serviceHref`), 4 phone numbers
  (`tel:`), email (`mailto:`), address with "Get directions", WhatsApp, `GSTIN …`, and
  © 2026 PS Laser.
- `FloatingWhatsApp`: fixed bottom-right. Label shows at ≥768px.
- `RevealObserver` (client): one IntersectionObserver for every `[data-reveal]` element.
  Re-scans on route change.

### `PageHero`: inner-page hero (server)

```tsx
<PageHero
  eyebrow="Engineering services"
  title="Cut, formed, joined and finished in one shop."
  intro="Short intro sentence."
  image="/sites/pslaser/gallery/laser-cutting-bg.jpg"
  imageAlt=""                       // decorative → ""
  imagePosition="50% 40%"           // optional object-position
  breadcrumb={[{ label: "Engineering services" }]}   // "Home" is prepended automatically
  actions={<WhatsAppButton message={services[0].quoteMessage} />}
  imageCaption="Representative image" // optional honest label (bottom-right)
  size="md"                          // "md" | "lg"
/>
```

### `Section` and `SectionHeading` (server)

```tsx
<Section id="machines" tone="paper-2" spacing="default|tight|none" narrow bleed ruled>
  <SectionHeading
    eyebrow="Machinery"
    title="The equipment behind every part."
    intro="Optional lead paragraph."
    layout="stack|split|center"     // split = title left, intro/action right (≥960px)
    as="h2"                          // h1 | h2 | h3
    action={<Button href={routes.gallery} variant="secondary" arrow>View gallery</Button>}
  />
  …
</Section>
```

`Tone` = `"paper" | "paper-2" | "white" | "ink" | "ink-2"`.

### `Button`, `WhatsAppButton`, `buttonClass`

```tsx
<Button href={routes.contact} variant="primary|secondary|light|dark|link" size="sm|md|lg" arrow icon={<Phone />}>
  Contact us
</Button>
```

- Internal paths render `next/link`.
- `http(s)` links open in a new tab with `noopener noreferrer`.
- `tel:` and `mailto:` links open normally.

```tsx
<WhatsAppButton message={machine.quoteMessage} variant="secondary" size="sm">Get quote</WhatsAppButton>
```

- `message` defaults to `GENERAL_QUOTE_MESSAGE`.
- Label defaults to "Get a quote on WhatsApp".

Use `buttonClass("secondary", "sm")` to style any other `<a>`/`<button>`.

Variant by background:

| Background | Variants |
|---|---|
| light | `primary`, `secondary`, `dark`, `link` |
| dark | `primary`, `light`, `link` |
| orange (CTABand) | `dark`, `secondary` |

### `Reveal` / `data-reveal` (scroll reveal)

```tsx
<Reveal variant="up|fade|scale|left" delay={i * 80} as="li">…</Reveal>
// or, on any element (server or client):
<li data-reveal="fade" style={revealDelay(i * 80)}>…</li>   // data-reveal="" = "up"
```

- Content is hidden only when JS can run and motion is allowed (`@media (scripting:
  enabled) and (prefers-reduced-motion: no-preference)`).
- Never put `data-reveal` on hero or above-the-fold content. Use `s-enter` for that.

### `MachineCard` (server)

```tsx
<MachineCard machine={machines[0]} index={0} featured headingAs="h3" revealDelay={0} />
```

- Shows image (3:2), category, name and specs, plus a "Manufacturer image" note
  ("Representative image" for the powder coating plant).
- Includes a per-machine WhatsApp "Get quote" button.
- Renders `id={machine.slug}`.
- `featured` gives a horizontal layout from 600px up. Use it on a card that spans 2
  columns.

### `ServiceCard` (server)

```tsx
<ServiceCard service={services[i]} index={i} href={null /* hide link */} quote headingAs="h3" />
```

- Image (16:10), title, text, "Learn more" (defaults to `serviceHref(slug)`) and a
  WhatsApp "Quote" button using `service.quoteMessage`.
- On the Engineering page itself, pass `href={null}` or an in-page anchor.

### `BrandStrip` (server)

```tsx
<BrandStrip tone="ink-2" eyebrow="Equipment we run" title="Powered by precision. Built for performance." notes id="equipment" />
```

Text wordmarks for HSG Laser, Amada, Genesis and Wagner, each with a "what we run" note.

### `CTABand` (server)

```tsx
<CTABand
  eyebrow="Start a job"
  title="Have a drawing? Get a price on WhatsApp."
  text="…"
  message={GENERAL_QUOTE_MESSAGE}
  primaryLabel="Get a quote on WhatsApp"
  secondary={{ href: `tel:${contacts[0].tel}`, label: `Call ${contacts[0].phone}` }}
  tone="accent|ink"
/>
```

Full-bleed band. Don't wrap it in `<Section>`.

### `MapEmbed` (server)

```tsx
<MapEmbed ratio="4 / 3" showActions />
```

- Lazy Google Maps iframe for the PS Laser place.
- Includes the address plus "Get directions" and "Open in Google Maps" buttons.

### `ContactDetails` (server)

```tsx
<ContactDetails full />
```

- 4 people as `tel:` cards (the primary one is tagged WhatsApp).
- With `full`, also shows email (`mailto:`) and address with a directions link.
- Adapts to tone.

### `MaterialCapacity` (server)

```tsx
<MaterialCapacity note="…optional caption…" />
```

Bars for MS 16, SS 12, Al 8, Brass 4 and Cu 4 mm, scaled to 16 mm. Bars grow when
revealed. Works on light and dark.

### `ProcessSteps` (server)

```tsx
<ProcessSteps steps={process} />
```

Numbered steps: 6 / 3 / 1 columns. Defaults to the 6-step flow in `data.ts`. Step titles
are `h3`.

### `GalleryGrid` and `Lightbox` (client)

```tsx
const items: GalleryItem[] = products.map((p) => ({
  src: p.image, alt: `${p.title} (representative image)`, title: p.title,
  tag: "Laser cutting", caption: "Representative work",
}));
<GalleryGrid items={items} minColumn={260} ratio="1 / 1" feature />
```

- Tiles open the Lightbox: Escape closes, ←/→ navigate, focus is trapped and returned to
  the opener, scroll is locked, and it portals into `.s-root`.
- Use `<Lightbox items index onClose onIndexChange />` directly for custom layouts, such as
  gallery filters on `/gallery`. Keep the `index` state yourself.

### `HeroVideo` (client)

```tsx
<HeroVideo src={company.heroVideo} poster="/sites/pslaser/factory/website-hero-laser-head-ai.jpg" />
```

- Absolute full-bleed. A priority poster image sits under a muted, looping, inline video.
- With reduced motion the video is never mounted.
- Has a pause/play control.

### Other components

- `Logo` (`tone="dark|light"`, `adaptive`): the shield mark cropped from the official logo
  (`/sites/pslaser/logo/ps-laser-mark.png` and `-light.png`) plus "PS LASER" set in the
  display font.
- `WhatsAppIcon`: SVG glyph.
- `useScrollLock(active)`
- `useMediaQuery(q)` and `usePrefersReducedMotion()`

## 6. Adding a page

1. Create `src/app/(site)/<route>/page.tsx`, using the exact folder name from `nav.ts`:
   `about-us`, `engineering-services`, `architectural-services`, `gallery`,
   `pattern-design`, `blogs`, `contact-us`.
2. Export metadata:
   ```ts
   export const metadata: Metadata = {
     title: "About Us",                       // root template → "About Us | PS Laser"
     description: "…one or two factual sentences…",
     openGraph: { title: "About PS Laser", description: "…" },
   };
   ```
   - There is no `metadataBase` (the domain isn't decided yet), so leave out `openGraph.url`
     and `openGraph.images` for now.
3. Start with `<PageHero … breadcrumb={[{ label: "About us" }]} />`, then alternate
   `<Section tone=…>` bands.
4. End with a `<CTABand>` whose message fits the page (for example a jaali/grill message
   on Architectural).
5. Put page-only styles in a co-located `*.module.css`. Use tokens; don't use raw hex
   values except in rgba() overlays.
6. Check the page at 320, 375, 768, 1440 and 1920. Confirm:
   - no horizontal overflow
   - no console errors
   - `npm run typecheck` and `npm run lint` pass

## 7. Assets

`public/sites/pslaser/**` (see brief §9). Notable files:

| Path | Notes |
|---|---|
| `factory/ps-laser-factory-front-velu.jpg` | Real photo, 941×517 |
| `factory/website-hero-laser-head-ai.jpg` | Hero poster |
| `video/hero-laser-cutting.mp4` | Hero video |
| `gallery/*-bg.jpg` | 1024² renders |
| `products/*.jpg` | 1024² renders |
| `machines/*.jpg` | Manufacturer images |
| `quality/*.jpg` | Very small; show at ≤64px |
| `services/*.jpg` | Mostly ~250px wide; avoid large display, except `cnc-turret-punching-parts.jpg` |

In `data.ts`, the powder-coating plant image now points to `gallery/powder-coating-bg.jpg`
(the old file was 250px wide).
