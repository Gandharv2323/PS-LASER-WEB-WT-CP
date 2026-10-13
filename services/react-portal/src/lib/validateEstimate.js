// Estimate form validation (pure function, same rules as services/CONTRACT.md step 1).
export const NUMERIC = ['thicknessMm', 'lengthMm', 'widthMm', 'cutLengthMm', 'pierces', 'bends', 'quantity']

/** Pure validation function (same rules as services/CONTRACT.md step 1). */
export function validateEstimate(values, materials) {
  const errors = {}
  const n = (k) => Number(values[k])
  const material = materials.find((m) => m.code === values.materialCode)
  if (!material) errors.materialCode = 'Choose a material.'
  for (const k of NUMERIC) {
    if (values[k] === '' || Number.isNaN(n(k))) errors[k] = 'Enter a number.'
  }
  if (!errors.thicknessMm && (n('thicknessMm') <= 0 || (material && n('thicknessMm') > material.maxThicknessMm)))
    errors.thicknessMm = `Thickness must be above 0 and at most ${material?.maxThicknessMm ?? '?'} mm for ${material?.name ?? 'this material'}.`
  if (!errors.lengthMm && (n('lengthMm') <= 0 || n('lengthMm') > 3000)) errors.lengthMm = 'Length must be 1–3000 mm (laser bed 3 m).'
  if (!errors.widthMm && (n('widthMm') <= 0 || n('widthMm') > 1500)) errors.widthMm = 'Width must be 1–1500 mm (laser bed 1.5 m).'
  if (!errors.cutLengthMm && n('cutLengthMm') < 0) errors.cutLengthMm = 'Cut length cannot be negative.'
  if (!errors.pierces && (n('pierces') < 0 || !Number.isInteger(n('pierces')))) errors.pierces = 'Whole number, 0 or more.'
  if (!errors.bends && (n('bends') < 0 || !Number.isInteger(n('bends')))) errors.bends = 'Whole number, 0 or more.'
  if (!errors.quantity && (n('quantity') < 1 || !Number.isInteger(n('quantity')))) errors.quantity = 'Quantity must be at least 1.'
  return errors
}
