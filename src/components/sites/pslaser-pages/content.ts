// Page content for the classic inner pages (engineering, architectural, gallery, pattern design, blogs).
// Facts come only from src/lib/pslaser/data.ts and docs/research/pslaser/brief.md.

import { machines, services, type Machine } from "@/lib/pslaser/data";

const M = "/sites/pslaser";

/* ------------------------------------------------------------------ */
/* Engineering services                                                */
/* ------------------------------------------------------------------ */

export type EngineeringService = {
  slug: string;
  title: string;
  eyebrow: string;
  image: string;
  imageAlt: string;
  /** Caption shown under the image (honest labelling). */
  imageNote: string;
  intro: string[];
  machines: Machine[];
  /** Facilities / software when there is no single machine. */
  facilities?: { title: string; points: string[] };
  capacity?: { label: string; value: string }[];
  applications: string[];
  quoteMessage: string;
  quoteLabel: string;
};

const svc = (slug: string) => {
  const s = services.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service ${slug}`);
  return s;
};
const mc = (slug: string) => {
  const m = machines.find((x) => x.slug === slug);
  if (!m) throw new Error(`Unknown machine ${slug}`);
  return m;
};

export const engineeringServices: EngineeringService[] = [
  {
    slug: "laser-cutting",
    title: "CNC Fiber Laser Cutting",
    eyebrow: "Cutting",
    image: `${M}/gallery/laser-cutting-bg.jpg`,
    imageAlt: "Fiber laser cutting a steel sheet",
    imageNote: "Representative image",
    intro: [
      "Our cutting cell runs two fiber lasers, each with a 3 m x 1.5 m bed. The 3 kW HSG machine takes the thicker plate and production batches; the 1.5 kW Genesis handles thin sheet and fine, detailed profiles.",
      "Send us a DXF and we nest it, program it and cut it. The result is a clean edge and accurate holes and slots, ready for bending, welding or coating in the same shop.",
    ],
    machines: [mc("hsg-3kw-fiber-laser"), mc("genesis-1-5kw-fiber-laser")],
    capacity: [
      { label: "Mild Steel", value: "up to 16 mm" },
      { label: "Stainless Steel", value: "up to 12 mm" },
      { label: "Aluminium", value: "up to 8 mm" },
      { label: "Brass", value: "up to 4 mm" },
      { label: "Copper", value: "up to 4 mm" },
      { label: "Sheet size", value: "3 m x 1.5 m bed" },
    ],
    applications: [
      "Enclosure and panel blanks",
      "Brackets, gussets and base plates",
      "Machine guards and covers",
      "Laser-cut jaali and decorative panels",
      "Flat parts for fabrication and assembly",
    ],
    quoteMessage: svc("laser-cutting").quoteMessage,
    quoteLabel: "Get a laser cutting quote",
  },
  {
    slug: "cnc-bending",
    title: "CNC Bending",
    eyebrow: "Forming",
    image: `${M}/gallery/cnc-bending-bg.jpg`,
    imageAlt: "CNC press brake bending a sheet metal part",
    imageNote: "Representative image",
    intro: [
      "A 175 Ton CNC press brake with a 3 m working length forms the parts cut on our lasers. It handles sheet from 1 mm up to 12 mm.",
      "Bend sequences are programmed and checked before the first part. Because blank development happens in-house, the flat pattern and the finished bend are designed together, so parts come out at the right size.",
    ],
    machines: [mc("smart-bend-175t-press-brake")],
    capacity: [
      { label: "Press force", value: "175 Ton" },
      { label: "Bending length", value: "up to 3 m" },
      { label: "Sheet thickness", value: "1 – 12 mm" },
    ],
    applications: [
      "Enclosures, boxes and control panel bodies",
      "Channels, angles and U-sections",
      "Brackets and mounting plates",
      "Covers, trays and doors",
    ],
    quoteMessage: svc("cnc-bending").quoteMessage,
    quoteLabel: "Get a bending quote",
  },
  {
    slug: "turret-punching",
    title: "CNC Turret Punching",
    eyebrow: "Punching",
    image: `${M}/services/cnc-turret-punching-parts.jpg`,
    imageAlt: "Sheet metal parts with punched holes and cut-outs",
    imageNote: "Representative image",
    intro: [
      "Two Amada CNC turret punches cover repetitive holes, slots, knock-outs and perforations. On parts with many identical features, punching is often faster and cheaper than laser cutting.",
      "The 32 Ton VELA II runs 40 tool stations on an 8 x 4 ft table. The 16 Ton PEGA covers lighter sheet on a 4 x 4 ft table.",
    ],
    machines: [mc("amada-vela-ii-32t-turret-punch"), mc("amada-pega-16t-turret-punch")],
    capacity: [
      { label: "Amada 32 T", value: "up to 5 mm · 40 stations · 8 x 4 ft" },
      { label: "Amada 16 T", value: "up to 3 mm · 26 stations · 4 x 4 ft" },
    ],
    applications: [
      "Perforated sheets and ventilation patterns",
      "Electrical panel and enclosure cut-outs",
      "Cabinet grills",
      "High-volume flat parts with repeated holes",
    ],
    quoteMessage: svc("turret-punching").quoteMessage,
    quoteLabel: "Get a punching quote",
  },
  {
    slug: "laser-welding",
    title: "Laser Welding",
    eyebrow: "Joining",
    image: `${M}/machines/hsg-1.5kw-handheld-laser-welder.jpg`,
    imageAlt: "HSG 1.5 kW handheld laser welding machine",
    imageNote: "Manufacturer image of the model we run",
    intro: [
      "Our HSG 1.5 kW handheld laser welder puts in a narrow, concentrated heat zone. You get neat seams with less distortion and less grinding afterwards than conventional welding usually leaves.",
      "We weld mild steel, stainless steel and aluminium, including fillet, vertical, tailor and flat joints. It suits visible joints on enclosures and on stainless steel work.",
    ],
    machines: [mc("hsg-1-5kw-laser-welder")],
    capacity: [
      { label: "Materials", value: "MS, SS & Aluminium" },
      { label: "Weld types", value: "Fillet, vertical, tailor, flat" },
    ],
    applications: [
      "Enclosure corners and seams",
      "Stainless steel cabinets and trays",
      "Thin-sheet assemblies where distortion matters",
      "Visible joints that need a clean finish",
    ],
    quoteMessage: svc("laser-welding").quoteMessage,
    quoteLabel: "Get a laser welding quote",
  },
  {
    slug: "fabrication",
    title: "Sheet Metal Fabrication & Welding",
    eyebrow: "Assembly",
    image: `${M}/gallery/fabrication-welding-bg.jpg`,
    imageAlt: "Welder fabricating a sheet metal assembly",
    imageNote: "Representative image",
    intro: [
      "Cut and bent parts are joined into finished assemblies at dedicated welding stations for mild steel, stainless steel and aluminium. Welding clamps and fixtures keep repeat parts consistent.",
      "Soft welding, grinding, buffing and cleaning are done in-house, so assemblies arrive ready for powder coating or ready to install.",
    ],
    machines: [],
    facilities: {
      title: "Fabrication facilities",
      points: [
        "Dedicated welding stations for MS, SS & Aluminium",
        "Welding clamps and fixtures for repeat jobs",
        "Soft welding",
        "Grinding, buffing and cleaning",
        "In-house tool designing & manufacturing",
      ],
    },
    applications: [
      "Frames, stands and structures",
      "Control panel and enclosure assemblies",
      "Welded fixtures and jigs",
      "Machine guards and covers",
    ],
    quoteMessage: svc("fabrication").quoteMessage,
    quoteLabel: "Get a fabrication quote",
  },
  {
    slug: "powder-coating",
    title: "Powder Coating",
    eyebrow: "Finishing",
    image: `${M}/gallery/powder-coating-bg.jpg`,
    imageAlt: "Powder coating booth spraying a metal part",
    imageNote: "Representative image",
    intro: [
      "Our PLC-based powder coating plant puts parts through a 9-tank pre-treatment process and an oven dry at 120 °C. They are then sprayed with a Wagner gun in a stainless steel booth and cured in an oven.",
      "The SS booth lets us change colour quickly, which keeps small batches practical. Parts finished on this line sustain 900–1000 hours in salt spray testing.",
    ],
    machines: [mc("plc-powder-coating-plant")],
    capacity: [
      { label: "Pre-treatment", value: "9-tank process" },
      { label: "Drying", value: "Oven drying at 120 °C" },
      { label: "Booth", value: "SS booth, Wagner gun" },
      { label: "Salt spray", value: "900–1000 hours" },
    ],
    applications: [
      "Enclosures and control panels",
      "Architectural and decorative panels",
      "Brackets, frames and fabricated parts",
      "Cabinet grills and accessories",
    ],
    quoteMessage: svc("powder-coating").quoteMessage,
    quoteLabel: "Get a powder coating quote",
  },
  {
    slug: "design-cam",
    title: "Design & CAM Support",
    eyebrow: "Engineering",
    image: `${M}/factory/website-hero-laser-head-ai.jpg`,
    imageAlt: "Fiber laser cutting head",
    imageNote: "Representative image",
    intro: [
      "We follow a system approach: 3D modelling, drafting, CAM modelling, rendering, nesting and laser programming all happen in-house before a sheet goes on the machine.",
      "If you only have a sketch, a sample or a 3D model, we can work out the flat pattern, check the bends and program it for production.",
    ],
    machines: [],
    facilities: {
      title: "Software we use",
      points: [
        "Production Designer: sheet metal part development, bending simulation, blank development",
        "Sheet Works: sheet metal parts and 3D modelling",
        "Blank CAM: nesting and laser cutting programming",
      ],
    },
    applications: [
      "Converting drawings and samples to DXF",
      "Flat-pattern (blank) development for bent parts",
      "Nesting to reduce material waste",
      "Design help from concept to installation",
    ],
    quoteMessage: svc("design-cam").quoteMessage,
    quoteLabel: "Ask for design support",
  },
];

/** Materials PS Laser cuts (shop maxima, from the 2025 company profile). */
export const cutMaterials = [
  { slug: "ms", name: "Mild Steel", max: "16 mm", note: "Structural parts, brackets, enclosures. Usually powder coated." },
  { slug: "ss", name: "Stainless Steel", max: "12 mm", note: "Corrosion-resistant parts, food and outdoor use, visible finishes." },
  { slug: "al", name: "Aluminium", max: "8 mm", note: "Lightweight covers, panels and housings." },
  { slug: "brass", name: "Brass", max: "4 mm", note: "Decorative inlays, nameplates and fittings." },
  { slug: "cu", name: "Copper", max: "4 mm", note: "Electrical parts and decorative accents." },
];

/* ------------------------------------------------------------------ */
/* Architectural services                                              */
/* ------------------------------------------------------------------ */

export type ArchRow = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  text: string[];
  points: string[];
  quoteMessage: string;
  cta: string;
};

export const architecturalRows: ArchRow[] = [
  {
    id: "jaali-screens",
    title: "Laser-Cut Jaali & Screens",
    image: `${M}/products/laser-cut-jali-pattern.jpg`,
    imageAlt: "Laser-cut metal jaali panel with a geometric pattern",
    text: [
      "Jaali panels cut from your pattern or one of ours, for partitions, privacy screens, gate and railing inserts, and feature walls.",
      "The fiber laser keeps every motif crisp and repeatable. A screen stays consistent from the first panel to the last.",
    ],
    points: ["Your own design (DXF) or ours", "Panels up to the 3 m x 1.5 m bed", "MS, SS, aluminium, brass or copper"],
    quoteMessage:
      "Hi PS Laser, I need a quote for laser-cut jaali / screen panels. Pattern: ___, Panel size: ___ x ___ mm, Material & thickness: ___, Quantity: ___.",
    cta: "Enquire about jaali",
  },
  {
    id: "decorative-panels",
    title: "Decorative Panels",
    image: `${M}/products/powder-coated-decorative-panel.jpg`,
    imageAlt: "Powder-coated decorative metal panel",
    text: [
      "Cut, folded and powder-coated metal panels for interiors and building fronts, such as wall cladding features, ceiling inserts, planters and cover panels.",
      "Bending in-house lets us add folded edges and return flanges that stiffen a panel and make it easier to fix in place.",
    ],
    points: ["Folded edges and fixing flanges", "Cut, bent and coated in one shop", "Made to your drawing"],
    quoteMessage:
      "Hi PS Laser, I need a quote for decorative metal panels. Use: ___, Size: ___ x ___ mm, Material: ___, Finish/RAL: ___, Quantity: ___.",
    cta: "Enquire about panels",
  },
  {
    id: "cabinet-grills",
    title: "Cabinet Grills & Accessories",
    image: `${M}/services/cnc-turret-punching-parts.jpg`,
    imageAlt: "Punched and laser-cut sheet metal parts",
    text: [
      "We make all types of cabinet grills and accessories, from perforated and patterned grill sheets to brackets, frames and covers.",
      "For repeat orders, turret punching produces even perforations quickly. Laser cutting handles custom grill motifs and shapes.",
    ],
    points: ["Perforated and patterned grills", "Brackets, frames and covers", "Batch production for repeat orders"],
    quoteMessage:
      "Hi PS Laser, I need a quote for cabinet grills / accessories. Item: ___, Size: ___, Material & thickness: ___, Quantity: ___.",
    cta: "Enquire about grills",
  },
  {
    id: "powder-coated-finish",
    title: "Powder-Coated Finish",
    image: `${M}/gallery/powder-coating-bg.jpg`,
    imageAlt: "Powder coating being sprayed on a metal part",
    text: [
      "Architectural metalwork has to keep looking good in use. Our PLC-controlled line pre-treats every part in a 9-tank process, then coats and oven-cures it.",
      "The stainless steel booth makes colour changes quick, so small batches in a specific shade are practical. Coated parts sustain 900–1000 hours in salt spray tests.",
    ],
    points: ["9-tank pre-treatment", "Quick colour changeover", "900–1000 hrs salt spray"],
    quoteMessage:
      "Hi PS Laser, I need powder coating for architectural / decorative parts. Part size: ___, Quantity: ___, Colour/RAL & finish: ___.",
    cta: "Enquire about coating",
  },
  {
    id: "architectural-job-work",
    title: "Architectural Job Work",
    image: `${M}/gallery/fabrication-welding-bg.jpg`,
    imageAlt: "Welding a fabricated metal frame",
    text: [
      "Architects, interior designers and contractors can send us drawings for frames, brackets, supports and other custom metalwork. We cut, bend, weld and finish the parts to suit their site.",
      "Our team can help turn a concept sketch into production drawings, flat patterns and cutting programs.",
    ],
    points: ["Cutting, bending & welding", "Design help from drawing to installation", "MS, SS and aluminium"],
    quoteMessage:
      "Hi PS Laser, I have architectural / interior metalwork job work. Details: ___, Material: ___, Quantity: ___. I can share drawings.",
    cta: "Discuss your project",
  },
];

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export type GalleryCategory = "products" | "machines" | "facility" | "quality";

export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  caption: string;
  category: GalleryCategory;
};

export const galleryFilters: { key: "all" | GalleryCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "products", label: "Products" },
  { key: "machines", label: "Machines" },
  { key: "facility", label: "Facility" },
  { key: "quality", label: "Quality" },
];

const REP = "Representative work";
const REP_IMG = "Representative image";
const MAKER = "Manufacturer image of the model we run";

export const galleryItems: GalleryItem[] = [
  { id: "factory-front", src: `${M}/factory/ps-laser-factory-front-velu.jpg`, title: "PS Laser, Velu (Bhor, Pune)", caption: "Our unit at Gat No. 753, Velu (photo)", category: "facility" },
  { id: "p-enclosures", src: `${M}/products/industrial-enclosures-laser-cut-parts.jpg`, title: "Industrial Enclosures", caption: REP, category: "products" },
  { id: "p-panel-housings", src: `${M}/products/control-panel-housings-sheet-metal.jpg`, title: "Control Panel Housings", caption: REP, category: "products" },
  { id: "m-hsg-3kw", src: `${M}/machines/hsg-3kw-fiber-laser-3x1.5m.jpg`, title: "HSG 3 kW Fiber Laser", caption: MAKER, category: "machines" },
  { id: "p-brackets", src: `${M}/products/precision-brackets-enclosures.jpg`, title: "Precision Brackets", caption: REP, category: "products" },
  { id: "q-vernier", src: `${M}/quality/vernier-caliper.jpg`, title: "Vernier Caliper", caption: "Inspection instrument", category: "quality" },
  { id: "p-guards", src: `${M}/products/machine-guards-perforated-panels.jpg`, title: "Machine Guards", caption: REP, category: "products" },
  { id: "m-genesis", src: `${M}/machines/genesis-1.5kw-fiber-laser-3x1.5m.jpg`, title: "Genesis 1.5 kW Fiber Laser", caption: MAKER, category: "machines" },
  { id: "f-laser", src: `${M}/gallery/laser-cutting-bg.jpg`, title: "Laser Cutting", caption: REP_IMG, category: "facility" },
  { id: "p-fixtures", src: `${M}/products/custom-fixtures-welded.jpg`, title: "Custom Fixtures", caption: REP, category: "products" },
  { id: "m-press-brake", src: `${M}/machines/smart-bend-175t-cnc-press-brake-3m.jpg`, title: "CNC Press Brake 175 T x 3 m", caption: MAKER, category: "machines" },
  { id: "q-height-1", src: `${M}/quality/digital-height-gauge-1.jpg`, title: "Digital Height Gauge", caption: "Inspection instrument", category: "quality" },
  { id: "p-powder", src: `${M}/products/powder-coated-decorative-panel.jpg`, title: "Powder Coated Parts", caption: REP, category: "products" },
  { id: "f-bending", src: `${M}/gallery/cnc-bending-bg.jpg`, title: "CNC Bending", caption: REP_IMG, category: "facility" },
  { id: "m-amada-32", src: `${M}/machines/amada-vela-ii-32t-cnc-turret-punch.jpg`, title: "Amada VELA II 32 T Turret Punch", caption: MAKER, category: "machines" },
  { id: "p-jaali", src: `${M}/products/laser-cut-jali-pattern.jpg`, title: "Laser-Cut Jaali Pattern", caption: REP, category: "products" },
  { id: "q-micrometer", src: `${M}/quality/digital-micrometer.jpg`, title: "Digital Micrometer", caption: "Inspection instrument", category: "quality" },
  { id: "p-structural", src: `${M}/products/heavy-structural-fabrication.jpg`, title: "Structural Fabrication", caption: REP, category: "products" },
  { id: "m-amada-16", src: `${M}/machines/amada-pega-16t-cnc-turret-punch.jpg`, title: "Amada PEGA 16 T Turret Punch", caption: MAKER, category: "machines" },
  { id: "f-welding", src: `${M}/gallery/fabrication-welding-bg.jpg`, title: "Fabrication & Welding", caption: REP_IMG, category: "facility" },
  { id: "p-punched", src: `${M}/services/cnc-turret-punching-parts.jpg`, title: "Punched Sheet Metal Parts", caption: REP, category: "products" },
  { id: "q-height-2", src: `${M}/quality/digital-height-gauge-2.jpg`, title: "Digital Height Gauge", caption: "Inspection instrument", category: "quality" },
  { id: "m-welder", src: `${M}/machines/hsg-1.5kw-handheld-laser-welder.jpg`, title: "HSG 1.5 kW Laser Welder", caption: MAKER, category: "machines" },
  { id: "f-powder", src: `${M}/gallery/powder-coating-bg.jpg`, title: "Powder Coating", caption: REP_IMG, category: "facility" },
  { id: "q-protractor", src: `${M}/quality/degree-protractor.jpg`, title: "Degree Protractor", caption: "Inspection instrument", category: "quality" },
  { id: "m-laser-head", src: `${M}/factory/website-hero-laser-head-ai.jpg`, title: "Fiber Laser Cutting Head", caption: REP_IMG, category: "machines" },
  { id: "q-tape", src: `${M}/quality/measuring-tape.jpg`, title: "Measuring Tape", caption: "Inspection instrument", category: "quality" },
];

/* ------------------------------------------------------------------ */
/* Blogs                                                               */
/* ------------------------------------------------------------------ */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  image: string;
  imageAlt: string;
  tag: string;
  related: { label: string; href: string };
  quoteMessage: string;
  body: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "preparing-dxf-files-for-laser-cutting",
    title: "Preparing DXF Files for Laser Cutting: A Practical Checklist",
    excerpt:
      "A clean drawing is the quickest route to an accurate quote and a part that is right first time. These are the checks worth running before you send a DXF.",
    description:
      "A practical checklist for preparing DXF files for CNC fiber laser cutting: scale, closed contours, duplicate lines, minimum feature sizes, text, layers and sheet size.",
    image: "/sites/pslaser/gallery/laser-cutting-bg.jpg",
    imageAlt: "Fiber laser cutting a steel sheet",
    tag: "Laser Cutting",
    related: { label: "CNC Laser Cutting", href: "/engineering-services#laser-cutting" },
    quoteMessage:
      "Hi PS Laser, I have a DXF ready for laser cutting. Material: ___, Thickness: ___ mm, Quantity: ___. Sending the file here.",
    body: [
      { type: "p", text: "The laser follows whatever your file contains. A stray line becomes a stray cut, and an open contour may not cut at all. Most hold-ups between \"here is my drawing\" and \"parts are ready\" come from a few common drawing problems. All of them are easy to fix before you send the file." },
      { type: "h2", text: "1. Draw at full scale, in millimetres" },
      { type: "p", text: "Draw the part 1:1 and set the file units to millimetres. A DXF drawn in inches or at a paper-space scale imports at the wrong size. A 100 mm bracket can come in as 2,540 mm or 3.9 mm. Before you export, measure one known dimension in your CAD program to confirm it." },
      { type: "h2", text: "2. Keep only the geometry to be cut" },
      { type: "p", text: "Delete title blocks, borders, dimensions, centre lines, hatching and notes. Put that information in the message or a separate PDF. Anything left in the DXF has to be picked out by hand during programming, and anything missed can end up being cut." },
      { type: "h2", text: "3. Close every contour, and remove duplicates" },
      { type: "ul", items: [
        "Every outline and hole must be a closed loop. Join loose segments into polylines where your CAD tool allows it.",
        "Check for tiny gaps where lines nearly meet. Most CAD programs have a \"join\" or \"overkill\" type command that finds them.",
        "Delete overlapping or duplicate lines. A line drawn twice gets cut twice, which burns the edge and wastes machine time.",
        "Convert splines to arcs or polylines if your software offers it. Smooth curves then cut smoothly.",
      ] },
      { type: "h2", text: "4. Respect minimum feature sizes" },
      { type: "p", text: "As a working rule, keep hole diameters, slot widths and the bridges between cut-outs no smaller than the sheet thickness. Smaller features may still be possible depending on material and design, so ask us first. Very fine detail in thick plate can distort from heat or lose definition. On jaali and decorative panels, generous bridges also keep the panel stiff." },
      { type: "h2", text: "5. Text and lettering" },
      { type: "p", text: "Explode text to geometry, because fonts may not be installed on our system. Letters with enclosed centres, such as O, A, B, D, P and R, will drop their centres when cut. Use a stencil-style font, or add small bridges that keep the centres attached." },
      { type: "h2", text: "6. Use layers for different jobs" },
      { type: "p", text: "Put cut lines on one layer. If the part will be bent, put bend lines on a separate, clearly named layer and tell us the inside radius or the bend details. Better still, send the 3D model or the bend drawing, and we will develop the flat blank in-house with our sheet metal software. That way the finished part comes out at the right size." },
      { type: "h2", text: "7. Check the part fits the sheet" },
      { type: "p", text: "Our fiber lasers have 3 m x 1.5 m beds. Larger parts have to be split into sections and joined. It is better to plan those joints in the design than to discover them at the quoting stage." },
      { type: "h2", text: "8. Don't offset for the kerf" },
      { type: "p", text: "Draw parts at their nominal size. Our CAM software compensates for the beam width (kerf) when it programs the cut, so offsetting in the drawing makes parts undersize." },
      { type: "h2", text: "What to send with the file" },
      { type: "ol", items: [
        "The DXF (one part per file, or clearly separated parts with names)",
        "Material and thickness, e.g. MS 3 mm, SS 1.5 mm",
        "Quantity per part",
        "Any bending, welding or powder coating needed, with colour if known",
        "Required date",
      ] },
      { type: "note", text: "No DXF yet? Send a sketch, a PDF, a photo of a sample or a 3D model. Drafting, 3D modelling and flat-pattern development are part of our design support." },
    ],
  },
  {
    slug: "choosing-sheet-material-and-thickness",
    title: "Choosing Sheet Material and Thickness for Laser Cutting & Bending",
    excerpt:
      "Mild steel, stainless or aluminium? 2 mm or 3 mm? A practical guide to choosing material and thickness for parts that are cut, bent and finished.",
    description:
      "How to choose sheet metal material and thickness for laser cutting and CNC bending: MS, SS, aluminium, brass and copper, bend rules of thumb, hole-to-bend distances and finishing.",
    image: "/sites/pslaser/gallery/cnc-bending-bg.jpg",
    imageAlt: "CNC press brake bending a sheet metal part",
    tag: "Materials",
    related: { label: "CNC Bending", href: "/engineering-services#cnc-bending" },
    quoteMessage:
      "Hi PS Laser, I need advice on material and thickness for a sheet metal part. Application: ___, Approx. size: ___, Quantity: ___.",
    body: [
      { type: "p", text: "Material and thickness drive almost everything about a sheet metal part: its strength, weight, cost, how it bends and how it is finished. Getting these right early saves redesigns later. Below is a practical starting point. Every application is different, so treat these as rules of thumb and talk to us about your specific part." },
      { type: "h2", text: "Common materials and where they fit" },
      { type: "ul", items: [
        "Mild steel (MS): strong, economical and easy to weld and bend. It rusts if left bare, so it is usually powder coated. It is the default for brackets, frames, enclosures and structural parts.",
        "Stainless steel (SS): corrosion resistant and good-looking without coating. It suits food-contact, outdoor, washdown and visible parts. It costs more than MS and springs back more when bent.",
        "Aluminium: about one-third the weight of steel, naturally corrosion resistant and easy to form. It suits covers, housings and lightweight panels. Softer alloys bend easily, while harder tempers may crack on tight bends.",
        "Brass and copper: used for decorative inlays, nameplates, electrical parts and accents. They are usually thinner gauges.",
      ] },
      { type: "h2", text: "Our laser cutting capacity" },
      { type: "table", head: ["Material", "Maximum thickness"], rows: [
        ["Mild Steel", "16 mm"],
        ["Stainless Steel", "12 mm"],
        ["Aluminium", "8 mm"],
        ["Brass", "4 mm"],
        ["Copper", "4 mm"],
      ] },
      { type: "p", text: "These are the maximums our machines will cut. Edge quality and cost are usually best well inside these limits. If a part only needs 3 mm, specifying 5 mm adds weight and cost without adding much." },
      { type: "h2", text: "Picking a thickness" },
      { type: "ul", items: [
        "Thin sheet, around 0.8–2 mm: covers, enclosure skins, trays and decorative panels. Bends and flanges add the stiffness.",
        "Medium, around 2–5 mm: brackets, mounting plates, guards and frames that carry moderate loads.",
        "Heavy, above 5 mm: base plates, gussets and structural parts. Check whether bending is needed, because the force required rises steeply with thickness.",
      ] },
      { type: "p", text: "Often a thinner sheet with a well-placed bend or return flange is stiffer and cheaper than a thicker flat plate." },
      { type: "h2", text: "Designing for bending" },
      { type: "p", text: "Our CNC press brake is rated at 175 Ton over a 3 m length and handles sheet from 1 to 12 mm. A few rules of thumb help a part bend cleanly:" },
      { type: "ul", items: [
        "Inside bend radius: an inside radius close to the sheet thickness is a sensible default for MS. Harder materials and thicker plate need larger radii.",
        "Minimum flange length: very short flanges cannot sit across the bending die. Keep flanges to at least three to four times the thickness, and ask us for exact figures on thick material.",
        "Holes near bends: keep holes and slots at least about 2–3 times the thickness plus the bend radius away from the bend line, or they will stretch out of shape.",
        "Bend relief: where a bend meets an edge or another bend, add a small relief cut to prevent tearing.",
        "Consistency: use the same inside radius throughout a part wherever possible. Fewer tool changes means faster, more consistent bending.",
      ] },
      { type: "h2", text: "Laser cutting or turret punching?" },
      { type: "p", text: "For parts with many identical holes, louvres or perforations, CNC turret punching is often quicker. Our Amada machines punch up to 5 mm (32 Ton) and 3 mm (16 Ton). Laser cutting suits complex profiles, small batches and thicker plate. Many parts use both, and we will suggest the most economical route." },
      { type: "h2", text: "Think about the finish early" },
      { type: "p", text: "If an MS part will be powder coated, avoid sealed pockets that can trap pre-treatment chemicals. Provide a hole or tab for hanging, and tell us which surfaces or threads need masking. Stainless and aluminium parts may need no coating at all, which can offset their higher material cost." },
      { type: "note", text: "Not sure what to specify? Send us the application and approximate size on WhatsApp. We will suggest a material and thickness that balance strength, cost and finish." },
    ],
  },
  {
    slug: "why-pre-treatment-matters-in-powder-coating",
    title: "Why Pre-Treatment Matters in Powder Coating",
    excerpt:
      "A powder coat is only as good as the surface underneath it. Here is what happens to a part before the powder goes on, and why it decides how long the finish lasts.",
    description:
      "Why surface pre-treatment is the most important step in powder coating: cleaning, multi-tank pre-treatment, drying, curing, salt spray testing and what to specify when ordering.",
    image: "/sites/pslaser/gallery/powder-coating-bg.jpg",
    imageAlt: "Powder coating booth spraying a metal part",
    tag: "Powder Coating",
    related: { label: "Powder Coating", href: "/engineering-services#powder-coating" },
    quoteMessage:
      "Hi PS Laser, I need powder coating with pre-treatment. Part size: ___, Material: ___, Quantity: ___, Colour/RAL: ___.",
    body: [
      { type: "p", text: "A powder-coated part can look perfect on the day it leaves the plant and still start peeling or rusting under the paint within months. When that happens, the powder is rarely the cause. Usually the surface underneath was never properly prepared. Pre-treatment is the least visible step in powder coating, and it is the one that decides how long the finish lasts." },
      { type: "h2", text: "What goes wrong without it" },
      { type: "ul", items: [
        "Oil and grease from cutting, bending and handling stop the powder bonding, which leads to poor adhesion and flaking.",
        "Rust, scale and oxide films trap corrosion under the coating. It spreads sideways from any chip or scratch, a problem known as underfilm corrosion.",
        "Dust and residues show through as bumps and craters in the cured film.",
      ] },
      { type: "h2", text: "What multi-stage pre-treatment does" },
      { type: "p", text: "Industrial pre-treatment cleans the part and converts its surface in a sequence of chemical and rinse stages. A typical sequence includes degreasing, rinsing, rust or scale removal, rinsing, surface conditioning, a conversion coating such as phosphating, and final rinses. The conversion layer bonds to the metal and gives the powder a surface it can grip, which greatly improves adhesion and corrosion resistance. Every rinse stage matters, because chemicals carried from one tank into the next weaken the result." },
      { type: "p", text: "Our PLC-based plant uses a 9-tank pre-treatment process. Running more stages allows thorough cleaning and rinsing between chemical steps." },
      { type: "h2", text: "Dry before you coat" },
      { type: "p", text: "Moisture trapped in seams or on the surface causes blisters and pinholes when the part is cured. After pre-treatment, our parts are dried in an oven at 120 °C before they enter the booth." },
      { type: "h2", text: "Application and curing" },
      { type: "p", text: "The powder is sprayed electrostatically. We use a Wagner gun in a stainless steel booth, which can be cleaned quickly for colour changes. The part is then cured in an oven at the time and temperature the powder manufacturer specifies, so the powder flows out and cross-links into a hard, continuous film." },
      { type: "h2", text: "How the result is measured" },
      { type: "p", text: "The salt spray test (often run to ASTM B117) exposes coated samples to a continuous salt fog and records how long they last before corrosion or coating failure appears. It is an accelerated, comparative test. It does not convert directly into years of outdoor life, but it is a useful way to compare processes. Parts finished on our line sustain 900–1000 hours of salt spray testing." },
      { type: "h2", text: "What to tell your coater" },
      { type: "ol", items: [
        "Colour (RAL or shade card reference) and finish: gloss, semi-gloss, matt or textured",
        "Indoor or outdoor use",
        "Surfaces, threads or holes that must stay uncoated (masking)",
        "Where the part can be hung, or whether a hanging hole can be added",
        "Quantity and any coating thickness requirement",
      ] },
      { type: "note", text: "Because cutting, bending, welding and coating happen in one shop, parts move straight from fabrication to pre-treatment, with no transport between suppliers and less handling damage." },
    ],
  },
];

export function wordCount(post: BlogPost): number {
  const text = post.body
    .map((b) => {
      if (b.type === "ul" || b.type === "ol") return b.items.join(" ");
      if (b.type === "table") return [...b.head, ...b.rows.flat()].join(" ");
      return b.text;
    })
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingTime(post: BlogPost): string {
  return `${Math.max(1, Math.round(wordCount(post) / 200))} min read`;
}

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
