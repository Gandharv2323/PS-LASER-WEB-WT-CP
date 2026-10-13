# PS Laser Customer Portal (CS3111 Unit II: React)

This is a Vite + React 19 single-page app written in plain JavaScript/JSX. Customers of PS Laser (sheet-metal / CNC laser job shop, Velu, Pune) can use it to:

- browse the machine catalogue and open a detail page for each machine
- get an indicative laser-cutting estimate
- collect machines, services and estimates in a quote cart
- send the cart on WhatsApp or as an enquiry
- sign in and see their saved quotes
- track an order

The portal uses **React Router 7**, **Redux Toolkit** (with one classic `connect()` example) and **Flux** (for toast notifications).

Every Unit II syllabus topic is mapped to a file and line in [`docs/syllabus/unit-2-react.md`](../../docs/syllabus/unit-2-react.md).

## Run

```bash
cd services/react-portal
npm install
npm run dev        # http://localhost:5173 (strict port; whitelisted in the API CORS config)
npm run build      # production build -> dist/
npm run preview    # serve dist/ on :5173
npx oxlint src     # lint
```

Optional backends (see `services/CONTRACT.md`):

| API | Default | Used for |
|---|---|---|
| Spring Boot | `http://127.0.0.1:8081` | auth (JWT), machines, services, materials, `POST /api/quotes/estimate`, `POST /api/quotes`, `GET /api/me/quotes`, `GET /api/work-orders/track` |
| Node/Express | `http://127.0.0.1:4000` | `POST /api/enquiries` (JSON or multipart with drawing), `GET /api/catalogue` (2nd source for machines/services) |

To use other hosts, copy `.env.example` to `.env.local` and set `VITE_SPRING_URL` / `VITE_NODE_URL`. The defaults use `127.0.0.1` because on Windows a refused `localhost` connection takes about 2.3 s to fail.

### Offline demo mode

If an API can't be reached, the catalogue, materials, estimate, tracking and my-quotes screens fall back to **offline demo data** in `src/lib/mockData.js`. Each screen shows a yellow "Offline demo data" banner when this happens:

- Machine and service facts come from `src/lib/pslaser/data.ts`.
- The SAMPLE rate card comes from `services/db/seed.sql`.

The estimate is then calculated in the browser by `src/lib/estimate.js`, which uses the same formula as the APIs. Two things never fall back to fake data:

- **Enquiries.** "Submit enquiry" reports that nothing was sent, and "Send all on WhatsApp" still works.
- **Login.** When Spring is offline, the login page offers a clearly labelled "offline demo session" so the protected route can still be demonstrated.

Demo order to track: `PSL-DEMO-001`, phone `9000000001`. The seed admin login is in `services/db/SEED_CREDENTIALS.md`.

## Structure

```
src/
  main.jsx               createRoot + <Provider store> + <RouterProvider>
  router.jsx             route table (nested layout, loader, lazy, protected, 404)
  index.css              plain global CSS (PS Laser orange #EF7D00, Roboto)
  components/            Layout (+ .module.css), ClockBanner (class lifecycle), ErrorBoundary (class),
                         MachineCard (+ .module.css), Card (composition), MaterialPicker (child->parent),
                         TextField (forwardRef), BreakdownTable (inline styles), RecentlyViewed (connect HOC),
                         ToastContainer (Flux view), ProtectedRoute, RouteError, ApiStatus, OfflineBadge
  pages/                 Dashboard, Machines, MachineDetail, Estimate, Cart, Login, Register, MyQuotes, Track, NotFound
  store/                 RTK store, cartSlice, authSlice, catalogueSlice, classic/recentlyViewed (hand-written reducer)
  flux/                  Dispatcher, EventEmitter, ToastActions, ToastStore
  lib/                   api (fetch + fallback), normalize, mockData, estimate, config, validateEstimate, cartMessage, propCheck
```

## Notes

- **Flux.** Facebook's `flux` package (4.0.4, archived) declares `peerDependencies: react ^15 || ^16 || ^17`, so it won't install next to React 19. `src/flux/Dispatcher.js` re-implements its small Dispatcher API (`register`, `unregister`, `waitFor`, `dispatch`, `isDispatching`) and explains Flux vs Redux in a diagram comment.
- **PropTypes.** React 19 ignores `propTypes` and keeps `defaultProps` only for class components. `src/lib/propCheck.js` runs `PropTypes.checkPropTypes` by hand in development. It also provides a `reactNode` validator, because `prop-types`' own `node` check rejects React 19 elements.
- **Persistence.**
  - The JWT is held in Redux memory and mirrored to `sessionStorage`, so it lasts for the tab only.
  - The quote cart is mirrored to `localStorage`.
- **StrictMode.** In development, StrictMode mounts components twice, so `ClockBanner` logs `constructor` / `componentDidMount` / `componentWillUnmount` / `componentDidMount`. This is expected.
