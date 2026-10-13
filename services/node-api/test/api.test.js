// Integration tests: node:test runner + supertest against the real MySQL `pslaser` DB.
// Every row/file created here is deleted in after().
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// Separate log files for tests; must be set before the config module loads.
process.env.NODE_ENV = 'test';
process.env.REQUEST_LOG_FILE = 'requests-test.log';
process.env.EVENT_LOG_FILE = 'events-test.log';

const { createApp } = await import('../src/app.js');
const { config, ROOT_DIR } = await import('../src/config/index.js');
const { pool, closePool } = await import('../src/db/pool.js');
const { closeLogs } = await import('../src/utils/file-logger.js');
const { enquiryRateLimiter } = await import('../src/middleware/rate-limit.js');

const noLimit = (req, res, next) => next();
const app = createApp({ rateLimiter: noLimit });

const mint = (claims, options = {}) =>
  jwt.sign({ sub: '1', email: 'admin@pslaser.local', role: 'admin', ...claims }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '8h',
    ...options,
  });
const adminToken = mint({});
const staffToken = mint({ sub: '2', role: 'staff', email: 'staff@pslaser.local' });
const customerToken = mint({ sub: '3', role: 'customer', email: 'customer@example.com' });

const createdIds = [];
const DXF = Buffer.from('0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n');
const validEnquiry = {
  name: 'Test Customer (node:test)',
  phone: '+91 98765 43210',
  email: 'test@example.com',
  serviceSlug: 'laser-cutting',
  message: 'Automated test enquiry - safe to delete',
};

const uploadsBefore = async () => (await fs.readdir(config.paths.uploads)).filter((f) => f !== '.gitkeep');

after(async () => {
  if (createdIds.length) {
    const [uploads] = await pool.query('SELECT stored_path FROM uploads WHERE enquiry_id IN (?)', [createdIds]);
    for (const u of uploads) await fs.rm(path.resolve(ROOT_DIR, u.stored_path), { force: true });
    await pool.query('DELETE FROM uploads WHERE enquiry_id IN (?)', [createdIds]);
    await pool.query('DELETE FROM enquiries WHERE id IN (?)', [createdIds]);
  }
  await closePool();
  await closeLogs();
  await fs.rm(path.join(config.paths.logs, 'requests-test.log'), { force: true });
  await fs.rm(path.join(config.paths.logs, 'events-test.log'), { force: true });
});

describe('health + static', () => {
  test('GET /api/health -> 200 {ok:true, db:true}', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.db, true);
    assert.ok(res.headers['x-request-id']);
  });

  test('GET / serves the static API docs page', async () => {
    const res = await request(app).get('/').expect(200);
    assert.match(res.headers['content-type'], /text\/html/);
    assert.match(res.text, /PS Laser Enquiry API/);
  });

  test('unknown route -> JSON 404', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    assert.equal(res.body.status, 404);
    assert.equal(res.body.error, 'Not Found');
  });

  test('uploads folder is not publicly served', async () => {
    await request(app).get('/storage/uploads/.gitkeep').expect(404);
  });
});

describe('CORS', () => {
  test('allowed origin gets Access-Control-Allow-Origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173').expect(200);
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  });

  test('unknown origin gets no CORS header', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://evil.example').expect(200);
    assert.equal(res.headers['access-control-allow-origin'], undefined);
  });

  test('preflight for PATCH with Authorization is allowed', async () => {
    const res = await request(app)
      .options('/api/enquiries/1')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
      .expect(204);
    assert.match(res.headers['access-control-allow-methods'], /PATCH/);
  });
});

describe('POST /api/enquiries', () => {
  test('missing fields -> 400 with fieldErrors', async () => {
    const res = await request(app).post('/api/enquiries').send({ name: 'A', email: 'not-an-email' }).expect(400);
    assert.equal(res.body.message, 'Validation failed');
    for (const field of ['name', 'phone', 'message', 'email']) assert.ok(res.body.fieldErrors[field], field);
  });

  test('bad source -> 400', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...validEnquiry, source: 'hacker' }).expect(400);
    assert.ok(res.body.fieldErrors.source);
  });

  test('malformed JSON -> 400', async () => {
    await request(app).post('/api/enquiries').set('Content-Type', 'application/json').send('{"name":').expect(400);
  });

  test('valid JSON -> 201 {id, whatsappUrl}, source defaults to node', async () => {
    const res = await request(app).post('/api/enquiries').send(validEnquiry).expect(201);
    assert.equal(typeof res.body.id, 'number');
    createdIds.push(res.body.id);
    assert.ok(res.body.whatsappUrl.startsWith('https://wa.me/917719976990?text='));
    assert.match(decodeURIComponent(res.body.whatsappUrl), new RegExp(`#${res.body.id}`));
    const [[row]] = await pool.execute('SELECT source, status FROM enquiries WHERE id = ?', [res.body.id]);
    assert.deepEqual(row, { source: 'node', status: 'new' });
  });

  test('allowed body.source is stored', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...validEnquiry, source: 'react' }).expect(201);
    createdIds.push(res.body.id);
    const [[row]] = await pool.execute('SELECT source FROM enquiries WHERE id = ?', [res.body.id]);
    assert.equal(row.source, 'react');
  });

  test('multipart with .dxf drawing -> 201 + uploads row + private file', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .field('name', validEnquiry.name)
      .field('phone', validEnquiry.phone)
      .field('email', '')
      .field('message', 'Multipart test with DXF drawing')
      .attach('drawing', DXF, { filename: 'bracket.dxf', contentType: 'application/octet-stream' })
      .expect(201);
    createdIds.push(res.body.id);
    const [[up]] = await pool.execute('SELECT * FROM uploads WHERE enquiry_id = ?', [res.body.id]);
    assert.equal(up.original_name, 'bracket.dxf');
    assert.equal(up.size_bytes, DXF.length);
    assert.match(up.stored_path, /^storage\/uploads\/\d{8}-[0-9a-f]{32}\.dxf$/);
    const stored = await fs.readFile(path.resolve(ROOT_DIR, up.stored_path));
    assert.ok(stored.equals(DXF));
    // Random file name is not reachable via static serving.
    await request(app).get(`/${up.stored_path}`).expect(404);
  });

  test('.exe upload -> 400 and nothing stored', async () => {
    const before = await uploadsBefore();
    const res = await request(app)
      .post('/api/enquiries')
      .field('name', validEnquiry.name)
      .field('phone', validEnquiry.phone)
      .field('message', 'Should be rejected')
      .attach('drawing', Buffer.from('MZ fake exe'), { filename: 'virus.exe', contentType: 'application/x-msdownload' })
      .expect(400);
    assert.ok(res.body.fieldErrors.drawing);
    assert.deepEqual(await uploadsBefore(), before);
  });

  test('.png whose bytes are not a PNG -> 400 and file removed', async () => {
    const before = await uploadsBefore();
    await request(app)
      .post('/api/enquiries')
      .field('name', validEnquiry.name)
      .field('phone', validEnquiry.phone)
      .field('message', 'Fake png content')
      .attach('drawing', Buffer.from('not really a png'), { filename: 'part.png', contentType: 'image/png' })
      .expect(400);
    assert.deepEqual(await uploadsBefore(), before);
  });

  test('valid drawing but invalid fields -> 400 and file removed', async () => {
    const before = await uploadsBefore();
    await request(app)
      .post('/api/enquiries')
      .field('name', 'X')
      .attach('drawing', DXF, { filename: 'part.dxf', contentType: 'application/dxf' })
      .expect(400);
    assert.deepEqual(await uploadsBefore(), before);
  });

  test('rate limiter answers 429 after the limit', async () => {
    const limited = createApp({ rateLimiter: enquiryRateLimiter({ limit: 1 }) });
    await request(limited).post('/api/enquiries').send({}).expect(400);
    const res = await request(limited).post('/api/enquiries').send({}).expect(429);
    assert.equal(res.body.status, 429);
  });
});

describe('staff routes (JWT)', () => {
  test('GET /api/enquiries without token -> 401', async () => {
    const res = await request(app).get('/api/enquiries').expect(401);
    assert.equal(res.body.message, 'Missing bearer token');
  });

  test('token signed with another secret -> 401', async () => {
    const forged = jwt.sign({ sub: '1', role: 'admin' }, 'some-other-secret-that-is-long-enough-123', { algorithm: 'HS256' });
    await request(app).get('/api/enquiries').set('Authorization', `Bearer ${forged}`).expect(401);
  });

  test('expired token -> 401 "Token expired"', async () => {
    const expired = mint({}, { expiresIn: -10 });
    const res = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${expired}`).expect(401);
    assert.equal(res.body.message, 'Token expired');
  });

  test('customer role -> 403', async () => {
    await request(app).get('/api/enquiries').set('Authorization', `Bearer ${customerToken}`).expect(403);
  });

  test('admin -> 200 paginated list incl. drawings', async () => {
    const res = await request(app)
      .get('/api/enquiries?page=1&pageSize=50&status=new')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageSize, 50);
    assert.ok(res.body.total >= createdIds.length);
    assert.ok(res.body.items.every((e) => e.status === 'new'));
    const withDrawing = res.body.items.find((e) => e.drawings?.length);
    assert.ok(withDrawing, 'an enquiry with a drawing is listed');
    assert.equal(withDrawing.drawings[0].stored_path, undefined); // never leak disk paths
  });

  test('bad query -> 400', async () => {
    await request(app).get('/api/enquiries?status=archived').set('Authorization', `Bearer ${staffToken}`).expect(400);
  });

  test('PATCH status as staff -> 200 updated', async () => {
    const id = createdIds[0];
    const res = await request(app)
      .patch(`/api/enquiries/${id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'contacted' })
      .expect(200);
    assert.equal(res.body.id, id);
    assert.equal(res.body.status, 'contacted');
  });

  test('PATCH invalid status -> 400, unknown id -> 404, no token -> 401', async () => {
    await request(app).patch(`/api/enquiries/${createdIds[0]}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'done' }).expect(400);
    await request(app).patch('/api/enquiries/999999999').set('Authorization', `Bearer ${adminToken}`).send({ status: 'won' }).expect(404);
    await request(app).patch(`/api/enquiries/${createdIds[0]}`).send({ status: 'won' }).expect(401);
  });

  test('drawing download streams the private file to staff', async () => {
    const id = createdIds[2]; // the multipart enquiry
    const res = await request(app).get(`/api/enquiries/${id}/drawing`).set('Authorization', `Bearer ${staffToken}`).buffer(true).parse((r, cb) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    }).expect(200);
    assert.match(res.headers['content-disposition'], /bracket\.dxf/);
    assert.ok(res.body.equals(DXF));
  });

  test('request log tail is admin-only and streamed', async () => {
    await request(app).get('/api/logs/requests').set('Authorization', `Bearer ${staffToken}`).expect(403);
    const res = await request(app).get('/api/logs/requests?bytes=4096').set('Authorization', `Bearer ${adminToken}`).expect(200);
    assert.match(res.headers['content-type'], /text\/plain/);
    assert.match(res.text, /"url":"\/api\/logs\/requests","status":403/);
  });
});

describe('GET /api/catalogue', () => {
  test('returns machines + services, second call is a cache HIT', async () => {
    const first = await request(app).get('/api/catalogue').expect(200);
    assert.ok(first.body.machines.length > 0);
    assert.ok(first.body.services.length > 0);
    assert.ok(Array.isArray(first.body.machines[0].specs));
    const second = await request(app).get('/api/catalogue').expect(200);
    assert.equal(second.headers['x-cache'], 'HIT');
  });
});
