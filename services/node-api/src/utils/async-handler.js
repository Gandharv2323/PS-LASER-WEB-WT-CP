// Wraps an async route handler so a rejected promise is passed to next(err)
// and reaches the centralized error handler. (Express 5 also does this by
// itself; the wrapper keeps the pattern explicit and Express-4 compatible.)
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
