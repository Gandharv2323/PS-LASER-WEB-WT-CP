// JWT auth: verifies tokens issued by the Spring Boot API (HS256, shared secret,
// claims sub/email/role/exp - services/CONTRACT.md -> Auth).
// 401 = no/invalid/expired token, 403 = valid token but role not allowed.
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { HttpError } from '../utils/http-error.js';

export function authenticate(req, res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Missing bearer token'));
  }
  try {
    // Pin the algorithm: never let the token header choose it (alg=none attacks).
    const claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (!claims.sub || !claims.role) throw new Error('missing claims');
    req.user = { sub: String(claims.sub), email: claims.email, role: claims.role };
    return next();
  } catch (err) {
    const message = err?.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new HttpError(401, message));
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new HttpError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, `Requires role: ${roles.join(' or ')}`));
  }
  return next();
};

/** authenticate + role check as one middleware array for staff/admin routes. */
export const staffOnly = [authenticate, requireRole('admin', 'staff')];
