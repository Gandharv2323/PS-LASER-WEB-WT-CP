import { inr } from './config.js'

/** Compose one WhatsApp message listing every cart line. */
export function composeCartMessage(items, total) {
  const lines = items.map((i, n) => {
    const price = i.estimate ? ` — est. ${inr(i.estimate.total)}` : ''
    const qty = i.kind === 'estimate' ? '' : ` x${i.qty}`
    return `${n + 1}. ${i.title}${qty} (${i.detail})${price}`
  })
  return [
    'Hi PS Laser, please quote the following from my portal quote cart:',
    ...lines,
    total > 0 ? `Indicative estimates total: ${inr(total)} (please confirm final price).` : '',
    'I can share the DXF/drawing.',
  ]
    .filter(Boolean)
    .join('\n')
}
