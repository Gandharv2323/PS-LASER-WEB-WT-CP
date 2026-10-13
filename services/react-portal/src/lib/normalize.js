// The Spring/Node APIs are being built in parallel; these helpers accept both camelCase
// (Spring/Jackson) and snake_case (raw MySQL rows from Node) so the UI gets one shape.

const imageFor = (img) => {
  if (!img) return '/img/machines/hsg-3kw-fiber-laser-3x1.5m.jpg'
  const file = String(img).split('/').pop()
  // The portal ships copies of the PS Laser machine photos in public/img/machines.
  return `/img/machines/${file}`
}

export function normalizeMachine(m) {
  if (!m) return null
  const specs = Array.isArray(m.specs) ? m.specs : String(m.specs ?? '').split(/\r?\n/).filter(Boolean)
  return {
    slug: m.slug,
    name: m.name,
    shortName: m.shortName ?? m.short_name ?? m.name,
    category: m.category ?? 'Machine',
    specs,
    image: imageFor(m.image),
  }
}

export const normalizeService = (s) => ({
  slug: s.slug,
  title: s.title ?? s.name,
  description: s.description ?? s.text ?? '',
})

export const normalizeMaterial = (m) => ({
  code: m.code,
  name: m.name,
  maxThicknessMm: Number(m.maxThicknessMm ?? m.max_thickness_mm ?? 0),
  density: Number(m.densityGCm3 ?? m.density_g_cm3 ?? m.density ?? 0),
})

export function normalizeTrack(d) {
  if (!d) return null
  const o = d.order ?? d.workOrder ?? d
  return {
    orderNo: o.orderNo ?? o.order_no,
    customerName: o.customerName ?? o.customer_name,
    description: o.description,
    machineSlug: o.machineSlug ?? o.machine_slug,
    quantity: o.quantity,
    status: o.status,
    dueDate: o.dueDate ?? o.due_date ?? null,
    events: (d.events ?? o.events ?? []).map((e) => ({
      id: e.id ?? null,
      status: e.status,
      note: e.note,
      createdAt: e.createdAt ?? e.created_at ?? null,
    })),
  }
}

export const normalizeQuote = (q) => ({
  quoteNo: q.quoteNo ?? q.quote_no ?? `#${q.id}`,
  materialCode: q.materialCode ?? q.material_code,
  thicknessMm: q.thicknessMm ?? q.thickness_mm,
  quantity: q.quantity,
  total: q.total,
  status: q.status ?? 'new',
  createdAt: q.createdAt ?? q.created_at ?? null,
})
