// crypto built-in: unguessable ids for requests and stored upload file names.
import crypto from 'node:crypto';

export const newRequestId = () => crypto.randomUUID();

/** e.g. "20261013-9f2c4e1ab37d5c08e6f1a2b3c4d5e6f7.dxf" - never derived from user input except the whitelisted ext. */
export function randomFileName(ext) {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `${day}-${crypto.randomBytes(16).toString('hex')}${ext}`;
}
