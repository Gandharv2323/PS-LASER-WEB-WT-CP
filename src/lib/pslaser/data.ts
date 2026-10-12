// Shared PS Laser content. Source: docs/research/pslaser/brief.md (PDF values win on conflicts).

const M = "/sites/pslaser";

export const WHATSAPP_NUMBER = "917719976990";

/** wa.me link with a pre-filled message. */
export function whatsapp(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const company = {
  brand: "PS Laser",
  /** Legal name. Only for the GSTIN legal line in the footer; never as a brand line. */
  legalName: "P S Enterprises",
  tagline: "Manufacturer of Precision Engineering & Sheet Metal Components",
  subTagline: "We manufacture precision metal components using advanced laser technology.",
  about:
    "PS Laser is a precision engineering manufacturer serving industrial and OEM clients with reliable, controlled and scalable processes — from laser cutting and CNC bending to welding and powder coating, under one roof.",
  mission:
    "To provide high-quality laser cutting services to customers and meet their diverse needs.",
  vision:
    "To remain at the forefront of laser cutting technology and provide innovative and efficient solutions to our customers.",
  gstin: "27ABHFP5667Q1Z8",
  address: "Gat No. 753, At Post – Velu, Tal. Bhor, Dist. Pune – 412205, Maharashtra, India",
  locationLabel: "Velu (Khed Shivapur), Pune",
  email: "pslaser24@gmail.com",
  /** Google Maps share link for the "PS Laser" place. */
  mapUrl: "https://maps.app.goo.gl/X8i2e6Cf3ZbHLR8g7",
  logo: `${M}/logo/ps-laser-logo.png`,
  favicon: `${M}/logo/favicon.png`,
  factoryPhoto: `${M}/factory/ps-laser-factory-front-velu.jpg`,
  heroVideo: `${M}/video/hero-laser-cutting.mp4`,
  whatsappIcon: `${M}/icons/whatsapp.gif`,
};

/** Google Maps place "PS Laser", Velu, Bhor, Pune. */
export const MAP_LAT = 18.3610082;
export const MAP_LNG = 73.8508088;
export const mapShare = company.mapUrl;
export const mapDirections = `https://www.google.com/maps/dir/?api=1&destination=${MAP_LAT},${MAP_LNG}`;
export const mapEmbed = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}+(PS+Laser)&z=16&output=embed`;

export const contacts = [
  { name: "Swapnil Tanpure", phone: "+91 77199 76990", tel: "+917719976990", primary: true },
  { name: "Pranil Talap", phone: "+91 97636 79499", tel: "+919763679499" },
  { name: "Umesh Tanpure", phone: "+91 97643 64704", tel: "+919764364704" },
  { name: "Sonu Agrawal", phone: "+91 96231 61813", tel: "+919623161813" },
];

export const GENERAL_QUOTE_MESSAGE =
  "Hi PS Laser, I would like to get a quotation for sheet metal work (laser cutting / bending / punching / welding / powder coating). Please share details.";

export type Machine = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  specs: string[];
  image: string;
  quoteMessage: string;
};

export const machines: Machine[] = [
  {
    slug: "hsg-3kw-fiber-laser",
    name: "HSG 3 kW Fiber Laser Cutting Machine",
    shortName: "3 kW Fiber Laser",
    category: "Laser Cutting",
    specs: ["3 kW fiber laser", "Bed 3 m x 1.5 m", "Enclosed cabinet with exchange table", "MS 16 mm · SS 12 mm · Al 8 mm · Brass/Cu 4 mm"],
    image: `${M}/machines/hsg-3kw-fiber-laser-3x1.5m.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for CNC laser cutting on your HSG 3 kW fiber laser (3m x 1.5m). Material: ___, Thickness: ___ mm, Quantity: ___. I can share the DXF/drawing.",
  },
  {
    slug: "genesis-1-5kw-fiber-laser",
    name: "Genesis 1.5 kW Fiber Laser Cutting Machine",
    shortName: "1.5 kW Fiber Laser",
    category: "Laser Cutting",
    specs: ["1.5 kW fiber laser", "Bed 3 m x 1.5 m", "Open-bed gantry", "Ideal for thin sheet & fine profiles"],
    image: `${M}/machines/genesis-1.5kw-fiber-laser-3x1.5m.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for thin-sheet laser cutting on your Genesis 1.5 kW fiber laser. Material: ___, Thickness: ___ mm, Quantity: ___. I can share the DXF/drawing.",
  },
  {
    slug: "smart-bend-175t-press-brake",
    name: "CNC Press Brake 175 Ton x 3 m",
    shortName: "175 T CNC Press Brake",
    category: "CNC Bending",
    specs: ["175 Ton capacity", "3 m bending length", "Sheet thickness 1–12 mm", "CNC Y1/Y2 synchro axes"],
    image: `${M}/machines/smart-bend-175t-cnc-press-brake-3m.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for CNC bending on your 175 Ton x 3m press brake. Material: ___, Thickness: ___ mm, Bend length: ___, Quantity: ___.",
  },
  {
    slug: "amada-vela-ii-32t-turret-punch",
    name: "Amada VELA II CNC Turret Punch – 32 Ton",
    shortName: "Amada 32 T Turret Punch",
    category: "CNC Turret Punching",
    specs: ["32 Ton", "Punching up to 5 mm", "40 stations", "Table 8 ft x 4 ft"],
    image: `${M}/machines/amada-vela-ii-32t-cnc-turret-punch.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for CNC turret punching on your Amada 32 Ton (40 station) machine. Material: ___, Thickness: ___ mm (up to 5 mm), Quantity: ___.",
  },
  {
    slug: "amada-pega-16t-turret-punch",
    name: "Amada PEGA CNC Turret Punch – 16 Ton",
    shortName: "Amada 16 T Turret Punch",
    category: "CNC Turret Punching",
    specs: ["16 Ton", "Punching up to 3 mm", "26 stations", "Table 4 ft x 4 ft"],
    image: `${M}/machines/amada-pega-16t-cnc-turret-punch.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for CNC turret punching on your Amada 16 Ton (26 station) machine. Material: ___, Thickness: ___ mm (up to 3 mm), Quantity: ___.",
  },
  {
    slug: "hsg-1-5kw-laser-welder",
    name: "HSG 1.5 kW Handheld Laser Welding Machine",
    shortName: "1.5 kW Laser Welder",
    category: "Laser Welding",
    specs: ["1.5 kW handheld laser", "MS, SS & Aluminium", "Fillet, vertical, tailor & flat welds", "Clean, low-distortion seams"],
    image: `${M}/machines/hsg-1.5kw-handheld-laser-welder.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for laser welding (HSG 1.5 kW). Material: MS / SS / Aluminium, Thickness: ___ mm, Weld type: ___, Quantity: ___.",
  },
  {
    slug: "plc-powder-coating-plant",
    name: "PLC-Based Powder Coating Plant",
    shortName: "Powder Coating Plant",
    category: "Powder Coating",
    specs: ["9-tank pre-treatment", "Oven drying 120 °C & oven curing", "SS booth with Wagner gun", "900–1000 hrs salt spray"],
    image: `${M}/gallery/powder-coating-bg.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for powder coating (9-tank PT, PLC plant). Part size: ___, Quantity: ___, Colour/RAL: ___.",
  },
];

export const services = [
  {
    slug: "laser-cutting",
    title: "CNC Laser Cutting",
    text: "Two fiber lasers (3 kW HSG + 1.5 kW Genesis) with 3 m x 1.5 m beds. MS up to 16 mm, SS 12 mm, Aluminium 8 mm, Brass & Copper 4 mm.",
    image: `${M}/gallery/laser-cutting-bg.jpg`,
    quoteMessage: machines[0].quoteMessage,
  },
  {
    slug: "cnc-bending",
    title: "CNC Bending",
    text: "175 Ton x 3 m CNC press brake for 1–12 mm sheet with precise, repeatable angles.",
    image: `${M}/gallery/cnc-bending-bg.jpg`,
    quoteMessage: machines[2].quoteMessage,
  },
  {
    slug: "turret-punching",
    title: "CNC Turret Punching",
    text: "Amada 32 T (40 stations, 8x4 ft, up to 5 mm) and Amada 16 T (26 stations, 4x4 ft, up to 3 mm).",
    image: `${M}/services/cnc-turret-punching-parts.jpg`,
    quoteMessage: machines[3].quoteMessage,
  },
  {
    slug: "laser-welding",
    title: "Laser Welding",
    text: "HSG 1.5 kW handheld laser welding for MS, SS & Aluminium — fillet, vertical, tailor and flat welds.",
    image: `${M}/machines/hsg-1.5kw-handheld-laser-welder.jpg`,
    quoteMessage: machines[5].quoteMessage,
  },
  {
    slug: "fabrication",
    title: "Sheet Metal Fabrication & Welding",
    text: "Dedicated MS, SS & Al welding stations with clamps and fixtures, plus grinding, buffing and cleaning.",
    image: `${M}/gallery/fabrication-welding-bg.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for sheet metal fabrication & welding. Material: ___, Part/assembly details: ___, Quantity: ___.",
  },
  {
    slug: "powder-coating",
    title: "Powder Coating",
    text: "PLC-based plant with 9-tank pre-treatment, SS booth for quick colour change and parts that sustain 900–1000 hrs salt spray.",
    image: `${M}/gallery/powder-coating-bg.jpg`,
    quoteMessage: machines[6].quoteMessage,
  },
  {
    slug: "design-cam",
    title: "Design & CAM Support",
    text: "3D modelling, drafting, blank development, nesting and laser programming (Production Designer, Sheet Works, Blank CAM).",
    image: `${M}/factory/website-hero-laser-head-ai.jpg`,
    quoteMessage:
      "Hi PS Laser, I need design / CAM support (3D modelling, flat pattern, nesting) for a sheet metal part. Details: ___.",
  },
  {
    slug: "architectural",
    title: "Architectural, Grills & Job Work",
    text: "Laser-cut jaali and decorative panels, cabinet grills and accessories, and industrial job work.",
    image: `${M}/products/laser-cut-jali-pattern.jpg`,
    quoteMessage:
      "Hi PS Laser, I need a quote for architectural / jaali / grill work. Design: ___, Size: ___, Material: ___, Quantity: ___.",
  },
];

export const materials = [
  { name: "Mild Steel", max: "16 mm" },
  { name: "Stainless Steel", max: "12 mm" },
  { name: "Aluminium", max: "8 mm" },
  { name: "Brass", max: "4 mm" },
  { name: "Copper", max: "4 mm" },
];

export const stats = [
  { value: "3 kW", label: "Fiber Laser Power" },
  { value: "16 mm", label: "MS Cutting Capacity" },
  { value: "175 T", label: "Press Brake Capacity" },
  { value: "40", label: "Turret Punch Stations" },
  { value: "9-Tank", label: "Pre-Treatment" },
  { value: "1000 h", label: "Salt Spray Test" },
];

export const process = [
  { title: "Design & Planning", text: "CAD/CAM programming and material planning." },
  { title: "Laser Cutting", text: "Precision CNC laser cutting with fiber technology." },
  { title: "Punching & Bending", text: "Amada turret punching and CNC press brake forming." },
  { title: "Welding & Assembly", text: "Laser welding and fabrication on dedicated stations." },
  { title: "Powder Coating", text: "9-tank pre-treatment, coating and oven curing." },
  { title: "Quality & Dispatch", text: "Inspection, packaging and delivery." },
];

export const whyUs = [
  "Branded, precision machines",
  "Advanced CAD-CAM software",
  "Skilled designers & qualified operators",
  "In-house tool designing & manufacturing",
  "Close-tolerance parts, cost effective",
  "Assistance from design to installation",
];

export const products = [
  { title: "Industrial Enclosures", image: `${M}/products/industrial-enclosures-laser-cut-parts.jpg` },
  { title: "Control Panel Housings", image: `${M}/products/control-panel-housings-sheet-metal.jpg` },
  { title: "Precision Brackets", image: `${M}/products/precision-brackets-enclosures.jpg` },
  { title: "Machine Guards", image: `${M}/products/machine-guards-perforated-panels.jpg` },
  { title: "Custom Fixtures", image: `${M}/products/custom-fixtures-welded.jpg` },
  { title: "Powder Coated Parts", image: `${M}/products/powder-coated-decorative-panel.jpg` },
  { title: "Laser Cut Jaali Patterns", image: `${M}/products/laser-cut-jali-pattern.jpg` },
  { title: "Structural Fabrication", image: `${M}/products/heavy-structural-fabrication.jpg` },
];

export const quality = [
  { title: "Vernier Caliper", image: `${M}/quality/vernier-caliper.jpg` },
  { title: "Digital Height Gauge", image: `${M}/quality/digital-height-gauge-1.jpg` },
  { title: "Digital Micrometer", image: `${M}/quality/digital-micrometer.jpg` },
  { title: "Degree Protractor", image: `${M}/quality/degree-protractor.jpg` },
];

export const industries = [
  "Industrial OEMs",
  "Electrical Panels & Enclosures",
  "Machine Building",
  "Architectural & Interior Metalwork",
  "Furniture & Cabinet Hardware",
];

/** Equipment brands PS Laser runs on its floor (not partners or clients). */
export const equipmentBrands = [
  { name: "HSG Laser", note: "3 kW fiber laser · 1.5 kW laser welder" },
  { name: "Amada", note: "32 T & 16 T CNC turret punches" },
  { name: "Genesis", note: "1.5 kW fiber laser" },
  { name: "Wagner", note: "Powder coating gun" },
];
