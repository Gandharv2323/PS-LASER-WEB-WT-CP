// A small Error subclass carrying an HTTP status (+ optional per-field messages).
export class HttpError extends Error {
  constructor(status, message, fieldErrors) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}
