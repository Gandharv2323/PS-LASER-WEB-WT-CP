// Unit tests for pure helpers (no DB, no HTTP).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';
import { buildWhatsappUrl } from '../src/utils/whatsapp.js';
import { randomFileName } from '../src/utils/ids.js';
import { createEnquirySchema } from '../src/schemas/enquiry-schemas.js';

const require = createRequire(import.meta.url);
const rules = require('../src/config/file-rules.cjs');

test('CommonJS file rules via createRequire', () => {
  assert.equal(rules.isAllowedDrawing('Part.DXF', 'application/octet-stream'), true);
  assert.equal(rules.isAllowedDrawing('a.pdf', 'application/pdf'), true);
  assert.equal(rules.isAllowedDrawing('a.pdf', 'text/html'), false);
  assert.equal(rules.isAllowedDrawing('setup.exe', 'application/octet-stream'), false);
  assert.equal(rules.isAllowedDrawing('a.dxf.exe', 'application/octet-stream'), false);
});

test('WhatsApp link is wa.me + encoded text', () => {
  const url = buildWhatsappUrl({ id: 7, name: 'Asha', phone: '98765', message: 'MS 3 mm & SS', serviceSlug: 'laser-cutting' });
  assert.ok(url.startsWith('https://wa.me/917719976990?text='));
  const text = decodeURIComponent(url.split('text=')[1]);
  assert.match(text, /#7/);
  assert.match(text, /MS 3 mm & SS/);
});

test('random file names keep only the whitelisted extension', () => {
  const a = randomFileName('.dxf');
  assert.match(a, /^\d{8}-[0-9a-f]{32}\.dxf$/);
  assert.notEqual(a, randomFileName('.dxf'));
});

test('schema trims input and treats blank email as absent', () => {
  const parsed = createEnquirySchema.parse({ name: '  Ravi ', phone: '9876543210', email: '', message: 'hello there' });
  assert.equal(parsed.name, 'Ravi');
  assert.equal(parsed.email, undefined);
});

test('EventEmitter listeners run synchronously in order', () => {
  const bus = new EventEmitter();
  const order = [];
  bus.on('x', () => order.push(1));
  bus.on('x', () => order.push(2));
  bus.emit('x');
  order.push(3);
  assert.deepEqual(order, [1, 2, 3]);
});
