// Request validation schemas (zod). Shared by the routes and the tests.
import { z } from 'zod';

export const ENQUIRY_SOURCES = ['next', 'react', 'php', 'laravel', 'jsp', 'spring', 'node'];
export const ENQUIRY_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

// Multipart fields arrive as strings, and HTML forms send "" for empty inputs:
// treat blank strings as "not provided".
const blankToUndefined = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const optional = (schema) => z.preprocess(blankToUndefined, schema.optional());
const slug = z.string().trim().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase slug like "laser-cutting"');

export const createEnquirySchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z
    .string({ error: 'Phone is required' })
    .trim()
    .regex(/^\+?[0-9][0-9 -]{6,18}$/, 'Enter a valid phone number (digits, spaces, +, -)'),
  email: optional(z.string().trim().max(190).pipe(z.email('Enter a valid e-mail address'))),
  serviceSlug: optional(slug),
  machineSlug: optional(slug),
  message: z.string({ error: 'Message is required' }).trim().min(5, 'Message must be at least 5 characters').max(5000),
  source: optional(z.enum(ENQUIRY_SOURCES, `Source must be one of: ${ENQUIRY_SOURCES.join(', ')}`)),
});

export const listEnquiriesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: optional(z.enum(ENQUIRY_STATUSES, `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`)),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive('Enquiry id must be a positive integer'),
});

export const updateStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES, `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`),
});
