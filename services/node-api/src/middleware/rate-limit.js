// Rate limit for the public enquiry form (spam / abuse protection).
import { rateLimit } from 'express-rate-limit';
import { config } from '../config/index.js';

export function enquiryRateLimiter(options = {}) {
  return rateLimit({
    windowMs: config.enquiryRateLimit.windowMs,
    limit: config.enquiryRateLimit.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many enquiries from this network. Please message us on WhatsApp instead.',
        requestId: req.id,
      });
    },
    ...options,
  });
}
