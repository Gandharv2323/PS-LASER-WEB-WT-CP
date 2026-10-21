// Layered + feature-based front-end architecture of the Next.js Web Application (Unit V view).
// Every file path below exists in src/ (checked 21 Oct 2026).
import fs from 'node:fs';
const INK = '#1d1d1b', ORANGE = '#EF7D00', BLUE = '#0b5285', GREEN = '#4f7f3a', GREY = '#6b7480';
const o = []; const add = (s) => o.push(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const W = 1500, H = 900;
const text = (x, y, s, { size = 14, weight = 400, fill = INK, anchor = 'start' } = {}) => add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`);
function layer(y, h, color, title, sub, items) {
  add(`<rect x="30" y="${y}" width="1000" height="${h}" rx="10" fill="#fff" stroke="${color}" stroke-width="3"/>`);
  add(`<path d="M30,${y + 40} V${y + 10} a10,10 0 0 1 10,-10 H1020 a10,10 0 0 1 10,10 V${y + 40} Z" transform="translate(0,${y})" fill="none"/>`);
  add(`<rect x="30" y="${y}" width="1000" height="40" rx="10" fill="${color}"/><rect x="30" y="${y + 20}" width="1000" height="20" fill="${color}"/>`);
  text(46, y + 27, title, { size: 18, weight: 700, fill: '#fff' });
  text(1014, y + 27, sub, { size: 13, fill: '#fff', anchor: 'end' });
  items.forEach((t, i) => text(50, y + 66 + i * 21, t, { size: 14 }));
}
add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, Helvetica, sans-serif"><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker></defs><rect width="${W}" height="${H}" fill="#fff"/>`);
text(W / 2, 36, 'Front-End Layered Architecture — Next.js Web Application (Unit V mapping)', { size: 24, weight: 700, anchor: 'middle' });
layer(70, 170, ORANGE, 'L1  Presentation Layer', 'pages + components', [
  'app/(classic)/quote/page.tsx (SSG + ISR shell), track/page.tsx (SSR + Suspense), dashboard/page.tsx (SSR, HOC)',
  'features/quote/*  ·  features/track/*  ·  features/dashboard/*  (feature folders, barrel index.ts)',
  'components/advanced/*: ErrorBoundary (class), PortalModal, VirtualList<T>, AsyncView (render props), Panel (polymorphic)',
  'Patterns: compound components (Estimator.Number), container/presenter, controlled/uncontrolled inputs',
]);
layer(270, 170, BLUE, 'L2  Logic Layer', 'custom hooks + client state', [
  'hooks/use-estimate.ts (AbortController, race guard)  ·  use-debounced-value.ts (350 ms)  ·  use-query.ts (cache hook)',
  'hooks/use-live-work-orders.ts (STOMP + 15 s polling)  ·  use-local-storage.ts  ·  use-media-query.ts',
  'features/quote/quote-reducer.ts (useReducer state machine)  ·  store/quote-store.ts (Zustand + persist)',
  'Performance: React.memo, useMemo, useCallback, useTransition, useDeferredValue, lazy + Suspense, next/dynamic',
]);
layer(470, 170, GREEN, 'L3  Service Layer', 'lib/api (isomorphic + server-only)', [
  'lib/api/client.ts: apiFetch<T>(url, schema), withFallback<T>   ·   lib/api/validate.ts + schemas.ts (runtime validation)',
  'lib/api/query-cache.ts (stale-while-revalidate, retry 500 ms → 1 s → 2 s)   ·   lib/api/stomp.ts (STOMP 1.2 client)',
  'lib/api/estimate.ts (TypeScript copy of the formula = offline fallback)',
  'server-only: lib/api/spring.ts (Bearer JWT, no-store / revalidate tags), lib/api/session.ts (verifyJwt HS256)',
]);
layer(670, 190, GREY, 'L4  Backend-for-Frontend + Backends', 'server side', [
  'BFF route handlers: app/api/estimate, app/api/auth/login|logout, app/api/work-orders  (validate, proxy, httpOnly cookie)',
  'Server Action: features/quote/actions.ts "use server" → Node.js Enquiry API  (URL never reaches the browser bundle)',
  'Spring Boot Core API :8081 (JWT, JPA, STOMP)  ·  Node.js Enquiry API :4000 (zod, multer)  ·  MySQL pslaser  ·  MongoDB',
  'Rule: the browser never talks to MySQL; the Web Application talks to APIs through L3 only',
]);
[240, 440, 640].forEach((y) => add(`<line x1="530" y1="${y}" x2="530" y2="${y + 30}" stroke="${INK}" stroke-width="2.5" marker-end="url(#a)"/>`));
// side panel
add(`<rect x="1070" y="70" width="400" height="790" rx="10" fill="#fffbe6" stroke="#c9b458"/>`);
text(1090, 102, 'Feature-based folder layout (src/)', { size: 17, weight: 700 });
['app/                 routes (App Router), route handlers', '  (classic)/          main site: quote, track, dashboard', '  api/                BFF handlers', 'features/             one folder per business feature', '  quote/ track/ dashboard/', 'components/advanced/  shared reusable components', 'hooks/                shared custom hooks', 'store/                Zustand store', 'lib/api/              service layer + types', 'lib/pslaser/data.ts   content constants'].forEach((l, i) => add(`<text x="1090" y="${136 + i * 22}" font-size="13.5" font-family="Consolas, Courier New, monospace" fill="${INK}">${esc(l)}</text>`));
text(1090, 390, 'Rendering strategy per route', { size: 17, weight: 700 });
[['/quote', 'SSG + ISR (revalidate 3600 s) + CSR islands'], ['/track', 'SSR per request, streamed (Suspense)'], ['/dashboard', 'SSR (cookie) + CSR live board'], ['/api/*', 'dynamic route handlers (BFF)'], ['other pages', 'static (prerendered at build)']].forEach(([a, b], i) => { text(1090, 424 + i * 44, a, { size: 14, weight: 700 }); text(1090, 442 + i * 44, b, { size: 13.5 }); });
text(1090, 670, 'Verified by production build (21 Oct 2026):', { size: 14, weight: 700 });
['Next.js 16.3.5 (Turbopack): compiled in 12.3 s,', 'TypeScript check 10.2 s, 22 static pages in 1.5 s;', '/quote marked Revalidate 1h; /track, /dashboard,', 'and /api/* marked ƒ (dynamic).'].forEach((l, i) => text(1090, 694 + i * 20, l, { size: 13.5 }));
add('</svg>');
fs.writeFileSync(new URL('./unit5-layers.svg', import.meta.url), o.join('\n'));
