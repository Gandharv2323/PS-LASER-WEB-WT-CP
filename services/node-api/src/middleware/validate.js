// Validation middleware factory using zod schemas. Parsed (coerced, trimmed)
// values are stored on req.valid; failures become 400 with fieldErrors.
import { HttpError } from '../utils/http-error.js';

export function toFieldErrors(zodError) {
  const fieldErrors = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || '_';
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

export const validate = (schema, where = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[where] ?? {});
  if (!result.success) {
    return next(new HttpError(400, 'Validation failed', toFieldErrors(result.error)));
  }
  // Express 5 makes req.query a read-only getter, so parsed values live on req.valid.
  req.valid = { ...req.valid, [where]: result.data };
  return next();
};
