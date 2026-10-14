# Unit II: React, mapped to the PS Laser Customer Portal

**Project:** `services/react-portal/` (Vite + React 19, plain JavaScript/JSX, React Router 7, Redux Toolkit + react-redux 9, Flux)

**Port:** 5173

**Purpose:** a customer portal for PS Laser. Customers can browse the machine catalogue, get a laser-cutting estimate, build a quote cart, send it on WhatsApp or as an enquiry, sign in, see their quotes and track an order.

**Backends:** Spring Boot (:8081) and Node (:4000), per `services/CONTRACT.md`. If either API is down, the portal falls back to sample data from `src/lib/mockData.js` and flags it in the UI as "Offline demo data".

Unit V (Advanced React: TypeScript, SSR, performance) lives in the Next.js app at the repo root. This portal is deliberately plain JS so the two can be compared.

All paths below are relative to `services/react-portal/src/`. Line numbers are from the delivered version.

## Topic map

| Syllabus topic | Where | What it shows |
|---|---|---|
| **Introduction to React** | `main.jsx:1-20` | `createRoot(...).render(...)` mounts the component tree into `#root`. `<StrictMode>`, `<Provider store>` and `<RouterProvider>` wrap the app. |
| | `../package.json`, `../vite.config.js` | Vite toolchain, React 19 dependencies, dev server pinned to port 5173. |
| **React component** (function) | `pages/*.jsx`, `components/Card.jsx:8-21` | Every page is a function component that returns JSX. Small, reusable components (`Card`, `MachineCard`, `OfflineBadge`, `TextField`). |
| **React component** (class) | `components/ClockBanner.jsx:13-82`, `components/ErrorBoundary.jsx:8-38`, `components/RecentlyViewed.jsx:10-33` | Three `class ... extends Component` examples. |
| **JSX** | `pages/Dashboard.jsx:19-25` | The same element written with `createElement(...)` (no JSX), plus a comment showing what JSX compiles to. |
| | `pages/Dashboard.jsx:40` | Embedded expressions `{...}` with a ternary. |
| | `pages/Dashboard.jsx:73-79` | Conditional rendering with `? :` and `&&`. |
| | `pages/Dashboard.jsx:35` | Fragment `<>...</>`. |
| | `components/OfflineBadge.jsx:5` | `return null` renders nothing. |
| **Render function** | `components/ClockBanner.jsx:67-81` | Class `render()`: a pure function of props + state. |
| | `components/ErrorBoundary.jsx:21-37` | A `render()` that chooses between the fallback UI and `children`. |
| **Component API** | `components/ClockBanner.jsx:14-20` | `constructor(props)` with `super(props)`, initial `this.state`, binding a handler. |
| | `components/ClockBanner.jsx:57`, `:61` | `setState` with an updater function. |
| | `components/ClockBanner.jsx:62-64` | Comment explaining when `forceUpdate()` would be needed. |
| | `components/ClockBanner.jsx:17` | `createRef()`. |
| | `components/ClockBanner.jsx:85` | `defaultProps` (still honoured on class components in React 19). |
| | `components/ErrorBoundary.jsx:9` | State as a class field. |
| **Component lifecycle** | `components/ClockBanner.jsx:23-27` | `componentDidMount` (start `setInterval`). |
| | `:31-35` | `shouldComponentUpdate` (skip the render when the shown text is unchanged or paused). |
| | `:38-46` | `componentDidUpdate` (compare with `prevState`, logs `[ClockBanner]` in the console). |
| | `:49-52` | `componentWillUnmount` (`clearInterval`). |
| | `components/ErrorBoundary.jsx:11-17` | `static getDerivedStateFromError` and `componentDidCatch`. |
| | `components/ClockBanner.jsx:89-104` | `SessionTimer`: the hooks version (`useEffect` + cleanup) for comparison. |
| **State** | `components/MachineCard.jsx:12` | `useState` drives the hover state. |
| | `pages/Estimate.jsx:38-41` | Form values, errors, result and submitting flag. |
| | `pages/Register.jsx:24-31` | `touched`, server errors, and errors derived from state on each render. |
| | `components/ClockBanner.jsx:16` | Class state. |
| | `store/*` | Global state in Redux (see Redux below). |
| **Props** | `components/MachineCard.jsx:9-11`, `:49-63` | Props are destructured with defaults (`inCart = false`, `specsToShow = 2`). `propTypes` uses `PropTypes.shape` / `arrayOf` / `isRequired`. |
| | `lib/propCheck.js:8-28` | React 19 ignores `propTypes`, so `usePropTypes` runs `PropTypes.checkPropTypes` in development. `reactNode` replaces `PropTypes.node`, which rejects React 19 elements. |
| **Component composition** | `components/Card.jsx:1-21` | A generic card composed with `children` plus named slots (`media`, `actions`) passed as JSX props. |
| | `pages/Dashboard.jsx:56-84` | Used with different children and slots. |
| | `components/Layout.jsx:110-112` | `ErrorBoundary` wraps `<Outlet/>`. |
| | `components/Layout.jsx:66-145` | The app shell is composed from `ClockBanner`, `ToastContainer`, `SessionTimer` and others. |
| **Pass data parent → child** | `pages/Machines.jsx:75-82` | Each `machine` object and an `inCart` flag go down to `MachineCard` as props. |
| | `pages/Estimate.jsx:136` | `materials` and `value` go down to `MaterialPicker`. |
| | `pages/Dashboard.jsx:56-63` | `title`, `eyebrow` and `actions` go down to `Card`. |
| **Pass data child → parent** | `components/MaterialPicker.jsx:17`, `:32` | The child calls `onChange(code)`. |
| | `pages/Estimate.jsx:57-60` | The parent `handleMaterial` updates its form state. |
| | `pages/Machines.jsx:34-37` + `components/MachineCard.jsx:43` | `onAdd(machine)` callback prop. |
| **Component styling** | `index.css` (imported at `main.jsx:12`) | Plain global CSS. |
| | `components/MachineCard.module.css`, `components/Layout.module.css` | CSS Modules: hashed class names, `composes:` at `Layout.module.css:97`. Imported as `styles` at `MachineCard.jsx:6`. |
| | `components/BreakdownTable.jsx:8-12`, `:36-38`, `:56` | Inline style objects, including a computed bar width. |
| | `components/MachineCard.jsx:15` | Conditional class names. |
| | `components/Layout.jsx:64` | `NavLink` `className` as a function of `isActive`. |
| | `components/MaterialPicker.jsx:30-31`, `components/ClockBanner.jsx:73` | Other conditional class names. |
| **Forms: controlled** | `pages/Estimate.jsx:50-55`, `:134-157` | Estimate form: one `handleChange` for every input (`e.target.name/value/checked`). |
| | `pages/Register.jsx:33-58` | Register form with blur-touched validation. |
| | `pages/Cart.jsx` (enquiry form) | Controlled enquiry form. |
| | `pages/Machines.jsx:62-68` | Controlled search box. |
| **Forms: uncontrolled** | `pages/Login.jsx:11-12`, `:31-33`, `:55` | `useRef` plus `defaultValue`; values are read on submit. |
| | `pages/Cart.jsx:28` | Uncontrolled `<input type="file">` read with `fileRef.current.files[0]`. |
| **Forms: validation** | `lib/validateEstimate.js` | Pure validation function using the contract rules (bed 3000×1500, material max thickness). |
| | `pages/Register.jsx:11-20` | E-mail regex, phone, password strength and confirmation. |
| | `pages/Cart.jsx` (`validate`) | Phone, e-mail, drawing type and size (≤ 10 MB). |
| | `pages/Register.jsx:51`, `pages/Estimate.jsx` (catch block) | Server `fieldErrors` from Spring are merged into the same error map. |
| **Forms: submit** | `pages/Estimate.jsx:68-88`, `pages/Cart.jsx` (`handleSubmit`), `pages/Login.jsx:26-45` | `e.preventDefault()`, async submit and loading states. |
| **Events** | All `onClick` / `onChange` / `onSubmit` handlers | Synthetic events. |
| | `pages/Estimate.jsx:69` | `preventDefault`. |
| | `components/Layout.jsx:41-52` | Keyboard: Escape closes the menu and returns focus to the toggle. |
| | `pages/Estimate.jsx:134` | Keyboard: Escape resets the form. |
| | `pages/Machines.jsx:67` | Keyboard: Escape clears the search. |
| | `pages/Track.jsx` | Keyboard: Escape clears the form; Enter submits. |
| | `components/MaterialPicker.jsx:11-18` | Arrow keys move the selection. |
| | `components/MachineCard.jsx:20-21` | Mouse: `onMouseEnter` / `onMouseLeave` show the hover overlay. |
| **Refs** | `components/TextField.jsx:9-31` | `forwardRef`. |
| | `pages/Estimate.jsx:44-48`, `:74` | Callback refs into a `useRef` map; the first invalid field gets focus. |
| | `pages/Login.jsx:20`, `:42-43` | Focus on mount; select and focus the password after a failed login. |
| | `components/ClockBanner.jsx:17` | `createRef` in a class. |
| | `pages/Cart.jsx:28` | File input ref. |
| | `components/Layout.jsx:28` | Ref on the toggle button. |
| **Keys** | `pages/Machines.jsx:75-82` | `key={m.slug}`. |
| | `components/MachineCard.jsx:34-35` | `key={spec}`. |
| | `pages/Machines.jsx:90` | Keyed `<Fragment key>` that returns a `<dt>` + `<dd>` pair. |
| | `components/ToastContainer.jsx:19` | `key={t.id}`. |
| | `pages/Track.jsx:90` | Database id, with a fallback for offline events (comment explains why not an index alone). |
| **Router** | `router.jsx:20-48` | `createBrowserRouter` with a nested layout route and `index` route. |
| | `router.jsx:30` | Dynamic `:slug` with a `loader` and `errorElement`. |
| | `router.jsx:35-38` | Pathless `ProtectedRoute` guarding `/my-quotes`. |
| | `router.jsx:39-43` | `lazy` code-split `/track` (separate chunk `Track-*.js` in the build). |
| | `router.jsx:44` | `*` 404 route. |
| | `components/Layout.jsx:92`, `:111`, `:142` | `<NavLink>` active styles, `<Outlet/>`, `<ScrollRestoration/>`. |
| | `components/Layout.jsx:34` | `useNavigation()` progress bar. |
| | `pages/MachineDetail.jsx:15-18`, `:22-23` | `useParams()`, `useLoaderData()`, and `throw data(..., {status:404})`. |
| | `pages/MachineDetail.jsx:66`, `:69`, `components/Layout.jsx:60`, `pages/Login.jsx:39` | Programmatic `navigate()`: with state, `navigate(-1)`, and redirect after login. |
| | `components/ProtectedRoute.jsx:10` | `<Navigate replace state={{from}}>`. |
| | `pages/Machines.jsx:22`, `:54` | `useSearchParams` category filter. |
| | `components/RouteError.jsx` | `useRouteError` / `isRouteErrorResponse`. |
| | `pages/NotFound.jsx` | 404 page. |
| **Flux** | `flux/Dispatcher.js:1-33` | ASCII diagram and Flux vs Redux comparison. |
| | `flux/Dispatcher.js:35-98` | Dispatcher: `register` / `unregister` / `waitFor` / `dispatch` / `isDispatching`. Self-written because `flux@4.0.4` only supports React ≤ 17. |
| | `flux/ToastActions.js` | Action types and action creators. |
| | `flux/ToastStore.js:11-46` | Store extends `EventEmitter`, registers with the dispatcher, handles actions in a `switch`, emits `change`. |
| | `flux/EventEmitter.js` | Minimal browser `EventEmitter`. |
| | `components/ToastContainer.jsx:9-26` | View: `addChangeListener` on mount, `removeChangeListener` on unmount; Dismiss calls an action creator. |
| | e.g. `pages/Machines.jsx:36` | Toasts fired from many pages. |
| **Redux (Toolkit)** | `store/index.js:13-20` | `configureStore` with four reducers. |
| | `store/index.js:22-34` | `store.subscribe` persists the cart and JWT. |
| | `store/cartSlice.js:14-50` | `createSlice` with `prepare` + `nanoid`, Immer "mutations", and selectors. |
| | `store/authSlice.js:28-42`, `:71-85` | `createAsyncThunk` login/register against Spring with `rejectWithValue`. The JWT is kept in memory and mirrored to `sessionStorage` (`:17-22`). |
| | `store/catalogueSlice.js:7-17` | `createAsyncThunk` with `condition` to dedupe. |
| | `store/catalogueSlice.js:34-52` | `extraReducers` for pending / fulfilled / rejected. |
| | `components/Layout.jsx:30-32`, `pages/Cart.jsx:19`, `:138-142` | `useSelector` / `useDispatch`. |
| | `pages/Login.jsx:37` | `dispatch(thunk).unwrap()`. |
| **Redux (classic)** | `store/classic/recentlyViewed.js:1-41` | Hand-written action type constants, action creators and a pure `switch` reducer (no Immer). |
| | `store/index.js:1-6` | Comment showing the legacy `createStore` / `combineReducers` / `applyMiddleware` equivalent. |
| | `components/RecentlyViewed.jsx:39-43` | `connect(mapStateToProps, mapDispatchToProps)(ClassComponent)` higher-order component. |
| | `pages/MachineDetail.jsx:29` | The classic action creator dispatched with the modern hook. |

## Features (all real PS Laser flows)

| Feature | API (live) | Offline fallback |
|---|---|---|
| Machines grid and detail (specs, WhatsApp quote button, add to cart) | Spring `GET /api/machines`, `/api/machines/{slug}`; Node `GET /api/catalogue` if Spring is down | `mockData.js` (banner shown) |
| Services list | Spring `GET /api/services`, then Node catalogue | mock |
| Estimate with breakdown table and "Indicative estimate — final quote on WhatsApp" note | Spring `POST /api/quotes/estimate` | `lib/estimate.js` (same formula, SAMPLE rates, tagged "offline demo calc") |
| Quote cart: add/remove/qty, "Send all on WhatsApp" (composed message to 917719976990), "Submit enquiry" | Node `POST /api/enquiries` (JSON, or multipart with `drawing`); each estimate is also saved with Spring `POST /api/quotes` | WhatsApp only; the UI says nothing was sent |
| Login / Register (JWT) | Spring `POST /api/auth/login`, `/register` | Clearly labelled "offline demo session" button (only when Spring is unreachable) |
| My quotes (protected) | Spring `GET /api/me/quotes` with `Authorization: Bearer` | mock quotes, flagged |
| Track order | Spring `GET /api/work-orders/track?orderNo&phone` | `PSL-DEMO-001` / `9000000001` |
| Backend status pills | `/actuator/health`, Node `/api/health` | — |

## Run and test

```bash
cd services/react-portal
npm install
npm run dev            # http://localhost:5173
npm run build          # must pass
```

1. Open `/`. The status pills show whether Spring and Node are reachable. The black bar at the top is the class-component clock. Open DevTools and you'll see the `[ClockBanner] constructor/componentDidMount/...` logs (twice in dev because of StrictMode). **Pause clock** triggers `componentDidUpdate`.
2. Go to `/machines`.
   - Hover a card to see the CSS Module hover class and overlay.
   - Filter by category (the URL `?category=` changes).
   - **Add to quote cart**: a green Flux toast appears and the cart badge increments (Redux).
3. Open a machine to see `/machines/:slug` (loader + `useParams`). `/machines/xyz` shows the route error page; `/anything` shows the 404 page.
4. Go to `/estimate`.
   - Enter thickness 20 for Mild Steel and submit. An error appears and focus jumps to the field.
   - Enter 2 mm and submit. You get the breakdown table (Spring, or the offline calculation, which is flagged).
   - **Add to quote cart** takes you to `/cart`.
5. In `/cart`, change quantity or remove a line; the cart survives a reload. **Send all on WhatsApp** opens a composed message. **Submit enquiry** validates the phone number and posts to Node.
6. Open `/my-quotes` while signed out. You are redirected to `/login` with focus in the e-mail box. Sign in with the seed admin from `services/db/SEED_CREDENTIALS.md`; you return to `/my-quotes`.
7. Go to `/track` (lazy chunk). Enter `PSL-DEMO-001` and `9000000001`, then press Enter to see the status steps and history. Press Esc to clear.

### Verified (14 Oct 2026)

These checks were run in the built-in browser at 375 px and 1440 px, with Spring live and Node offline at the time:

- Live catalogue.
- Live estimate (MS 2 mm, 500×300, qty 50 gave a total of ₹12,545.17).
- Seed-admin login leading to the protected `/my-quotes` page.
- Live order tracking.
- Validation and focus behaviour.
- 404 page and route error page.
- Cart add/remove persisted in Redux and `localStorage`.
- Flux toasts.
- ClockBanner lifecycle logs.
- Offline enquiry error path.

`npm run build` and `oxlint` pass. The only console errors were `net::ERR_CONNECTION_REFUSED` for whichever backend was down (the browser always logs these; the app handles them) and one expected 404 for the unknown-slug test.
