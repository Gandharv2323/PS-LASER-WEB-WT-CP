// Builds the WhatsApp-first follow-up link (services/CONTRACT.md -> WhatsApp).
import { config } from '../config/index.js';

export function buildWhatsappUrl(enquiry) {
  const lines = [
    `Hello PS Laser, I have sent enquiry #${enquiry.id}.`,
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
  ];
  if (enquiry.serviceSlug) lines.push(`Service: ${enquiry.serviceSlug}`);
  if (enquiry.machineSlug) lines.push(`Machine: ${enquiry.machineSlug}`);
  if (enquiry.drawing) lines.push(`Drawing uploaded: ${enquiry.drawing.originalName}`);
  const msg = enquiry.message.length > 500 ? `${enquiry.message.slice(0, 497)}...` : enquiry.message;
  lines.push(`Requirement: ${msg}`);
  // URL + URLSearchParams would encode spaces as "+"; wa.me expects %20, so use encodeURIComponent.
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}
