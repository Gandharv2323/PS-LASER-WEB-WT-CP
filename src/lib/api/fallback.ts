/**
 * Typed offline fallback, mirroring services/db/seed.sql (SAMPLE rate card, is_sample = 1)
 * and the material limits in src/lib/pslaser/data.ts. Used only when Spring is unreachable.
 */
import { materials as siteMaterials } from "@/lib/pslaser/data";
import type { Material, MaterialCode, RateRow, RateSettings, TrackedOrder } from "./types";

const DENSITY: Readonly<Record<MaterialCode, number>> = { MS: 7.85, SS: 8.0, AL: 2.7, BR: 8.5, CU: 8.96 };
const CODE_BY_NAME: Readonly<Record<string, MaterialCode>> = {
  "Mild Steel": "MS",
  "Stainless Steel": "SS",
  Aluminium: "AL",
  Brass: "BR",
  Copper: "CU",
};

/** Built from data.ts so the public site and the estimator never disagree on limits. */
export const FALLBACK_MATERIALS: readonly Material[] = siteMaterials.map((m) => {
  const code = CODE_BY_NAME[m.name] ?? "MS";
  return { code, name: m.name, maxThicknessMm: Number.parseFloat(m.max), densityGCm3: DENSITY[code] };
});

const r = (materialCode: MaterialCode, thicknessFromMm: number, thicknessToMm: number, cutRatePerM: number, pierceRate: number, materialRatePerKg: number): RateRow => ({
  materialCode,
  thicknessFromMm,
  thicknessToMm,
  cutRatePerM,
  pierceRate,
  materialRatePerKg,
});

export const FALLBACK_RATES: readonly RateRow[] = [
  r("MS", 0.5, 3, 10, 1, 75),
  r("MS", 3.01, 8, 22, 2, 72),
  r("MS", 8.01, 16, 45, 4, 70),
  r("SS", 0.5, 3, 18, 1.5, 260),
  r("SS", 3.01, 12, 48, 4, 255),
  r("AL", 0.5, 3, 16, 1.5, 290),
  r("AL", 3.01, 8, 38, 3, 285),
  r("BR", 0.5, 4, 40, 3, 650),
  r("CU", 0.5, 4, 48, 3, 900),
];

export const FALLBACK_SETTINGS: RateSettings = {
  bendRateInr: 8,
  powderCoatRatePerSqm: 120,
  gstPercent: 18,
  ratesAreSample: true,
};

/** Demo orders from seed.sql so /track can be demonstrated with the API offline. */
export function demoOrder(orderNo: string, phone: string): TrackedOrder | null {
  const due = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const orders: (TrackedOrder & { phone: string })[] = [
    {
      id: 1,
      orderNo: "PSL-DEMO-001",
      phone: "9000000001",
      customerName: "Demo Customer A",
      description: "MS 2 mm panel brackets, bent + powder coated",
      machineSlug: "hsg-3kw-fiber-laser",
      quantity: 120,
      status: "bending",
      dueDate: due(5),
      updatedAt: null,
      events: [
        { status: "received", note: "Drawing received on WhatsApp", createdAt: null },
        { status: "cutting", note: "Cut on 3 kW fiber laser", createdAt: null },
        { status: "bending", note: "On 175 T press brake", createdAt: null },
      ],
    },
    {
      id: 2,
      orderNo: "PSL-DEMO-002",
      phone: "9000000002",
      customerName: "Demo Customer B",
      description: "SS 1.5 mm perforated grill (turret punched)",
      machineSlug: "amada-vela-ii-32t-turret-punch",
      quantity: 40,
      status: "inspection",
      dueDate: due(2),
      updatedAt: null,
      events: [
        { status: "received", note: "DXF approved", createdAt: null },
        { status: "cutting", note: "Punched on Amada 32 T", createdAt: null },
        { status: "inspection", note: "Dimensional check", createdAt: null },
      ],
    },
  ];
  const digits = phone.replace(/\D/g, "").slice(-10);
  const hit = orders.find((o) => o.orderNo.toUpperCase() === orderNo.trim().toUpperCase() && o.phone === digits);
  if (!hit) return null;
  const { phone: _phone, ...order } = hit;
  void _phone;
  return order;
}
