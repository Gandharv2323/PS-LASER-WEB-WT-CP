# PS Laser (Unit of P S Enterprises) — Rebrand Brief

Sources:
- **[PDF]** = `C:\Users\shind\Downloads\ps laser 2025.pdf` (8-page company profile, 2025). Most text is baked into images, so it was read from page renders and OCR'd by eye. The storefront signboard photo on page 1 was also read.
- **[WEB]** = https://ps-laser-unit-of-ps-enterprises.vercel.app/ (Vite/React SPA, bundle `/assets/index-B7C5NH7S.js`)
- **[SIGN]** = signboard in the factory photo (PDF p.1)

Media root: `/sites/pslaser/` (= `public/sites/pslaser/`). Machine data for code: `docs/research/pslaser/machines.json`.

---

## 1. Company identity

| Field | Value | Source |
|---|---|---|
| Brand | **PS Laser** (logo wordmark "PS LASER", "PS" in orange) | PDF, WEB |
| Legal / parent | **P S Enterprises** ("PS Laser – Unit of P S Enterprises") | WEB title/meta, SIGN ("P S ENTERPRISES / P S LASER") |
| GSTIN | **27ABHFP5667Q1Z8** (Maharashtra; the "F" in PAN = firm/partnership) | WEB only |
| Tagline (web hero) | "Precision Engineering" / "ADVANCED LASER & SHEET METAL MANUFACTURING" | WEB |
| Secondary line | "We Manufacture Precision Metal Components — USING ADVANCED LASER TECHNOLOGY" | WEB |
| About one-liner | "Manufacturer Of Precision Engineering & Sheet Metal Components with Laser Cutting." | PDF p.6 |
| Meta title | "PS Laser \| Precision Engineering & Sheet Metal Manufacturing" | WEB |
| Meta description | "PS Laser (Unit of P S Enterprises) - Leading manufacturer of precision engineering and sheet metal components. CNC Laser Cutting, Bending, Powder Coating services in Pune, India." | WEB |
| Signboard services line | "All types of CNC laser cutting, CNC turret punching, CNC bending, architectural, fabrication, powder coating and industrial job work. All type of cabinet grills and accessories." | SIGN |
| Brand colours | Orange (~#EF7D00, as in PDF/logo) + near-black charcoal (#1d1d1b-ish); PDF inner pages use navy blue (#0B5285-ish) panels | PDF/logo |
| Fonts on WEB | Inter, Montserrat (Google Fonts) | WEB |

## 2. Contact

| Field | Value | Source |
|---|---|---|
| Address | **Gat No. 753, At Post – Velu, Tal. Bhor, Dist. Pune – 412205, Maharashtra, India** | SIGN + PDF p.8 ("Post -Velu, Dist-Pune. -412205") |
| Address (web wording) | "Gat No. 753, Velu Bag, Tal-Bhor, Pune – 412205, Maharashtra, India" | WEB |
| Business location label | "Velu (Khed Shivapur)" | PDF p.6 |
| Email | **pslaser24@gmail.com** | PDF p.1, SIGN, WEB |
| Phone 1 (primary, WhatsApp) | **+91 77199 76990** — Swapnil Tanpure | WEB (number also on SIGN) |
| Phone 2 | **+91 97636 79499** — Pranil Talap | WEB, SIGN, PDF p.8 |
| Phone 3 | **+91 97643 64704** — Umesh Tanpure | WEB, SIGN |
| Phone 4 | **+91 96231 61813** — Sonu Agrawal | WEB, PDF p.8 (partially obscured on SIGN) |
| WhatsApp CTA | `https://wa.me/917719976990?text=Hi, I would like to get a quotation for CNC laser cutting, bending, powder coating, or fabrication work.` | WEB |
| Map link | Not present in either source. Suggested (constructed, not from source): `https://www.google.com/maps/search/?api=1&query=PS+Laser+Gat+No+753+Velu+Bhor+Pune+412205` | — |
| Social links | **None** found (no Facebook/Instagram/LinkedIn/YouTube in PDF or web bundle) | — |

Note: PDF p.8 (back cover) is cropped by its page box, so only the tails of the phone numbers are visible ("…90 / 9763679499", "…04 / 9623161813"). These match 7719976990 / 9763679499 and 9764364704 / 9623161813.

## 3. About / mission / values (PDF p.6)

- **About Us:** Manufacturer Of Precision Engineering & Sheet Metal Components with Laser Cutting.
- **About (web):** "PS Laser is a precision engineering manufacturer serving industrial and OEM clients with reliable, controlled, and scalable processes."
- **Mission:** Our mission at PS Laser is to provide high-quality laser cutting services to customers worldwide and meet their diverse needs. (The PDF has the typo "thir".)
- **Vision:** To remain at the forefront of laser cutting technology and provide innovative and efficient solutions to our customers. (The PDF starts this one with "Our mission at PS Laser is to…" too.)
- **Core values (box):** Encouraging individual ability & creativity · Hard work, continuous self-improvement, innovation & productivity · Opportunities based on merit & nothing is free · Well-being of employees, stakeholders, community & country.
- **Core values (list):** Establishing long-term relationships with customers · Providing high quality services using latest technology and equipment · Encouraging creative and innovative solutions · Prioritizing customer needs and exceeding their expectations · Upholding professionalism and reliability.
- **Values:** Customer Satisfaction · Integrity · Innovation · Quality · Efficiency.
- **Purpose:** Offering new technology services & solutions in a cost-effective manner.

## 4. Stats / years / certifications

- **Years in business / founding year:** none stated. The email handle "pslaser24" and the "2025" profile suggest a recent (~2024) start. That is only an inference, so do not publish a year.
- **Web stats strip:** ±0.1 mm Tolerance · 175 Ton Press Capacity · 1000+ Hrs Salt Spray Test.
- **Certifications:** none (no ISO etc.). The only registration is GST.
- **"Why us" claims [PDF]:** Working experience with India's topmost brands · Branded & precision machines · Advanced CAD-CAM software · Skilled designers & machine operators · Assistance from designing to installation of the project · Qualified & experienced operators · In-house tool designing & manufacturing facility · Cost effective · Close-tolerance parts · Dedicated welding stations for MS, SS & Al · Welding clamps and fixtures · Well-certified welders · PLC-based powder coating plant · 9-tank PT process · SS booth for quick colour changeover · Parts sustain 900–1000 hours SST.
- **Clients / testimonials:** **none** in either source.

## 5. Machines PS Laser actually owns (COMPLETE — from PDF pp.2–4)

| # | Machine | Category | Key specs | Image |
|---|---|---|---|---|
| 1 | **HSG 3 kW Fiber Laser**, 3 m x 1.5 m | Laser Cutting | 3 kW fiber, 3000 x 1500 bed, enclosed with exchange table | `/sites/pslaser/machines/hsg-3kw-fiber-laser-3x1.5m.jpg` |
| 2 | **Genesis 1.5 kW Fiber Laser**, 3 m x 1.5 m | Laser Cutting | 1.5 kW fiber, 3000 x 1500 bed, open gantry | `/sites/pslaser/machines/genesis-1.5kw-fiber-laser-3x1.5m.jpg` (wider crop: `…-wide.jpg`) |
| 3 | **CNC Press Brake 175 T x 3 m** ("3m Laser Technologies Smart Bend") | Bending | 175 Ton, 3 m length, 1–12 mm thickness | `/sites/pslaser/machines/smart-bend-175t-cnc-press-brake-3m.jpg` |
| 4 | **Amada VELA II CNC Turret Punch, 32 Ton** | CNC Turret Punching | up to 5 mm, 40 stations, 8x4 ft table | `/sites/pslaser/machines/amada-vela-ii-32t-cnc-turret-punch.jpg` |
| 5 | **Amada PEGA CNC Turret Punch, 16 Ton** | CNC Turret Punching | up to 3 mm, 26 stations, 4x4 ft table | `/sites/pslaser/machines/amada-pega-16t-cnc-turret-punch.jpg` |
| 6 | **HSG 1.5 kW Handheld Laser Welder** | Laser Welding | MS, SS & Al; fillet, vertical, tailor, flat welds | `/sites/pslaser/machines/hsg-1.5kw-handheld-laser-welder.jpg` |
| 7 | **PLC Powder Coating Plant** (facility) | Powder Coating | 9-tank PT → oven drying 120 °C → SS booth with Wagner gun → oven curing; 900–1000 h SST | `/sites/pslaser/services/powder-coating.jpg` (stock photo, small) |

Other facilities (not individual machines): manual welding stations for MS/SS/Al, plus soft welding, buffing, cleaning and grinding [PDF p.5]. Quality room: vernier caliper, 2 digital height gauges, digital micrometer, measuring tape, degree protractor [PDF p.7].

**Laser cutting material capacity [PDF p.4]:** Mild Steel **16 mm** · Stainless Steel **12 mm** · Aluminium **8 mm** · Brass **4 mm** · Copper **4 mm**. These are the shop maxima, most likely on the 3 kW machine.

Notes on machine images:
- The Amada VELA II and PEGA model names come from the badges visible in the photos. The PDF text only says "32 Ton" and "16 Ton".
- The HSG laser, press brake and HSG welder images are manufacturer catalogue renders, not photos of PS Laser's own units. The Genesis photo was taken in a machine-maker's shop (Chinese signage), so it is also not PS Laser's floor. The only real photo of PS Laser's own premises is the factory front (`factory/ps-laser-factory-front-velu.jpg`).
- **There is NO waterjet, plasma, CNC machining/VMC, tube laser, shearing machine, or robotic welding** in either source. Do not list those services.

## 6. Services (derived only from machines/PDF)

1. **CNC Laser Cutting** — 2 fiber lasers (3 kW HSG + 1.5 kW Genesis), 3 x 1.5 m beds; MS 16 / SS 12 / Al 8 / Brass 4 / Cu 4 mm.
2. **CNC Bending** — 175 T x 3 m press brake, 1–12 mm.
3. **CNC Turret Punching** — Amada 32 T (40 st, 8x4, ≤5 mm) + Amada 16 T (26 st, 4x4, ≤3 mm).
4. **Laser Welding** — HSG 1.5 kW; MS, SS & Al.
5. **Sheet Metal Fabrication & Welding** — MS/SS/Al welding stations, fixtures, soft welding, grinding, buffing, cleaning.
6. **Powder Coating** — PLC plant, 9-tank pre-treatment, SS booth, oven curing.
7. **Design / Engineering support ("System Approach") [PDF p.7]** — 3D modelling, drafting, CAM modelling, rendering, nesting + laser cutting programming. Software named: Production Designer (sheet metal parts development, bending simulation, blank development), Sheet Works (sheet metal parts, 3D modelling), Blank CAM (nesting, laser cutting programming).
8. **Architectural work, cabinet grills & accessories, industrial job work** [SIGN].

Web "Manufacturing Flow" (6 steps) [WEB]: 01 Design & Planning (CAD/CAM programming and material planning) → 02 Laser Cutting (precision CNC laser cutting with fiber technology) → 03 Forming & Bending (CNC press brake operations for precise angles) → 04 Welding & Assembly (laser, MIG, TIG welding and fabrication) → 05 Surface Treatment (5-tank pretreatment and powder coating; the PDF says 9-tank) → 06 Quality & Dispatch (inspection, packaging and delivery).

## 7. Industries

Neither source gives an explicit industry list. The only evidence is the web "industrial and OEM clients", the sign's "architectural … industrial job work, cabinet grills and accessories", and the web portfolio categories (enclosures, control panel housings, brackets, machine guards, fixtures). Safe wording: Industrial OEMs, Electrical panels & enclosures, Machine building, Architectural / interior metalwork, Furniture & cabinet hardware. Treat this as derived, not sourced.

## 8. Conflicts between PDF and WEB

| Topic | PDF | WEB | Recommendation |
|---|---|---|---|
| MS cutting max | 16 mm | 16 mm in section; **og:description says "up to 20mm MS"** | Use **16 mm** |
| SS cutting max | **12 mm** | 10 mm | Use 12 mm (PDF), or 10 mm to be conservative |
| Aluminium | 8 mm | 8 mm | 8 mm |
| Brass / Copper | 4 mm / 4 mm | not listed | 4 mm |
| 1.5 kW laser make | **GENESIS** | "HSG FIBER LASER \| 3 KW & 1.5 KW" | 3 kW = HSG, 1.5 kW = Genesis |
| Pre-treatment tanks | **9-tank** | 5-tank | Use 9-tank (PDF) |
| Salt spray | **900–1000 h** | "500–1000 Hrs" / "1000+ Hrs" | Use 900–1000 h |
| Welding processes | MS/SS/Al welding, laser welding, soft welding | "Laser \| MIG \| TIG \| Spot welding" | Spot welding is not supported by the PDF. MIG/TIG are plausible but unconfirmed. |
| Bending accuracy | not stated | ±0.1 mm | Web-only claim |
| Extra bending capacities | PDF p.4 also lists "100 T x 3000 mm", "320 T x 3000 mm", "210 T x 4000 mm", "225 T x 3000 mm" bullets | — | **Not their machines.** Only one 175 T x 3 m press brake is pictured and named, and those bullets look like template text left from another brochure. Do not list them. |
| Address wording | "At Post – Velu, Tal. Bhor" | "Velu Bag, Tal-Bhor" | Use the sign wording |

## 9. Media inventory (`public/sites/pslaser/`)

**logo/** (4)
- `ps-laser-logo.png` — 785x707, transparent background, made from the PDF's 1024 px logo (shield "PS" monogram + "PS LASER" wordmark). **Preferred.**
- `ps-laser-logo-white-bg.jpg` — same logo on white, 800 px.
- `ps-laser-logo-website.png` — 458x425 from WEB, white background.
- `favicon.png` — WEB favicon (same as the website logo).
- No SVG logo exists in either source.

**machines/** (7) — see the table in §5.

**factory/** (2)
- `ps-laser-factory-front-velu.jpg` — **real** photo of the PS Laser shed and signboard at Velu (941x517).
- `website-hero-laser-head-ai.jpg` — WEB "What we do" background (laser head with sparks; AI-generated look).

**services/** (6) — small stock photos from PDF pp.4–5: `laser-cutting.jpg`, `cnc-bending.jpg`, `powder-coating.jpg`, `sheet-metal-fabrication-welding.jpg`, `laser-welding.jpg` (all about 250 px wide, low-res), `cnc-turret-punching-parts.jpg` (1179 px, good).

**gallery/** (4) — WEB section backgrounds (1024², AI-generated look): `laser-cutting-bg.jpg`, `cnc-bending-bg.jpg`, `powder-coating-bg.jpg`, `fabrication-welding-bg.jpg`.

**products/** (8) — WEB portfolio (1024², AI-generated look) with the titles the site used:
- `industrial-enclosures-laser-cut-parts.jpg` — "Industrial Enclosures" (Laser Cutting)
- `control-panel-housings-sheet-metal.jpg` — "Control Panel Housings" (Sheet Metal)
- `precision-brackets-enclosures.jpg` — "Precision Brackets" (CNC Bending)
- `machine-guards-perforated-panels.jpg` — "Machine Guards" (Fabrication)
- `custom-fixtures-welded.jpg` — "Custom Fixtures" (Welding)
- `powder-coated-decorative-panel.jpg` — "Powder Coated Parts" (Powder Coating)
- `laser-cut-jali-pattern.jpg` — "Precision Laser Cut Patterns" (Laser Cutting)
- `heavy-structural-fabrication.jpg` — "Heavy Structural Fabrication" (Fabrication)

**quality/** (6) — PDF p.7 instrument photos (small): vernier-caliper, digital-height-gauge-1, digital-height-gauge-2, digital-micrometer, measuring-tape, degree-protractor.

**video/** (1) — `hero-laser-cutting.mp4` (2.9 MB, the WEB hero background loop, originally `/Luxury_Video_Generation_Request.mp4`, AI-generated).

**icons/** (1) — `whatsapp.gif` (animated WhatsApp icon used on the WEB CTA).

Skipped: `/welcome.gif`, a generic "Welcome" handwriting loader animation with no branding.

## 10. Gaps

- No real photos of finished parts or of the shop floor. All product/gallery images are the old site's AI-style renders, and the machine images are catalogue/stock renders.
- No social links, no map embed, no founding year, no team or headcount, no certifications, no client list or testimonials.
- No vector (SVG) logo.
