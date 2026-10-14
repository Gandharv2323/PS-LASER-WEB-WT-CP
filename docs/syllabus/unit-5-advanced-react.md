# Unit V — Advanced React (CS3111) → PS Laser Next.js site

Unit V is implemented inside the main Next.js 16 / React 19 / TypeScript (strict) app as three
real PS Laser features in the classic site look (Bootstrap 4 + orange `#EF7D00`):

| Route | What it is | Rendering |
|---|---|---|
| `/quote` | Instant estimator (indicative, SAMPLE rates), saved-estimate cart, nesting preview, generated parts list, enquiry form, machine finder | **SSG + ISR** shell (`revalidate = 3600`) + client islands (CSR) |
| `/track` | Customer order tracking (`?orderNo=&phone=`) | **SSR** per request, streamed with `<Suspense>` + `loading.tsx`, `error.tsx` |
| `/dashboard` | Staff production board (JWT login, live updates) | **SSR** (reads httpOnly cookie) + client board (CSR, live) |
| `/api/estimate`, `/api/auth/login`, `/api/auth/logout`, `/api/work-orders` | Route handlers = BFF proxy to Spring Boot | Dynamic, never cached |

Backends (see `services/CONTRACT.md`): Spring Boot `:8081` (materials, estimate, tracking, auth, admin work orders, STOMP `/topic/work-orders`), Node/Express `:4000` (`POST /api/enquiries`).
**Every call degrades gracefully:** if Spring is down, the estimator uses the same formula in TypeScript (`src/lib/api/estimate.ts`) and shows an **"Offline estimate (sample)"** badge; tracking falls back to the seed demo order; enquiries fall back to a WhatsApp link. Every estimate shows "Indicative estimate — final quote on WhatsApp".

All paths below are relative to `src/`. Line numbers are the line where the construct starts.

## 1. TypeScript integration

| Topic | Where | Explanation |
|---|---|---|
| Strict DTO types matching the API contract | `lib/api/types.ts` (whole file) | `Material`, `EstimateInput`, `EstimateResult`, `WorkOrder`, `TrackedOrder`, `LoginResponse`, `JwtClaims`, `ApiErrorBody`… mirror CONTRACT.md |
| Literal unions from `as const` tuples | `lib/api/types.ts:11` (`MATERIAL_CODES`), `:20` (`WORK_ORDER_STATUSES`), `BREAKDOWN_KEYS` | One array gives both the runtime list and the union type |
| Discriminated union for request state | `lib/api/types.ts:205` `RequestState<T,E>` | `status` discriminant → narrowing with no casts; exhaustive `never` check in `components/advanced/async-view.tsx:34` |
| Discriminated unions for results | `lib/api/spring.ts` `TrackResult` / `EstimateOutcome`; `lib/api/estimate.ts` `EstimateValidation`; `lib/api/client.ts:14` `ApiErrorKind` | `switch (result.kind)` in `features/track/track-result.tsx:13` |
| Generics | `lib/api/client.ts:37` `apiFetch<T>(url, schema: Schema<T>)`; `lib/api/client.ts:82` `withFallback<T>`; `hooks/use-query.ts:22` `useQuery<T>`; `hooks/use-debounced-value.ts:6`; `components/advanced/virtual-list.tsx:11` `VirtualList<T>` | Typed + runtime-validated fetch; generic hooks/components |
| Runtime validation (hand-written, zod-style) | `lib/api/validate.ts:20` `Schema<T>`, `:21` `Infer<S>`, `:96` mapped `OutputOf<S>`, `:55` `literal<const L>`; schemas in `lib/api/schemas.ts:38`, `:91` | API JSON is `unknown` until validated; tolerant of camelCase/snake_case |
| Utility types | `lib/api/types.ts:99` `NumericKeys<T>` (key filtering), `:132` `Omit`, `:135` `Pick`, `FieldErrors<T> = Partial<Record<…>>`, `Readonly`, `:212` `DataOf<S>` (conditional + `infer`) | |
| Type guards | `lib/api/session.ts` `isClaims(v): v is JwtClaims`; `lib/api/validate.ts` `isObject` | Narrow `unknown` safely |
| Typed props / children | `features/quote/estimator.tsx` (`children: ReactNode`), `components/advanced/portal-modal.tsx`, `components/advanced/panel.tsx:13` | |
| Typed context | `features/quote/estimator.tsx:18` `createContext<EstimatorContextValue \| null>`; `hooks/use-query.ts:7` `createContext<QueryCache>` | Guarded hook `useEstimator()` throws outside provider (`:20`) |
| Typed reducer actions | `features/quote/quote-reducer.ts:16` `QuoteAction` union; exhaustive `never` at `:64` | `dispatch` only accepts valid actions |
| Next.js typed routes | `npx next typegen` generates route types; `app/(classic)/track/page.tsx` types `searchParams` as a `Promise` (Next 16) | |

## 2. Server-side rendering (SSR / SSG / ISR / CSR)

| Strategy | Where | How it works here |
|---|---|---|
| **SSR** (per request) | `app/(classic)/track/page.tsx:22` `await searchParams` | Reading `searchParams` makes the route dynamic; `trackOrder()` fetches Spring with `cache: "no-store"` (`lib/api/spring.ts:39`) |
| **Streaming + Suspense** | `app/(classic)/track/page.tsx:39` `<Suspense key=…>` around async `features/track/track-result.tsx:10`; route-level `app/(classic)/track/loading.tsx:6` | Shell + form stream first; the order card streams in when Spring answers; `key` re-shows the fallback per search |
| Error boundary file | `app/(classic)/track/error.tsx` | Client error boundary; Next 16.3 `retry()` re-fetches the segment |
| **SSG** | `app/(classic)/quote/page.tsx` | No request-time APIs → prerendered at `next build` (`○`/ISR in build output) |
| **ISR** | `app/(classic)/quote/page.tsx:18` `export const revalidate = 3600`; `lib/api/spring.ts:28` `next: { revalidate, tags: ["materials"] }` | Materials from Spring baked into the HTML, regenerated in the background at most hourly; build output shows `/quote  1h  1y` |
| **CSR** | client islands: `features/quote/quote-calculator.tsx`, `features/dashboard/dashboard-board.tsx` (`"use client"`) | Interactive parts hydrate and fetch in the browser via the BFF |
| Server Component data fetching | `app/(classic)/quote/page.tsx:21`, `features/track/track-result.tsx:10`, `features/dashboard/with-auth.tsx` | `async` components, no client JS for the data |
| Route handler / BFF proxy | `app/api/estimate/route.ts:11` → `lib/api/spring.ts` `springEstimate` | Validates body, forwards to Spring `POST /api/quotes/estimate`, falls back to the TS formula with `source: "offline"`; 4xx (e.g. 3.005 mm "No rate band") passed through |
| Server Action | `features/quote/actions.ts:1` `"use server"`, `:36` `submitEnquiry` | Posts the enquiry to Node `:4000` from the server (no CORS, URL not in client bundle) |

**SSR vs SSG vs ISR vs CSR (summary):** SSR renders HTML on every request (fresh, per-user: `/track`, `/dashboard`). SSG renders once at build (fastest, CDN-cacheable). ISR = SSG plus background regeneration after `revalidate` seconds (`/quote`: rate/material data changes rarely). CSR renders in the browser after hydration (highly interactive state: calculator, live board). Next’s build table marks them `ƒ` (dynamic/SSR), `○` (static), and `Revalidate 1h` (ISR).

## 3. Core advanced concepts & hooks

| Hook / concept | Where | Why |
|---|---|---|
| Custom hook `useDebouncedValue` | `hooks/use-debounced-value.ts:6`; used `features/quote/quote-calculator.tsx:46` | Estimates request only after 350 ms of no typing |
| Custom hook `useEstimate` (AbortController + race guard) | `hooks/use-estimate.ts:20`; `new AbortController` `:28`; request-id guard `:27`/`:30` | Cancels stale requests; ignores out-of-order responses; validation/loading derived during render |
| Custom hook `useLocalStorage` | `hooks/use-local-storage.ts:31` (useSyncExternalStore, cross-tab `storage` event); used `quote-calculator.tsx:57` (tips toggle) | |
| Custom hook `useMediaQuery` / `usePrefersReducedMotion` | `hooks/use-media-query.ts:9`, `:25`; used `quote-calculator.tsx:58-59` | Mobile sticky total bar; smooth vs instant scroll |
| `useReducer` | `features/quote/quote-calculator.tsx:44` with `features/quote/quote-reducer.ts:43` | Quote form state machine (set field, material clamp, presets, reset) |
| `useContext` | `features/quote/estimator.tsx:20`; `hooks/use-query.ts` `useQueryCache` | Compound component + cache provider |
| `useMemo` / `useCallback` (where they matter) | `quote-calculator.tsx:45` (stable input identity → debounce/useEffect deps), `:54` (stable callback keeps `memo(EstimateSummary)` from re-rendering); `features/quote/materials-chart.tsx:13`; `parts-list.tsx` (10 000-row generation) | |
| `useTransition` | `features/quote/parts-list.tsx:38`, `:74` (filter of up to 10 000 parts); `features/quote/machine-finder.tsx:76` | Input stays responsive; `isPending` dims stale list |
| `useDeferredValue` | `features/quote/machine-finder.tsx:41`; `features/dashboard/dashboard-board.tsx:31` | Background re-render of filtered list |
| `useActionState` (React 19) | `features/quote/enquiry-panel.tsx:17` (Server Action); `features/dashboard/login-form.tsx:15` | Pending state + returned state without manual `useState` |
| `useOptimistic` (React 19) | `features/quote/enquiry-panel.tsx:18` | Enquiry appears as "sending…" instantly |
| `useId` | `features/quote/estimator.tsx:54`, `components/advanced/portal-modal.tsx`, `components/advanced/quantity-stepper.tsx` | SSR-stable label/aria ids |
| `useLayoutEffect` vs `useEffect` | `components/advanced/portal-modal.tsx:30` (layout: lock scroll + focus before paint) vs `:43` (effect: key listener); `components/advanced/virtual-list.tsx:33` (measure viewport before paint) | `useLayoutEffect` runs synchronously after DOM mutation, before paint — use only for measurement/visual sync; everything else `useEffect` |
| `useSyncExternalStore` | `hooks/use-query.ts:36` (query cache), `hooks/use-media-query.ts`, `hooks/use-local-storage.ts`, `store/quote-store.ts:75` (persist hydration), `components/advanced/portal-modal.tsx:26` | Tear-free subscriptions with a server snapshot for SSR |

## 4. Robust state library — Zustand

| Topic | Where | Explanation |
|---|---|---|
| Store | `store/quote-store.ts:44` `create<QuoteState>()(persist(...))` | Quote cart + customer shared by `/quote` and `/track` (`features/quote/quote-cart.tsx`, compact mode on `/track`) |
| Persistence middleware | `store/quote-store.ts:45` `persist`, `partialize`, `version`; `:62` `skipHydration` + `useQuoteStoreHydrated` (`:75`) | localStorage, hydration-safe (server HTML = first client render) |
| Selectors | `store/quote-store.ts:68` `selectCount`, `selectCartTotal`; `quote-calculator.tsx:60` `useQuoteStore((s) => s.add)` | Components re-render only when their slice changes |
| **Why Zustand, not Redux Toolkit** | header comment `store/quote-store.ts` | Small client state, few actions → no providers/boilerplate, ~1 kB, selector subscriptions. Redux/RTK is used in `services/react-portal` (Unit II). |
| **Zustand vs Context** | same comment; Context used where it fits (`estimator.tsx`, `use-query.ts`) | A Context value change re-renders all consumers; Zustand selectors (useSyncExternalStore) re-render only affected components and work outside React. Context is right for scoped, rarely-changing dependencies (compound-component state, injecting the cache). |

## 5. State management & API integration

| Topic | Where | Explanation |
|---|---|---|
| Data layer with caching (own SWR-style cache) | `lib/api/query-cache.ts:42` `QueryCache`; `hooks/use-query.ts:22` `useQuery` | Keyed cache, de-duplicated in-flight requests (`fetch` `:74`), stale-while-revalidate, `staleTime`, `invalidate` (`:129`), `setData` for pushes (`:121`). Chosen over TanStack Query so every mechanism is visible for the syllabus. |
| Retries | `lib/api/query-cache.ts:92` | Exponential backoff 500 ms → 1 s → 2 s; no retry on 4xx/abort |
| Loading / error / empty states | `components/advanced/async-view.tsx`; `features/dashboard/dashboard-board.tsx` (skeleton, error + Retry, "No work orders match"); `features/quote/parts-list.tsx` ("No parts match") | |
| Offline fallback | `lib/api/client.ts:82` `withFallback`; `lib/api/fallback.ts`; `components/advanced/offline-note.tsx` `SourceBadge` | Visible "Offline … (sample)" badge |
| JWT login → httpOnly cookie | `app/api/auth/login/route.ts` (`httpOnly: true` line 24, SameSite=Lax); `app/api/auth/logout/route.ts`; `lib/api/session.ts:24` `verifyJwt` (HS256, timing-safe), `:42` `getSession` | Token never reachable from JS (verified: `document.cookie` has no `psl_token`) |
| Authenticated API calls | `app/api/work-orders/route.ts:10` → `lib/api/spring.ts:90` `Authorization: Bearer` | Cookie read server-side, forwarded to Spring |
| Live updates (STOMP) with polling fallback | `lib/api/stomp.ts:19` (minimal STOMP 1.2 over WebSocket); `hooks/use-live-work-orders.ts:22`, socket `:37`, polling `:28` | Pushed orders are upserted into the cache; if the socket is unavailable, 15 s polling. Badge shows "Live (STOMP)" or "Polling every 15 s". |

## 6. Performance tuning

| Topic | Where | Explanation |
|---|---|---|
| `React.memo` on list items | `features/quote/parts-list.tsx:18` `PartRow`; `features/quote/machine-finder.tsx:10` `MachineCard`; `features/dashboard/dashboard-board.tsx:12` `Row`; `features/quote/estimate-summary.tsx:57` | |
| Code splitting: `next/dynamic` | `features/quote/quote-calculator.tsx:27` canvas `SheetPreview` with `ssr: false` + loading skeleton | Browser-only canvas code in its own chunk |
| Code splitting: `React.lazy` + `Suspense` | `features/quote/quote-calculator.tsx:31`, `:198` `MaterialsChart` | Chart chunk fetched only when "Compare materials" is clicked |
| List virtualisation (own windowing) | `components/advanced/virtual-list.tsx:11`, maths `:41`; used `features/quote/parts-list.tsx:93` | Quantity 5000 → only ~20 DOM rows (verified) |
| `next/image` sizing | `features/quote/machine-finder.tsx:16` (`fill` + `sizes` + aspect-ratio box) | Responsive srcset, lazy, no CLS |
| Avoiding re-renders | stable `useCallback` (`quote-calculator.tsx:54`), memoised input (`:45`), Zustand selectors, `useSyncExternalStore` snapshots replaced only on change (`query-cache.ts` `set`) | |
| React Profiler API | `components/advanced/dev-profiler.tsx:14` `<Profiler onRender>`; wraps `QuoteCalculator`, `PartsList`, `DashboardBoard` | Logs `actualDuration`/`baseDuration` with `console.debug` in dev only |
| `useTransition` for heavy filtering | `features/quote/parts-list.tsx:74` | |
| Bundle analysis | — | `npx next experimental-analyze` (Turbopack analyzer, Next ≥ 16.1) shows the separate `sheet-preview` / `materials-chart` chunks; `zustand` adds ~1 kB |

## 7. Advanced component patterns & architecture

| Pattern | Where | Explanation |
|---|---|---|
| Compound components | `features/quote/estimator.tsx:137` `Estimator` + `.Number`, `.Material`, `.Toggle`, `.Row`; used in `quote-calculator.tsx` | Shared state via typed context, free layout |
| Render props | `components/advanced/async-view.tsx:17` (`success={(data) => …}`); `components/advanced/virtual-list.tsx` `renderRow`; `components/advanced/error-boundary.tsx` `fallback(error, reset)` | |
| Higher-order component | `features/dashboard/with-auth.tsx:14` `withAuth(Component, { roles, fallback })`; used `app/(classic)/dashboard/page.tsx:19` | Server-side HOC verifies the JWT cookie and injects `session` |
| Container / presenter (+ custom hook) | container `features/quote/quote-calculator.tsx` (state, effects, `useEstimate`); presenters `features/quote/estimate-summary.tsx` (`EstimateSummary`, `BreakdownTable`), `features/track/order-timeline.tsx` | |
| Controlled vs uncontrolled | `hooks/use-controllable-state.ts:9` + `components/advanced/quantity-stepper.tsx:12`: controlled in `quote-calculator.tsx:133`, uncontrolled (`name` + `defaultValue`, read via FormData) in `features/quote/enquiry-panel.tsx`; uncontrolled GET form `features/track/track-form.tsx:8` | |
| Portals | `components/advanced/portal-modal.tsx:53` `createPortal(…, document.body)` — cost breakdown modal | |
| Error boundaries (class) | `components/advanced/error-boundary.tsx:18` (`getDerivedStateFromError` `:21`, `componentDidCatch`); wraps the nesting preview (`quote-calculator.tsx:184`); route-level `app/(classic)/track/error.tsx` | |
| Polymorphic `as` prop | `components/advanced/panel.tsx:15`, props type `:13`; used `app/(classic)/dashboard/page.tsx:39` `<Panel as="section">` | Props typed for the chosen element |
| Feature-folder architecture + barrels | `features/quote/index.ts`, `features/track/index.ts`, `features/dashboard/index.ts`, `components/advanced/index.ts`, `lib/api/index.ts` (isomorphic only — server modules `spring.ts`/`session.ts` imported by path so they never reach the client bundle) | |

## UI notes

Classic look: `PageBanner`, `section.services`, `.section-title h3 > span`, Bootstrap form classes, orange via `--ps-orange`; styles in `components/advanced/advanced.css` (all scoped under `.ps-home`). Mobile-first (checked at 375 and 1440, no horizontal overflow); mobile-only sticky total bar; `prefers-reduced-motion` disables shimmer/spinners/transitions and smooth scroll. WhatsApp CTAs on every estimate, cart, machine card, enquiry result, tracking and error page. Nav: "Estimate" and "Track" added to the classic header (`components/sites/kakadelaser/site-header.tsx:11`) and footer (`site-footer.tsx:17`).

## Estimator rounding rule (shared with PHP / Spring / JSP)

Each breakdown line is rounded half-up to 2 dp; `perPart` = sum of rounded lines; `subtotal = round2(perPart × qty)`; `gst = round2(subtotal × gst%/100)`; `total = subtotal + gst` (`lib/api/estimate.ts:14` `round2`, `:49` `computeEstimate`). A thickness between rate bands (e.g. 3.005 mm) returns "No rate band for this thickness". Reference case — MS 2 mm, 500 × 300, cut 1600, 4 pierces, 2 bends, powder coat, qty 10 → per part 248.63, subtotal 2486.30, GST 447.53, total ₹2933.83 (matches both Spring and the TS fallback).

## How to run and test

1. Optional backends: MySQL (`C:\xampp\mysql_start.bat`), Spring Boot `services/spring-api` on :8081, Node `services/node-api` on :4000. Without them everything still works in offline mode.
2. `npm install` then `npm run dev` (port 3001 in this project) — or `npm run build && npm start` to see SSG/ISR for real.
3. `/quote`: change inputs (debounced estimate, badge shows Live or Offline), presets, "View breakdown" (portal modal, Esc closes), "Save estimate" (persists; reload or open `/track` → saved-estimate note), quantity 5000 → virtualised parts list, filter "sheet 2" (transition), "Compare materials" (lazy chart), enquiry form (submit empty → validation; valid → stored #id with Node up, WhatsApp-only otherwise).
4. `/track?orderNo=PSL-DEMO-001&phone=9000000001` → streamed order card (Live with Spring, demo fallback offline); a wrong number → "No order matches".
5. `/dashboard` → login gate. Sign in with the seed admin from `services/db/SEED_CREDENTIALS.md` (Spring must be up) → production board, badge "Live (STOMP /topic/work-orders)" or "Polling every 15 s"; Log out clears the cookie.
6. Estimator contract test (dev server running): `node scripts/test-estimate.mjs` — reference case, 3.005 mm → 400, oversize → 400.
7. Profiler output: open DevTools console (Verbose level) in dev and type in the calculator — `[Profiler] QuoteCalculator update: … ms`.
8. `npx next typegen && npm run typecheck && npm run build` — build table shows `/quote 1h` (ISR), `/track` and `/dashboard` as `ƒ` (dynamic).
