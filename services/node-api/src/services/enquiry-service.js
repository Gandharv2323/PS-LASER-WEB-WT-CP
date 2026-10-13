// Enquiry data access (MySQL via mysql2/promise). Every value goes through a
// placeholder (execute = server-side prepared statement).
import path from 'node:path';
import { pool, withTransaction } from '../db/pool.js';
import { ROOT_DIR } from '../config/index.js';

const toEnquiry = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  serviceSlug: row.service_slug,
  machineSlug: row.machine_slug,
  message: row.message,
  source: row.source,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Inserts the enquiry and (optionally) its drawing row in ONE transaction:
 * either both rows exist or neither does.
 */
export async function createEnquiry(data, file) {
  return withTransaction(async (conn) => {
    const [result] = await conn.execute(
      `INSERT INTO enquiries (name, phone, email, service_slug, machine_slug, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.phone, data.email ?? null, data.serviceSlug ?? null, data.machineSlug ?? null, data.message, data.source],
    );
    const enquiryId = result.insertId;
    let drawing = null;
    if (file) {
      // Store a project-relative POSIX path, e.g. storage/uploads/20261013-ab12....dxf
      const storedPath = path.relative(ROOT_DIR, file.path).split(path.sep).join('/');
      const [up] = await conn.execute(
        `INSERT INTO uploads (enquiry_id, original_name, stored_path, mime, size_bytes) VALUES (?, ?, ?, ?, ?)`,
        [enquiryId, file.originalname.slice(0, 255), storedPath, file.mimetype, file.size],
      );
      drawing = { id: up.insertId, originalName: file.originalname, sizeBytes: file.size, mime: file.mimetype };
    }
    return { id: enquiryId, drawing };
  });
}

export async function listEnquiries({ page, pageSize, status }) {
  const where = status ? 'WHERE status = ?' : '';
  const params = status ? [status] : [];
  const offset = (page - 1) * pageSize;

  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM enquiries ${where}`, params);
  // LIMIT/OFFSET are validated integers (zod) and inlined: MySQL 8 rejects them as
  // prepared-statement parameters of the wrong type, so this is the portable form.
  const [rows] = await pool.execute(
    `SELECT * FROM enquiries ${where} ORDER BY created_at DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}`,
    params,
  );
  const items = rows.map(toEnquiry);

  if (items.length) {
    const ids = items.map((e) => e.id);
    const [uploads] = await pool.query(
      'SELECT id, enquiry_id, original_name, mime, size_bytes, created_at FROM uploads WHERE enquiry_id IN (?)',
      [ids],
    );
    for (const item of items) {
      item.drawings = uploads
        .filter((u) => u.enquiry_id === item.id)
        .map((u) => ({ id: u.id, originalName: u.original_name, mime: u.mime, sizeBytes: u.size_bytes, createdAt: u.created_at }));
    }
  }

  return { items, page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) };
}

export async function getEnquiry(id) {
  const [rows] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [id]);
  return rows.length ? toEnquiry(rows[0]) : null;
}

export async function updateEnquiryStatus(id, status) {
  const [result] = await pool.execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
  if (result.affectedRows === 0) return null;
  return getEnquiry(id);
}

/** Latest drawing for an enquiry, with its absolute path on disk (staff download). */
export async function getDrawingFile(enquiryId) {
  const [rows] = await pool.execute(
    'SELECT original_name, stored_path, mime, size_bytes FROM uploads WHERE enquiry_id = ? ORDER BY id DESC LIMIT 1',
    [enquiryId],
  );
  if (!rows.length) return null;
  const absPath = path.resolve(ROOT_DIR, rows[0].stored_path);
  // Defence in depth: only ever read inside storage/uploads.
  if (!absPath.startsWith(path.resolve(ROOT_DIR, 'storage', 'uploads') + path.sep)) return null;
  return { ...rows[0], absPath };
}
