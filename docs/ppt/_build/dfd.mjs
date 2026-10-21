// Generates DFD diagrams (Yourdon-DeMarco notation) as SVG for the PS Laser PPT.
// Facts: services/CONTRACT.md, Spring DomainEvents/ActivityEventListener, handbook sections 2 and 10.
import fs from 'node:fs';

const INK = '#1d1d1b', ORANGE = '#EF7D00', BLUE = '#0b5285', RED = '#b3261e', GREY = '#5b6168';
const edgeX = (cx, cy, r, y, side) => Math.round(cx + side * Math.sqrt(r * r - (y - cy) ** 2));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

class Svg {
  constructor(w, h, title) {
    this.w = w; this.h = h; this.o = [];
    this.o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Segoe UI, Arial, Helvetica, sans-serif">`);
    this.o.push(`<defs>
<marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>
<marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${BLUE}"/></marker>
<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${RED}"/></marker>
</defs><rect width="${w}" height="${h}" fill="#fff"/>`);
    this.text(w / 2, 34, title, { size: 24, weight: 700, anchor: 'middle' });
  }
  text(x, y, s, { size = 13, weight = 400, fill = INK, anchor = 'start', italic = false } = {}) {
    this.o.push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`);
  }
  entity(x, y, w, h, id, lines, labelY) {
    this.o.push(`<rect x="${x + 4}" y="${y + 4}" width="${w}" height="${h}" fill="#d9dcdf"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${INK}" stroke-width="2"/>`);
    const ly = labelY ?? y + h / 2 - (lines.length * 8);
    this.text(x + w / 2, ly, id, { size: 14, weight: 700, anchor: 'middle' });
    lines.forEach((l, i) => this.text(x + w / 2, ly + 18 + i * 16, l, { size: 12.5, anchor: 'middle' }));
  }
  proc(cx, cy, r, id, lines) {
    this.o.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff4e0" stroke="${INK}" stroke-width="2"/>`);
    this.o.push(`<line x1="${cx - r + 6}" y1="${cy - r * 0.42}" x2="${cx + r - 6}" y2="${cy - r * 0.42}" stroke="${INK}" stroke-width="1.2"/>`);
    this.text(cx, cy - r * 0.55, id, { size: 14, weight: 700, anchor: 'middle' });
    const start = cy - r * 0.42 + 16;
    lines.forEach((l, i) => this.text(cx, start + i * 14.5, l, { size: 12, anchor: 'middle' }));
  }
  store(x, y, w, h, id, lines) {
    this.o.push(`<path d="M${x + w},${y} H${x} V${y + h} H${x + w}" fill="#eaf2f9" stroke="${INK}" stroke-width="2"/>`);
    this.o.push(`<line x1="${x + 46}" y1="${y}" x2="${x + 46}" y2="${y + h}" stroke="${INK}" stroke-width="1.5"/>`);
    this.text(x + 23, y + h / 2 + 5, id, { size: 14, weight: 700, anchor: 'middle' });
    lines.forEach((l, i) => this.text(x + 54, y + h / 2 - (lines.length - 1) * 8 + 4 + i * 15, l, { size: 12, weight: i === 0 ? 600 : 400 }));
  }
  // polyline flow; pts = [[x,y],...]; arrowhead at the end (and start if both)
  flow(pts, { dash = false, color = INK, both = false, w = 1.8 } = {}) {
    const m = color === BLUE ? 'ab' : color === RED ? 'ar' : 'a';
    this.o.push(`<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}"${dash ? ' stroke-dasharray="7 5"' : ''} marker-end="url(#${m})"${both ? ` marker-start="url(#${m})"` : ''}/>`);
  }
  label(x, y, s, { anchor = 'middle', size = 11.5, color = '#222' } = {}) {
    const wd = s.length * size * 0.5 + 8;
    const rx = anchor === 'middle' ? x - wd / 2 : anchor === 'start' ? x - 3 : x - wd + 3;
    this.o.push(`<rect x="${rx}" y="${y - size}" width="${wd}" height="${size + 5}" rx="3" fill="#fff" fill-opacity="0.95"/>`);
    this.text(x, y, s, { size, anchor, weight: 600, fill: color });
  }
  note(x, y, w, h, lines, { fill = '#fffbe6' } = {}) {
    this.o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="#c9b458"/>`);
    lines.forEach((l, i) => this.text(x + 10, y + 20 + i * 17, l, { size: 12.5 }));
  }
  save(name) {
    this.o.push('</svg>');
    fs.writeFileSync(new URL(`./${name}.svg`, import.meta.url), this.o.join('\n'));
  }
}

// ======================================================================= LEVEL 0 (context)
{
  const s = new Svg(1500, 760, 'DFD Level 0 — Context Diagram: PS Laser Web Platform');
  s.entity(40, 230, 250, 250, 'E1', ['Client', '(browser: Next.js site,', 'React portal, PHP / JSP pages)']);
  s.entity(1210, 230, 250, 250, 'E2', ['Staff user', '(admin / staff role;', 'Laravel, JSP, dashboard)']);
  s.entity(560, 600, 380, 90, 'E3', ['WhatsApp service (external)', 'wa.me deep link']);
  s.proc(750, 355, 150, '0', ['PS Laser', 'Web Platform', '(7 services,', 'shared MySQL schema)']);
  // E1 -> 0
  s.flow([[290, 290], [edgeX(750, 355, 150, 290, -1) - 1, 290]]); s.label(450, 282, 'page request (HTTP GET)');
  s.flow([[290, 330], [edgeX(750, 355, 150, 330, -1) - 1, 330]]); s.label(446, 322, 'estimate request (JSON)');
  s.flow([[290, 370], [edgeX(750, 355, 150, 370, -1) - 1, 370]]); s.label(446, 362, 'enquiry + drawing (multipart)');
  s.flow([[290, 410], [edgeX(750, 355, 150, 410, -1) - 1, 410]]); s.label(446, 402, 'orderNo + phone');
  s.flow([[290, 450], [edgeX(750, 355, 150, 450, -1) - 1, 450]]); s.label(450, 442, 'credentials / registration');
  // 0 -> E1
  s.flow([[edgeX(750, 355, 150, 310, -1) - 1, 310], [290, 310]]); s.label(450, 302, 'HTML / JSON content');
  s.flow([[edgeX(750, 355, 150, 350, -1) - 1, 350], [290, 350]]); s.label(446, 342, 'cost breakdown (JSON)');
  s.flow([[edgeX(750, 355, 150, 390, -1) - 1, 390], [290, 390]]); s.label(446, 382, 'enquiry id + wa.me URL');
  s.flow([[edgeX(750, 355, 150, 430, -1) - 1, 430], [290, 430]]); s.label(446, 422, 'status timeline (JSON)');
  s.flow([[edgeX(750, 355, 150, 470, -1) - 1, 470], [290, 470]]); s.label(450, 462, 'JWT (httpOnly cookie)');
  // E2 -> 0
  s.flow([[1210, 300], [edgeX(750, 355, 150, 300, 1) + 1, 300]]); s.label(1050, 292, 'staff credentials');
  s.flow([[1210, 350], [edgeX(750, 355, 150, 350, 1) + 1, 350]]); s.label(1055, 342, 'work-order / rate / catalogue updates (JWT)');
  s.flow([[1210, 400], [edgeX(750, 355, 150, 400, 1) + 1, 400]]); s.label(1052, 392, 'enquiry status changes (JWT)');
  // 0 -> E2
  s.flow([[edgeX(750, 355, 150, 325, 1) + 1, 325], [1210, 325]]); s.label(1050, 318, 'JWT + role');
  s.flow([[edgeX(750, 355, 150, 375, 1) + 1, 375], [1210, 375]]); s.label(1055, 368, 'lists, enquiries, reports (JSON)');
  s.flow([[edgeX(750, 355, 150, 440, 1) + 1, 440], [1210, 440]]); s.label(1050, 433, 'live status push (STOMP /topic/work-orders)');
  // 0 -> E3
  s.flow([[750, 505], [750, 600]], { color: '#2e8b57' }); s.label(752, 548, 'pre-filled quote text (wa.me URL)', { anchor: 'start' });
  s.note(40, 560, 480, 120, ['Notation: Yourdon-DeMarco. Rectangle = external entity,', 'circle = process, open rectangle = data store, arrow = data flow.', 'Level 0 shows the whole platform as one process; the physical', 'shop machines are NOT an entity (no software interface exists).']);
  s.save('dfd-level0');
}

// ======================================================================= LEVEL 1
{
  const s = new Svg(1960, 1150, 'DFD Level 1 — PS Laser Web Platform');
  const PX = 450, r = 68;
  s.entity(20, 70, 170, 960, 'E1', ['Client', '(browser)'], 405);
  s.entity(1760, 380, 180, 640, 'E2', ['Staff user', '(admin / staff)'], 640);
  s.entity(1150, 70, 210, 64, 'E3', ['WhatsApp (external)'], 96);
  s.proc(PX, 130, r, '1.0', ['Serve Content', '& Catalogue']);
  s.proc(PX, 340, r, '2.0', ['Compute', 'Estimate']);
  s.proc(PX, 550, r, '3.0', ['Capture Enquiry', '& Drawing']);
  s.proc(PX, 760, r, '5.0', ['Track', 'Order']);
  s.proc(PX, 965, r, '4.0', ['Authenticate', '& Authorise']);
  s.proc(1400, 470, 70, '6.0', ['Manage Work', 'Orders, Rates,', 'Catalogue']);
  s.proc(1400, 860, 68, '7.0', ['Log & Broadcast', 'Events']);
  // stores
  const SX = 800, SW = 250;
  s.store(SX, 135, SW, 60, 'D2', ['Catalogue', 'machines, services, materials']);
  s.store(SX, 270, SW, 60, 'D3', ['Rate card', 'rates, settings']);
  s.store(SX, 395, SW, 60, 'D5', ['Quotes', 'quotes']);
  s.store(SX, 520, SW, 60, 'D4', ['Enquiries', 'enquiries, uploads']);
  s.store(SX, 630, SW, 60, 'D7', ['Drawing files', 'private disk storage']);
  s.store(SX, 770, SW, 60, 'D6', ['Work orders', 'work_orders, work_order_events']);
  s.store(SX, 1040, SW, 60, 'D1', ['Users', 'users (bcrypt hashes)']);
  s.store(1110, 832, 190, 56, 'D8', ['Activity log', 'MongoDB']);
  // client <-> processes
  const L = 190, E = 382;
  s.flow([[L, 115], [E + 2, 115]]); s.label(285, 107, 'page request');
  s.flow([[E + 2, 145], [L, 145]]); s.label(285, 160, 'HTML (SSG/ISR)');
  s.flow([[L, 325], [E + 2, 325]]); s.label(285, 317, 'estimate request');
  s.flow([[E + 2, 355], [L, 355]]); s.label(285, 370, 'cost breakdown');
  s.flow([[L, 535], [E + 2, 535]]); s.label(285, 527, 'enquiry + file');
  s.flow([[E + 2, 565], [L, 565]]); s.label(285, 580, 'id + wa.me URL');
  s.flow([[L, 745], [E + 2, 745]]); s.label(285, 737, 'orderNo + phone');
  s.flow([[E + 2, 775], [L, 775]]); s.label(285, 790, 'status timeline');
  s.flow([[L, 950], [E + 4, 950]]); s.label(285, 942, 'credentials');
  s.flow([[E + 4, 982], [L, 982]]); s.label(285, 998, 'JWT cookie');
  // 1.0 -> WhatsApp
  s.flow([[512, 108], [1150, 102]], { color: '#2e8b57' }); s.label(930, 94, 'wa.me URL (pre-filled quote text)', { color: '#1d6b42' });
  // process <-> stores
  s.flow([[SX, 160], [516, 138]]); s.label(640, 168, 'read catalogue');
  s.flow([[SX, 175], [494, 312]]); s.label(640, 242, 'materials');
  s.flow([[SX, 300], [512, 336]]); s.label(668, 318, 'rates, settings');
  s.flow([[500, 368], [SX, 415]]); s.label(640, 405, 'save quote');
  s.flow([[518, 548], [SX, 548]]); s.label(660, 540, 'enquiry record');
  s.flow([[500, 585], [SX, 655]]); s.label(640, 628, 'drawing file');
  s.flow([[SX, 800], [510, 780]]); s.label(654, 806, 'order + events');
  s.flow([[500, 1000], [SX, 1065]], { both: true }); s.label(650, 1052, 'user record / hash');
  // stores <-> 6.0
  const P6 = [1330, 470];
  s.flow([[SX + SW, 165], [1345, 410]], { both: true, color: BLUE }); s.label(1130, 205, 'catalogue CRUD', { color: BLUE });
  s.flow([[SX + SW, 300], [1332, 440]], { both: true, color: BLUE }); s.label(1170, 345, 'rates / settings CRUD', { color: BLUE });
  s.flow([[SX + SW, 425], [1331, 462]], { color: BLUE }); s.label(1185, 440, 'read quotes', { color: BLUE });
  s.flow([[SX + SW, 550], [1331, 490]], { both: true, color: BLUE }); s.label(1190, 548, 'enquiry status', { color: BLUE });
  s.flow([[SX + SW, 795], [1345, 528]], { both: true, color: BLUE }); s.label(1180, 700, 'work order + event rows', { color: BLUE });
  // staff <-> 6.0, 4.0
  s.flow([[1760, 450], [1471, 450]]); s.label(1668, 442, 'updates (JWT)');
  s.flow([[1469, 495], [1760, 495]]); s.label(1668, 512, 'lists, enquiries');
  s.flow([[1760, 950], [520, 950]]); s.label(1660, 942, 'staff credentials');
  s.flow([[447, 985], [1760, 985]]); s.label(1660, 1002, 'JWT + role');
  s.flow([[1468, 840], [1760, 840]]); s.label(1668, 832, 'live push (STOMP)');
  // events -> 7.0
  s.flow([[1400, 541], [1400, 792]], { dash: true, color: RED }); s.label(1402, 640, 'WorkOrderStatusChanged', { anchor: 'start', color: RED });
  s.flow([[430, 1013], [1400, 1013], [1400, 929]], { dash: true, color: RED }); s.label(900, 1007, 'UserLoggedIn / UserRegistered', { color: RED });
  s.flow([[PX, 272], [PX, 235], [700, 235], [700, 58], [1580, 58], [1580, 885], [1462, 885]], { dash: true, color: RED }); s.label(1130, 52, 'EstimateCalculated / QuoteSaved', { color: RED });
  s.flow([[1332, 860], [1300, 860]], { color: BLUE }); s.label(1316, 905, 'write', { size: 10.5, color: BLUE });
  s.note(1080, 1060, 640, 70, ['Black = data flow · Blue = read/write to data store · Red dashed = in-process domain event · Green = external link.', 'Domain events are published by Spring services and consumed asynchronously by 7.0 (logging) and /topic/work-orders (push).']);
  s.save('dfd-level1');
}

// ======================================================================= LEVEL 2 — Process 2.0
{
  const s = new Svg(1760, 800, 'DFD Level 2 — Process 2.0 Compute Estimate');
  s.entity(20, 290, 170, 150, 'E1', ['Client', '(Next.js BFF /', 'React / PHP / JSP)'], 320);
  const y = 365, r = 66;
  const xs = [330, 580, 830, 1080, 1330];
  s.proc(xs[0], y, r, '2.1', ['Validate', 'Request']);
  s.proc(xs[1], y, r, '2.2', ['Resolve Material', '& Rate Band']);
  s.proc(xs[2], y, r, '2.3', ['Compute Cost', 'Lines']);
  s.proc(xs[3], y, r, '2.4', ['Round, Quantity', '& GST']);
  s.proc(xs[4], y, r, '2.5', ['Compose', 'Response']);
  s.proc(1330, 640, r, '2.6', ['Persist Quote', '(optional)']);
  s.store(430, 110, 250, 56, 'D2', ['Catalogue', 'materials']);
  s.store(740, 110, 270, 56, 'D3', ['Rate card', 'rates, settings']);
  s.store(1440, 612, 230, 56, 'D5', ['Quotes', 'quotes']);
  s.entity(1480, 190, 210, 90, '7.0', ['Log & Broadcast Events', '(Level 1 process)']);
  s.flow([[190, y], [xs[0] - r - 1, y]]); s.label(260, y - 8, 'EstimateInput');
  s.flow([[xs[0] + r + 1, y], [xs[1] - r - 1, y]]); s.label(455, y - 8, 'valid input');
  s.flow([[xs[1] + r + 1, y], [xs[2] - r - 1, y]]); s.label(705, y - 8, 'rate row + density');
  s.flow([[xs[2] + r + 1, y], [xs[3] - r - 1, y]]); s.label(955, y - 8, 'cost lines');
  s.flow([[xs[3] + r + 1, y], [xs[4] - r - 1, y]]); s.label(1205, y - 8, 'totals');
  s.flow([[580, 166], [570, y - r - 1]], { color: BLUE }); s.label(512, 235, 'max thickness, density', { color: BLUE, anchor: 'end' });
  s.flow([[800, 166], [600, y - r - 2]], { color: BLUE }); s.label(690, 250, 'rate band row', { color: BLUE });
  s.flow([[900, 166], [850, y - r - 1]], { color: BLUE }); s.label(905, 205, 'bend + coating rates', { color: BLUE, anchor: 'start' });
  s.flow([[960, 166], [1070, y - r - 1]], { color: BLUE }); s.label(1060, 260, 'GST %, sample flag', { color: BLUE, anchor: 'start' });
  // response to client lane
  s.flow([[1330, y + r + 1], [1330, 540], [105, 540], [105, 440]]); s.label(900, 534, 'EstimateResult JSON (breakdown, perPart, subtotal, gst, total, isSample)');
  // error lane
  s.flow([[xs[0], y + r + 1], [xs[0], 528]], { dash: true, color: RED }); s.label(xs[0] + 6, 480, 'HTTP 400 + fieldErrors', { anchor: 'start', color: RED });
  s.flow([[xs[1], y + r + 1], [xs[1], 528]], { dash: true, color: RED }); s.label(xs[1] + 6, 480, '400: no rate band', { anchor: 'start', color: RED });
  // event + save
  s.flow([[1380, y - r + 4], [1480, 250]], { dash: true, color: RED }); s.label(1470, 320, 'EstimateCalculated', { anchor: 'start', color: RED });
  s.flow([[1330, 540], [1330, 574]]); s.label(1336, 560, 'quote data', { anchor: 'start' });
  s.flow([[1396, 640], [1440, 640]], { color: BLUE });
  s.note(40, 600, 1000, 160, [
    'Process 2.1: schema validation (material code, numeric ranges, quantity >= 1, part inside the 3000 x 1500 mm bed).',
    'Process 2.2: SELECT the rate row whose thickness band contains thickness_mm; reject thickness above the material maximum or in a gap.',
    'Process 2.3: area = L x W / 1e6; weight = area x t x density; material, cutting, piercing, bending and coating lines.',
    'Process 2.4: each line rounded half-up to 2 dp; perPart = sum; subtotal = round2(perPart x qty); gst = round2(subtotal x g / 100).',
    'Process 2.5: build EstimateResult, set isSample from settings.rates_are_sample, publish EstimateCalculated.',
    'Process 2.6 runs only for POST /api/quotes (stores quote number PSL-Q-YYYYMMDD-####).',
    'Offline fallback: if Spring is unreachable, the Next.js route handler runs the same formula in TypeScript (source = offline).',
  ]);
  s.save('dfd-level2-estimate');
}

// ======================================================================= LEVEL 2 — Order lifecycle (5.0, 6.0, 7.0)
{
  const s = new Svg(1900, 1000, 'DFD Level 2 — Work-Order Lifecycle (Processes 6.0, 7.0 and 5.0)');
  const r = 62;
  s.entity(20, 120, 170, 140, 'E2', ['Staff user', '(admin / staff)'], 160);
  s.entity(20, 700, 170, 140, 'E1', ['Client', '(browser)'], 740);
  // staff chain y=190
  const y1 = 190;
  s.proc(330, y1, r, '6.1', ['Verify JWT', '& Role']);
  s.proc(580, y1, r, '6.2', ['Create / Update', 'Work Order']);
  s.proc(830, y1, r, '6.3', ['Append Status', 'Event (tx)']);
  s.proc(1080, y1, r, '6.4', ['Publish Status', 'Changed Event']);
  s.proc(1380, 120, r, '7.1', ['Persist', 'Activity Record']);
  s.proc(1380, 300, r, '7.2', ['Broadcast', 'STOMP Message']);
  s.store(1560, 92, 260, 56, 'D8', ['Activity log', 'MongoDB activity_log']);
  s.flow([[190, y1], [267, y1]]); s.label(228, y1 - 8, 'Bearer JWT', { size: 10.5 });
  s.flow([[393, y1], [517, y1]]); s.label(455, y1 - 8, 'authorised request');
  s.flow([[643, y1], [767, y1]]); s.label(705, y1 - 8, 'order row saved');
  s.flow([[893, y1], [1017, y1]]); s.label(955, y1 - 8, 'status changed');
  s.flow([[1141, 165], [1322, 130]], { dash: true, color: RED }); s.label(1236, 135, 'event (after commit)', { color: RED });
  s.flow([[1141, 215], [1322, 290]], { dash: true, color: RED }); s.label(1236, 268, 'event (after commit)', { color: RED });
  s.flow([[1442, 120], [1560, 120]], { color: BLUE }); s.label(1500, 112, 'insert', { color: BLUE, size: 10.5 });
  s.flow([[1380, 362], [1380, 410], [105, 410], [105, 260]]); s.label(1130, 404, 'live push on /topic/work-orders (JSON payload: orderNo, fromStatus, toStatus, at)');
  // D6
  s.store(430, 470, 330, 60, 'D6', ['Work orders & events', 'work_orders, work_order_events']);
  s.flow([[580, 252], [580, 470]], { color: BLUE, both: true }); s.label(586, 380, 'write order', { anchor: 'start', color: BLUE });
  s.flow([[830, 252], [760, 482]], { color: BLUE }); s.label(830, 380, 'insert event row', { anchor: 'start', color: BLUE });
  // customer chain y=770
  const y2 = 770;
  s.proc(330, y2, r, '5.1', ['Validate', 'orderNo + phone']);
  s.proc(630, y2, r, '5.2', ['Fetch Order', '+ Events']);
  s.proc(930, y2, r, '5.3', ['Mask Phone,', 'Build Timeline']);
  s.flow([[190, y2], [267, y2]]); s.label(228, y2 - 8, 'orderNo, phone', { size: 10.5 });
  s.flow([[393, y2], [567, y2]]); s.label(480, y2 - 8, 'lookup key');
  s.flow([[693, y2], [867, y2]]); s.label(780, y2 - 8, 'order + events');
  s.flow([[930, y2 + r + 1], [930, 900], [105, 900], [105, 840]]); s.label(520, 894, 'timeline JSON (phone masked) or 404 not found (never reveals existence)');
  s.flow([[595, 530], [610, 708]], { color: BLUE }); s.label(612, 620, 'SELECT by orderNo + phone', { anchor: 'start', color: BLUE });
  s.note(1180, 520, 680, 330, [
    '6.1 Spring Security filter verifies the HS256 JWT and the role (admin / staff).',
    '6.2 JPA writes work_orders; 6.3 inserts a work_order_events row in the SAME',
    '    @Transactional method as the status change.',
    '6.4 WorkOrderStatusChanged is published with ApplicationEventPublisher and',
    '    delivered only AFTER the transaction commits (no event for rolled-back data).',
    '7.1 ActivityEventListener (async) stores the event in MongoDB.',
    '7.2 The same listener sends the message to the STOMP simple broker; the Next.js',
    '    dashboard subscribes (fallback: 15 s polling).',
    '5.1-5.3 Customer tracking is a read-only path: both orderNo and phone must',
    '    match, otherwise the response is 404 with no hint whether the order exists.',
  ]);
  s.save('dfd-level2-orders');
}
console.log('dfd ok');
