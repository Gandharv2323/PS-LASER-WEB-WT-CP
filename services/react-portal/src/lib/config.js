// Central configuration for the PS Laser Customer Portal.
// API hosts come from Vite env vars (see .env.example); defaults match services/CONTRACT.md.
// 127.0.0.1 instead of "localhost": on Windows a refused "localhost" connection first tries
// IPv6 and takes ~2.3 s to fail, which made the offline fallback feel slow. 127.0.0.1 fails
// instantly. (CORS is unaffected: it checks the portal's origin, http://localhost:5173.)

export const SPRING_URL = import.meta.env.VITE_SPRING_URL ?? 'http://127.0.0.1:8081'
export const NODE_URL = import.meta.env.VITE_NODE_URL ?? 'http://127.0.0.1:4000'

export const WHATSAPP_NUMBER = '917719976990'
export const WHATSAPP_DISPLAY = '+91 77199 76990'

/** wa.me deep link with a pre-filled, URL-encoded message. */
export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const company = {
  brand: 'PS Laser',
  tagline: 'Manufacturer of Precision Engineering & Sheet Metal Components',
  location: 'Velu (Khed Shivapur), Pune',
  address: 'Gat No. 753, At Post – Velu, Tal. Bhor, Dist. Pune – 412205, Maharashtra, India',
  email: 'pslaser24@gmail.com',
  logo: '/img/ps-laser-logo.png',
}

export const ESTIMATE_NOTE = 'Indicative estimate — final quote on WhatsApp'

/** Indian rupee formatting used everywhere a price is shown. */
export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n) || 0)
