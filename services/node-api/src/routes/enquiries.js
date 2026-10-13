// /api/enquiries - public create (JSON or multipart drawing) + staff list/update.
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpError } from '../utils/http-error.js';
import { validate } from '../middleware/validate.js';
import { staffOnly } from '../middleware/auth.js';
import { drawingUpload, verifyMagicBytes } from '../middleware/upload.js';
import { createEnquirySchema, listEnquiriesQuery, idParam, updateStatusSchema } from '../schemas/enquiry-schemas.js';
import { createEnquiry, listEnquiries, updateEnquiryStatus, getDrawingFile } from '../services/enquiry-service.js';
import { enquiryEvents, ENQUIRY_CREATED } from '../events/enquiry-events.js';

/** Router factory so the app (and tests) can inject the rate limiter. */
export function enquiriesRouter({ rateLimiter }) {
  const router = Router();

  // POST /api/enquiries  - middleware chain runs left to right:
  // rate limit -> multer (only acts on multipart) -> magic-byte check -> zod -> handler
  router.post(
    '/',
    rateLimiter,
    drawingUpload,
    asyncHandler(verifyMagicBytes),
    validate(createEnquirySchema),
    asyncHandler(async (req, res) => {
      const data = { ...req.valid.body, source: req.valid.body.source ?? 'node' };
      const { id, drawing } = await createEnquiry(data, req.file);

      // Fire the domain event; listeners add whatsappUrl + write the audit log.
      const payload = { id, ...data, drawing, requestId: req.id };
      enquiryEvents.emit(ENQUIRY_CREATED, payload);

      res.status(201).location(`/api/enquiries/${id}`).json({ id, whatsappUrl: payload.whatsappUrl });
    }),
  );

  // GET /api/enquiries?page=1&pageSize=20&status=new  (admin/staff)
  router.get(
    '/',
    staffOnly,
    validate(listEnquiriesQuery, 'query'),
    asyncHandler(async (req, res) => {
      res.json(await listEnquiries(req.valid.query));
    }),
  );

  // PATCH /api/enquiries/:id  {status}  (admin/staff)
  router.patch(
    '/:id',
    staffOnly,
    validate(idParam, 'params'),
    validate(updateStatusSchema),
    asyncHandler(async (req, res) => {
      const updated = await updateEnquiryStatus(req.valid.params.id, req.valid.body.status);
      if (!updated) throw new HttpError(404, `Enquiry ${req.valid.params.id} not found`);
      res.json(updated);
    }),
  );

  // GET /api/enquiries/:id/drawing  (admin/staff) - streams the private upload.
  router.get(
    '/:id/drawing',
    staffOnly,
    validate(idParam, 'params'),
    asyncHandler(async (req, res) => {
      const file = await getDrawingFile(req.valid.params.id);
      if (!file) throw new HttpError(404, 'No drawing for this enquiry');
      await fs.promises.access(file.absPath).catch(() => {
        throw new HttpError(404, 'Drawing file missing on disk');
      });
      res.attachment(file.original_name);
      res.type(file.mime || 'application/octet-stream');
      res.set('Content-Length', String(file.size_bytes));
      // Readable stream -> HTTP response; pipeline handles back-pressure + cleanup.
      await pipeline(fs.createReadStream(file.absPath), res);
    }),
  );

  return router;
}
