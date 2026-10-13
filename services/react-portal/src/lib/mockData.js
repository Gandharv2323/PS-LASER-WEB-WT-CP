// OFFLINE DEMO DATA.
// Used only when the Spring Boot (:8081) / Node (:4000) APIs are unreachable, so the portal
// still works standalone in a viva/demo. Every screen that renders this data shows the
// <OfflineBadge/> "offline demo data" flag.
// Machine/service facts are copied from src/lib/pslaser/data.ts; materials, the SAMPLE
// rate card and settings are copied from services/db/seed.sql (is_sample = 1 placeholder prices).

export const mockMachines = [
  {
    slug: 'hsg-3kw-fiber-laser',
    name: 'HSG 3 kW Fiber Laser Cutting Machine',
    shortName: '3 kW Fiber Laser',
    category: 'Laser Cutting',
    specs: ['3 kW fiber laser', 'Bed 3 m x 1.5 m', 'Enclosed cabinet with exchange table', 'MS 16 mm · SS 12 mm · Al 8 mm · Brass/Cu 4 mm'],
    image: '/img/machines/hsg-3kw-fiber-laser-3x1.5m.jpg',
  },
  {
    slug: 'genesis-1-5kw-fiber-laser',
    name: 'Genesis 1.5 kW Fiber Laser Cutting Machine',
    shortName: '1.5 kW Fiber Laser',
    category: 'Laser Cutting',
    specs: ['1.5 kW fiber laser', 'Bed 3 m x 1.5 m', 'Open-bed gantry', 'Ideal for thin sheet & fine profiles'],
    image: '/img/machines/genesis-1.5kw-fiber-laser-3x1.5m.jpg',
  },
  {
    slug: 'smart-bend-175t-press-brake',
    name: 'CNC Press Brake 175 Ton x 3 m',
    shortName: '175 T CNC Press Brake',
    category: 'CNC Bending',
    specs: ['175 Ton capacity', '3 m bending length', 'Sheet thickness 1–12 mm', 'CNC Y1/Y2 synchro axes'],
    image: '/img/machines/smart-bend-175t-cnc-press-brake-3m.jpg',
  },
  {
    slug: 'amada-vela-ii-32t-turret-punch',
    name: 'Amada VELA II CNC Turret Punch – 32 Ton',
    shortName: 'Amada 32 T Turret Punch',
    category: 'CNC Turret Punching',
    specs: ['32 Ton', 'Punching up to 5 mm', '40 stations', 'Table 8 ft x 4 ft'],
    image: '/img/machines/amada-vela-ii-32t-cnc-turret-punch.jpg',
  },
  {
    slug: 'amada-pega-16t-turret-punch',
    name: 'Amada PEGA CNC Turret Punch – 16 Ton',
    shortName: 'Amada 16 T Turret Punch',
    category: 'CNC Turret Punching',
    specs: ['16 Ton', 'Punching up to 3 mm', '26 stations', 'Table 4 ft x 4 ft'],
    image: '/img/machines/amada-pega-16t-cnc-turret-punch.jpg',
  },
  {
    slug: 'hsg-1-5kw-laser-welder',
    name: 'HSG 1.5 kW Handheld Laser Welding Machine',
    shortName: '1.5 kW Laser Welder',
    category: 'Laser Welding',
    specs: ['1.5 kW handheld laser', 'MS, SS & Aluminium', 'Fillet, vertical, tailor & flat welds', 'Clean, low-distortion seams'],
    image: '/img/machines/hsg-1.5kw-handheld-laser-welder.jpg',
  },
  {
    slug: 'plc-powder-coating-plant',
    name: 'PLC-Based Powder Coating Plant',
    shortName: 'Powder Coating Plant',
    category: 'Powder Coating',
    specs: ['9-tank pre-treatment', 'Oven drying 120 °C & oven curing', 'SS booth with Wagner gun', '900–1000 hrs salt spray'],
    image: '/img/machines/powder-coating-bg.jpg',
  },
]

export const mockServices = [
  { slug: 'laser-cutting', title: 'CNC Laser Cutting', description: 'Two fiber lasers (3 kW HSG + 1.5 kW Genesis) with 3 m x 1.5 m beds. MS up to 16 mm, SS 12 mm, Aluminium 8 mm, Brass & Copper 4 mm.' },
  { slug: 'cnc-bending', title: 'CNC Bending', description: '175 Ton x 3 m CNC press brake for 1–12 mm sheet with precise, repeatable angles.' },
  { slug: 'turret-punching', title: 'CNC Turret Punching', description: 'Amada 32 T (40 stations, 8x4 ft, up to 5 mm) and Amada 16 T (26 stations, 4x4 ft, up to 3 mm).' },
  { slug: 'laser-welding', title: 'Laser Welding', description: 'HSG 1.5 kW handheld laser welding for MS, SS & Aluminium — fillet, vertical, tailor and flat welds.' },
  { slug: 'fabrication', title: 'Sheet Metal Fabrication & Welding', description: 'Dedicated MS, SS & Al welding stations with clamps and fixtures, plus grinding, buffing and cleaning.' },
  { slug: 'powder-coating', title: 'Powder Coating', description: 'PLC-based plant with 9-tank pre-treatment, SS booth for quick colour change and parts that sustain 900–1000 hrs salt spray.' },
  { slug: 'design-cam', title: 'Design & CAM Support', description: '3D modelling, drafting, blank development, nesting and laser programming.' },
  { slug: 'architectural', title: 'Architectural, Grills & Job Work', description: 'Laser-cut jaali and decorative panels, cabinet grills and accessories, and industrial job work.' },
]

export const mockMaterials = [
  { code: 'MS', name: 'Mild Steel', maxThicknessMm: 16, density: 7.85 },
  { code: 'SS', name: 'Stainless Steel', maxThicknessMm: 12, density: 8.0 },
  { code: 'AL', name: 'Aluminium', maxThicknessMm: 8, density: 2.7 },
  { code: 'BR', name: 'Brass', maxThicknessMm: 4, density: 8.5 },
  { code: 'CU', name: 'Copper', maxThicknessMm: 4, density: 8.96 },
]

// SAMPLE rate card — placeholder numbers from seed.sql, NOT PS Laser's real prices.
export const mockRates = [
  { material: 'MS', from: 0.5, to: 3, cut: 10, pierce: 1, perKg: 75 },
  { material: 'MS', from: 3.01, to: 8, cut: 22, pierce: 2, perKg: 72 },
  { material: 'MS', from: 8.01, to: 16, cut: 45, pierce: 4, perKg: 70 },
  { material: 'SS', from: 0.5, to: 3, cut: 18, pierce: 1.5, perKg: 260 },
  { material: 'SS', from: 3.01, to: 12, cut: 48, pierce: 4, perKg: 255 },
  { material: 'AL', from: 0.5, to: 3, cut: 16, pierce: 1.5, perKg: 290 },
  { material: 'AL', from: 3.01, to: 8, cut: 38, pierce: 3, perKg: 285 },
  { material: 'BR', from: 0.5, to: 4, cut: 40, pierce: 3, perKg: 650 },
  { material: 'CU', from: 0.5, to: 4, cut: 48, pierce: 3, perKg: 900 },
]

export const mockSettings = { bendRate: 8, powderCoatPerSqm: 120, gstPercent: 18 }

// Fake demo orders (same as seed.sql) so /track works offline.
export const mockWorkOrders = [
  {
    orderNo: 'PSL-DEMO-001', phone: '9000000001', customerName: 'Demo Customer A',
    description: 'MS 2 mm panel brackets, bent + powder coated', machineSlug: 'hsg-3kw-fiber-laser', quantity: 120, status: 'bending',
    events: [
      { status: 'received', note: 'Drawing received on WhatsApp' },
      { status: 'cutting', note: 'Cut on 3 kW fiber laser' },
      { status: 'bending', note: 'On 175 T press brake' },
    ],
  },
  {
    orderNo: 'PSL-DEMO-002', phone: '9000000002', customerName: 'Demo Customer B',
    description: 'SS 1.5 mm perforated grill (turret punched)', machineSlug: 'amada-vela-ii-32t-turret-punch', quantity: 40, status: 'inspection',
    events: [
      { status: 'received', note: 'DXF approved' },
      { status: 'cutting', note: 'Punched on Amada 32 T' },
      { status: 'inspection', note: 'Dimensional check' },
    ],
  },
]

export const mockQuotes = [
  { quoteNo: 'DEMO-Q-0001', materialCode: 'MS', thicknessMm: 2, quantity: 50, total: 10620.0, status: 'new', createdAt: null },
  { quoteNo: 'DEMO-Q-0002', materialCode: 'SS', thicknessMm: 1.5, quantity: 10, total: 4012.6, status: 'quoted', createdAt: null },
]
