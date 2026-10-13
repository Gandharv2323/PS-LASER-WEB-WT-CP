// Database connectivity: a mysql2/promise connection pool shared by the app.
// All queries use placeholders (?) so values are never concatenated into SQL.
import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: false,
  timezone: 'Z',
});

// TIMESTAMP columns are converted using the *session* time zone. Pin every new
// connection to UTC so values match `timezone: 'Z'` above (the XAMPP server runs
// in IST, which would otherwise shift createdAt by +05:30).
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/** Cheap connectivity check used by GET /api/health. */
export async function pingDb() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      return true;
    } finally {
      conn.release();
    }
  } catch {
    return false;
  }
}

/**
 * Runs `work(conn)` inside a transaction: COMMIT on success, ROLLBACK on any error.
 * The callback must use the passed connection (not the pool) so every statement
 * runs on the same connection / transaction.
 */
export async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export const closePool = () => pool.end();
