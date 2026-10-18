// Generates the PS Laser architecture diagram as SVG (fig-architecture.svg).
// Facts come from docs/handbook/WEBSITE_USER_HANDBOOK.md §2, §4, §10 and services/CONTRACT.md.
import fs from 'node:fs';

const W = 1900, H = 1260;
const ORANGE = '#EF7D00', INK = '#1d1d1b', GREY = '#5b6168';
const out = [];
const add = (s) => out.push(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function text(x, y, s, { size = 15, weight = 400, fill = INK, anchor = 'start', italic = false } = {}) {
  add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`);
}

function box(x, y, w, h, { title, port, lines = [], fill = '#fff', stroke = INK, strip = ORANGE, dashed = false, titleFill = '#fff' }) {
  add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.6"${dashed ? ' stroke-dasharray="7 5"' : ''}/>`);
  if (strip) {
    add(`<path d="M${x},${y + 36} V${y + 8} a8,8 0 0 1 8,-8 H${x + w - 8} a8,8 0 0 1 8,8 V${y + 36} Z" fill="${strip}"/>`);
    text(x + 12, y + 25, title, { size: 17, weight: 700, fill: titleFill });
    if (port) text(x + w - 12, y + 25, port, { size: 15, weight: 700, fill: titleFill, anchor: 'end' });
  } else {
    text(x + 12, y + 25, title, { size: 17, weight: 700 });
  }
  lines.forEach((l, i) => text(x + 12, y + 60 + i * 21, l, { size: 14.5, fill: '#2b2f33' }));
}

function arrow(d, { dashed = false, color = INK, both = false, width = 1.8 } = {}) {
  add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dashed ? ' stroke-dasharray="6 5"' : ''} marker-end="url(#ah)"${both ? ' marker-start="url(#ahs)"' : ''}/>`);
}
function label(x, y, s, { anchor = 'middle', size = 13 } = {}) {
  const w = s.length * (size * 0.52) + 10;
  const rx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x - 4 : x - w + 4;
  add(`<rect x="${rx}" y="${y - size - 1}" width="${w}" height="${size + 7}" rx="3" fill="#fff" fill-opacity="0.94"/>`);
  text(x, y, s, { size, anchor, fill: '#222', weight: 600 });
}

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, Helvetica, sans-serif">`);
add(`<defs>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>
<marker id="ahs" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M10,0 L0,5 L10,10 z" fill="${INK}"/></marker>
</defs>`);
add(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
text(W / 2, 38, 'PS Laser — System Architecture (as built and run locally, October 2026)', { size: 26, weight: 700, anchor: 'middle' });

// tier bands
const bands = [
  [60, 160, 'CLIENT'], [225, 215, 'PRESENTATION TIER (5 front ends)'], [470, 240, 'APPLICATION / API TIER'],
  [760, 140, 'DATA TIER'], [945, 200, 'PHYSICAL SHOP (context only)'],
];
bands.forEach(([y, h, t], i) => {
  add(`<rect x="14" y="${y}" width="${W - 28}" height="${h}" rx="10" fill="${i % 2 ? '#f6f7f8' : '#fbf3e9'}" stroke="#d6d9dc"/>`);
  text(W - 28, y + h - 8, t, { size: 13, weight: 700, fill: GREY, anchor: 'end' });
});

// actors
box(40, 90, 300, 78, { title: 'Customer', strip: '#3d4650', lines: ['Mobile / desktop browser'] });
box(380, 90, 300, 78, { title: 'PS Laser staff / owner', strip: '#3d4650', lines: ['Back-office screens, dashboard'] });
box(1530, 90, 330, 78, { title: 'WhatsApp (external)', strip: '#2e8b57', dashed: true, lines: ['+91 77199 76990 — wa.me deep link'] });

// browser bus
add(`<path d="M190,168 V205 M530,168 V205 M190,205 H1460" stroke="${INK}" stroke-width="1.8" fill="none"/>`);
label(900, 199, 'HTTP(S) from the browser — each front end is a separate origin (CORS allow-list)');
[165, 435, 600 + 105, 1080, 1460].forEach((cx) => arrow(`M${cx},205 V250`));

// presentation boxes (y 250-420)
const PY = 250, PH = 170;
box(40, PY, 250, PH, { title: 'PHP estimator', port: ':8000', lines: ['PHP 8.2, plain (no framework)', 'Estimate form, drawing upload,', 'enquiry · CSRF token · PDO'] });
box(310, PY, 250, PH, { title: 'Laravel admin', port: ':8001', lines: ['Laravel 12 (PHP ≥ 8.2), Eloquent', 'Enquiries, machines, services,', 'rate card, quotes, work orders'] });
box(580, PY, 250, PH, { title: 'Servlet / JSP desk', port: ':8080', lines: ['Tomcat 8.5, Java 21, JSTL', 'Order tracking + staff job-', 'status desk · sessions · JDBC'] });
box(900, PY, 360, PH, { title: 'Next.js 16 website', port: ':3001', lines: ['React 19 · TypeScript · Tailwind v4', '8 public pages, /quote, /track,', '/dashboard · Zustand · SSR/SSG', 'Route handlers: /api/estimate, /api/auth'] });
box(1280, PY, 360, PH, { title: 'React portal', port: ':5173', lines: ['Vite · React 19 · Redux Toolkit', 'React Router · catalogue, quote', 'cart, login, my quotes, tracking', 'Shows demo data if API is down'] });

// API tier (y 520-690)
const AY = 520, AH = 170;
box(650, AY, 190, AH, { title: 'File storage', strip: '#6b7480', lines: ['Private drawing', 'files (storage/)', 'Request + event', 'logs (file system)'] });
box(880, AY, 360, AH, { title: 'Node / Express API', port: ':4000', lines: ['Node 24 · Express 5 · zod · multer', 'helmet · rate limit (429) · CORS', 'POST /api/enquiries (+ drawing)', 'GET /api/catalogue · JWT admin/staff'] });
box(1280, AY, 360, AH, { title: 'Spring Boot REST API', port: ':8081', lines: ['Spring Boot 3.5 · Java 21 · JPA', 'JWT (HS256) · Spring Security', 'Estimate, quotes, tracking, admin', 'Events · STOMP /topic/work-orders'] });
box(1680, AY, 180, AH, { title: 'MongoDB', port: ':27017', strip: '#4f7f3a', lines: ['activity_log', '(audit events;', 'embedded or', 'Docker)'] });

// presentation -> API arrows
arrow('M1080,420 V520', {});                                  // next -> node (enquiry via Server Action)
arrow('M1140,420 L1330,520', {});                              // next -> spring
arrow('M1520,420 L1180,520', {});                              // react -> node (enquiry)
arrow('M1560,420 V520', {});                                   // react -> spring
label(1050, 470, 'enquiry', { anchor: 'end' });
label(1197, 452, 'REST + JWT', { anchor: 'middle' });
label(1560, 474, 'REST + JWT', { anchor: 'start' });
label(1418, 452, 'enquiry', { anchor: 'middle' });

// spring <-> mongo, node <-> files, node/spring -> mysql
arrow('M1640,605 H1680', { both: false });
arrow('M880,605 H840');
label(1660, 592, 'events', { size: 12 });
label(860, 592, 'save', { size: 12 });
arrow('M1380,690 V780');
arrow('M1000,690 V780');
label(1380, 735, 'JDBC / JPA', { anchor: 'start' });
label(1000, 735, 'mysql2 (prepared statements)', { anchor: 'start' });
// direct SQL
[165, 435, 600].forEach((x, i) => arrow(`M${x},420 V780`, { color: '#0b5285' }));
label(165, 600, 'PDO', { anchor: 'middle' });
label(435, 600, 'Eloquent', { anchor: 'middle' });
label(600, 560, 'JDBC', { anchor: 'start' });
['Direct SQL: these three apps use', 'the shared schema with no API hop', '(see services/CONTRACT.md)'].forEach((l, i) => text(182, 640 + i * 18, l, { size: 13, fill: '#0b5285', weight: 600 }));

// data tier
box(40, 790, 1810, 90, { title: 'MySQL / MariaDB 10.4 (XAMPP) — database “pslaser” — one shared schema', port: ':3306', strip: '#0b5285', lines: ['users · machines · services · materials · rates (SAMPLE prices) · settings · enquiries · uploads · quotes · work_orders · work_order_events  (+ Laravel framework tables)'] });

// shop floor
box(40, 975, 1130, 150, {
  title: 'PS Laser shop, Velu, Bhor, Pune — real machines (NOT integrated with the software)', strip: '#8a8f94', dashed: true,
  lines: ['2 fiber lasers (HSG 3 kW, Genesis 1.5 kW) · CNC press brake 175 T · Amada turret punches 32 T and 16 T',
    'HSG 1.5 kW handheld laser welder · PLC powder-coating plant (9-tank pre-treatment)',
    'Staff read the enquiry/estimate and update work-order status manually in the admin screens.'],
});
// staff -> shop (human-in-the-loop) drawn on left edge

// legend
add(`<rect x="1200" y="975" width="650" height="150" rx="8" fill="#fff" stroke="#c9cdd1"/>`);
text(1214, 998, 'Legend', { size: 15, weight: 700 });
add(`<line x1="1214" y1="1018" x2="1264" y2="1018" stroke="${INK}" stroke-width="1.8" marker-end="url(#ah)"/>`);
text(1274, 1023, 'HTTP/JSON call (REST) or server-side data access', { size: 13.5 });
add(`<line x1="1214" y1="1044" x2="1264" y2="1044" stroke="#0b5285" stroke-width="1.8" marker-end="url(#ah)"/>`);
text(1274, 1049, 'Direct SQL access to the shared MySQL schema', { size: 13.5 });
add(`<rect x="1214" y="1062" width="50" height="14" rx="3" fill="#fff" stroke="${INK}" stroke-dasharray="6 4"/>`);
text(1274, 1074, 'External service / physical context (no software link)', { size: 13.5 });
text(1214, 1098, 'Cross-cutting: JWT secret shared by Spring and Node · bcrypt ($2y$) password hashes ·', { size: 12.5, fill: GREY });
text(1214, 1114, 'CSRF tokens (PHP, Laravel) · httpOnly JWT cookie (Next.js) · CORS allow-list on all APIs', { size: 12.5, fill: GREY });

// WhatsApp deep link from front ends
arrow('M1640,300 H1700 V168', { dashed: true, color: '#2e8b57' });
label(1700, 244, 'Get Quote → wa.me link (all UIs)', { anchor: 'middle', size: 12 });

text(W / 2, 1170, 'Ports as run on 16 Oct 2026. Next.js falls back to an offline TypeScript estimate and the React portal to demo data when Spring is unreachable.', { size: 14, fill: GREY, anchor: 'middle', italic: true });
text(W / 2, 1192, 'Estimator rates are SAMPLE data (rates.is_sample = 1); every estimate is shown as “Indicative”.', { size: 14, fill: GREY, anchor: 'middle', italic: true });
add('</svg>');
fs.writeFileSync(new URL('./fig-architecture.svg', import.meta.url), out.join('\n'));
console.log('ok');
