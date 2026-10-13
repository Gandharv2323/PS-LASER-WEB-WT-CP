// events built-in: an application-wide EventEmitter.
// POST /api/enquiries emits 'enquiry:created'; independent listeners react to it
// without the route knowing about them (observer pattern).
import { EventEmitter } from 'node:events';
import { buildWhatsappUrl } from '../utils/whatsapp.js';
import { logEvent } from '../utils/file-logger.js';

export const ENQUIRY_CREATED = 'enquiry:created';

export const enquiryEvents = new EventEmitter();

// Listener 1: WhatsApp-link builder. emit() calls listeners synchronously, in
// registration order, so the URL is on the payload before emit() returns.
enquiryEvents.on(ENQUIRY_CREATED, (enquiry) => {
  enquiry.whatsappUrl = buildWhatsappUrl(enquiry);
});

// Listener 2: audit logger (no phone/e-mail in the log - only what ops needs).
enquiryEvents.on(ENQUIRY_CREATED, (enquiry) => {
  logEvent({
    event: ENQUIRY_CREATED,
    enquiryId: enquiry.id,
    source: enquiry.source,
    serviceSlug: enquiry.serviceSlug ?? null,
    hasDrawing: Boolean(enquiry.drawing),
    requestId: enquiry.requestId,
  });
});

// A failing listener must never crash the process.
enquiryEvents.on('error', (err) => console.error('[events]', err));
