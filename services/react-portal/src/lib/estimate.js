// Offline copy of the shared estimate formula (services/CONTRACT.md, "Price estimate formula").
// Only used when Spring Boot's POST /api/quotes/estimate is unreachable. Uses the SAMPLE rate card.
import { mockMaterials, mockRates, mockSettings } from './mockData.js'

const r2 = (n) => Math.round(n * 100) / 100

export function estimateLocally(input) {
  const { materialCode, thicknessMm, lengthMm, widthMm, cutLengthMm, pierces, bends, powderCoat, quantity } = input
  const material = mockMaterials.find((m) => m.code === materialCode)
  if (!material) throw new Error(`Unknown material ${materialCode}`)
  const rate = mockRates.find((r) => r.material === materialCode && thicknessMm >= r.from && thicknessMm <= r.to)
  if (!rate) throw new Error(`No rate for ${materialCode} at ${thicknessMm} mm`)

  const areaM2 = (lengthMm * widthMm) / 1e6
  const weightKg = areaM2 * thicknessMm * material.density
  const breakdown = {
    material: r2(weightKg * rate.perKg),
    cutting: r2((cutLengthMm / 1000) * rate.cut),
    piercing: r2(pierces * rate.pierce),
    bending: r2(bends * mockSettings.bendRate),
    coating: r2(powderCoat ? areaM2 * 2 * mockSettings.powderCoatPerSqm : 0),
  }
  const perPart = r2(Object.values(breakdown).reduce((a, b) => a + b, 0))
  const subtotal = r2(perPart * quantity)
  const gst = r2((subtotal * mockSettings.gstPercent) / 100)
  return {
    materialCode, thicknessMm, quantity, breakdown, perPart, subtotal, gst,
    total: r2(subtotal + gst), currency: 'INR', isSample: true,
  }
}
