// Compact architecture figure for the two-column IEEE paper (readable at 7 in width).
import fs from 'node:fs';
const W = 1200, H = 700, ORANGE = '#EF7D00', INK = '#1d1d1b', GREY = '#5b6168', SQL = '#0b5285';
const o = []; const add = (s) => o.push(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, { size = 16, weight = 400, fill = INK, anchor = 'start', italic = false } = {}) =>
  add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`);
function box(x, y, w, h, { title, port, lines = [], strip = ORANGE, dashed = false }) {
  add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#fff" stroke="${INK}" stroke-width="1.6"${dashed ? ' stroke-dasharray="7 5"' : ''}/>`);
  add(`<path d="M${x},${y + 32} V${y + 7} a7,7 0 0 1 7,-7 H${x + w - 7} a7,7 0 0 1 7,7 V${y + 32} Z" fill="${strip}"/>`);
  text(x + 10, y + 22, title, { size: 17, weight: 700, fill: '#fff' });
  if (port) text(x + w - 10, y + 22, port, { size: 16, weight: 700, fill: '#fff', anchor: 'end' });
  lines.forEach((l, i) => text(x + 10, y + 53 + i * 20, l, { size: 15 }));
}
const arrow = (d, { dashed = false, color = INK } = {}) =>
  add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="2"${dashed ? ' stroke-dasharray="6 5"' : ''} marker-end="url(#${color === SQL ? 'ahs' : 'ah'})"/>`);
function label(x, y, s, { anchor = 'middle', size = 14 } = {}) {
  const w = s.length * size * 0.53 + 10;
  const rx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x - 4 : x - w + 4;
  add(`<rect x="${rx}" y="${y - size - 1}" width="${w}" height="${size + 7}" rx="3" fill="#fff" fill-opacity="0.95"/>`);
  text(x, y, s, { size, anchor, weight: 600, fill: '#222' });
}
add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, Helvetica, sans-serif">`);
add(`<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker><marker id="ahs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${SQL}"/></marker></defs>`);
add(`<rect width="${W}" height="${H}" fill="#fff"/>`);
[[8, 92, 'CLIENT'], [112, 168, 'PRESENTATION'], [292, 150, 'API'], [452, 100, 'DATA'], [564, 130, 'SHOP']].forEach(([y, h, t], i) => {
  add(`<rect x="6" y="${y}" width="${W - 12}" height="${h}" rx="8" fill="${i % 2 ? '#f6f7f8' : '#fbf3e9'}" stroke="#d6d9dc"/>`);
  text(16, t === 'CLIENT' ? y + h - 6 : y + 13, t, { size: 12, weight: 700, fill: GREY });
});
// actors
[[24, 'Customer (browser)'], [264, 'PS Laser staff / owner']].forEach(([x, t]) => {
  add(`<rect x="${x}" y="22" width="210" height="44" rx="7" fill="#3d4650"/>`);
  text(x + 105, 50, t, { size: 16, weight: 700, fill: '#fff', anchor: 'middle' });
});
add(`<rect x="900" y="22" width="280" height="44" rx="7" fill="#e9f5ee" stroke="#2e8b57" stroke-width="1.6" stroke-dasharray="6 4"/>`);
text(1040, 50, 'WhatsApp (external, wa.me)', { size: 16, weight: 700, fill: '#1d6b42', anchor: 'middle' });
add(`<path d="M129,66 V100 M369,66 V100 M125,100 H1060" stroke="${INK}" stroke-width="2" fill="none"/>`);
label(700, 95, 'HTTP(S) from the browser', { size: 13 });

const PY = 138, PH = 124;
[125, 345, 565, 815, 1065].forEach((cx) => arrow(`M${cx},100 V${PY}`));
box(20, PY, 210, PH, { title: 'PHP estimator', port: ':8000', lines: ['PHP 8.2 · PDO', 'estimate · upload', 'enquiry form'] });
box(240, PY, 210, PH, { title: 'Laravel admin', port: ':8001', lines: ['Laravel 12 · Eloquent', 'rates · work orders', 'enquiries · machines'] });
box(460, PY, 210, PH, { title: 'Servlet / JSP', port: ':8080', lines: ['Tomcat 8.5 · JDBC', 'order tracking', 'staff status desk'] });
box(690, PY, 250, PH, { title: 'Next.js website', port: ':3001', lines: ['React 19 · TypeScript', '8 pages · /quote /track', '/dashboard · BFF routes'] });
box(950, PY, 230, PH, { title: 'React portal', port: ':5173', lines: ['Vite · Redux Toolkit', 'catalogue · quote cart', 'login · tracking'] });

// API tier
const AY = 312, AH = 112;
box(500, AY, 160, AH, { title: 'File storage', strip: '#6b7480', lines: ['drawings (private)', 'request/event logs'] });
box(690, AY, 250, AH, { title: 'Node / Express', port: ':4000', lines: ['Express 5 · zod · multer', 'enquiry + drawing upload', 'JWT for admin/staff'] });
box(950, AY, 230, AH, { title: 'Spring Boot', port: ':8081', lines: ['Spring Boot 3.5 · JPA', 'JWT · estimate · tracking', 'events · STOMP push'] });
arrow('M780,262 V312'); arrow('M850,262 L1000,312'); arrow('M1030,262 L880,312'); arrow('M1140,262 V312');
label(778, 292, 'enquiry', { anchor: 'end', size: 13 });
label(925, 284, 'REST+JWT', { size: 13 });
label(1138, 292, 'REST+JWT', { anchor: 'end', size: 13 });
arrow('M690,368 H660');

// data tier
box(20, 468, 920, 80, { title: 'MySQL / MariaDB 10.4 - database "pslaser" (one shared schema)', port: ':3306', strip: SQL, lines: ['users · machines · services · materials · rates (SAMPLE) · settings · enquiries · uploads · quotes · work_orders · work_order_events'] });
box(960, 468, 220, 80, { title: 'MongoDB', port: ':27017', strip: '#4f7f3a', lines: ['activity_log (audit events)'] });
arrow('M795,424 V468'); label(799, 452, 'mysql2', { anchor: 'start', size: 13 });
arrow('M965,424 L915,468'); label(850, 446, 'JDBC', { anchor: 'start', size: 13 });
arrow('M1065,424 V468'); label(1069, 452, 'events', { anchor: 'start', size: 13 });
[125, 345, 480].forEach((x) => arrow(`M${x},262 V468`, { color: SQL }));
label(125, 380, 'PDO', { size: 13 }); label(345, 380, 'Eloquent', { size: 13 }); label(480, 400, 'JDBC', { size: 13 });
text(145, 330, 'direct SQL (blue):', { size: 13, fill: SQL, weight: 700 });
text(145, 348, 'no API hop', { size: 13, fill: SQL, weight: 700 });

// WhatsApp deep link
arrow('M1180,200 H1190 V66', { dashed: true, color: '#2e8b57' });

// shop
box(20, 590, 1160, 96, { title: 'PS Laser shop, Velu, Bhor (physical; NOT connected to the software)', strip: '#8a8f94', dashed: true, lines: ['Fiber lasers 3 kW + 1.5 kW · press brake 175 T · turret punches 32 T / 16 T · laser welder · powder-coat plant', 'Staff read estimates/enquiries and update work-order status manually in the admin screens.'] });
add('</svg>');
fs.writeFileSync(new URL('./fig-architecture-compact.svg', import.meta.url), o.join('\n'));
