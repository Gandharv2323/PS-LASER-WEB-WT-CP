// REACT ROUTER (v7, data router).
//  * nested routes: every page renders inside <Layout/>'s <Outlet/>
//  * index route, dynamic segment (:slug) with a loader, errorElement
//  * pathless layout route <ProtectedRoute/> guarding /my-quotes
//  * code-splitting with `lazy` for /track (loaded only when first visited)
//  * catch-all `*` 404 route
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RouteError from './components/RouteError.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Machines from './pages/Machines.jsx'
import MachineDetail, { machineLoader } from './pages/MachineDetail.jsx'
import Estimate from './pages/Estimate.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MyQuotes from './pages/MyQuotes.jsx'
import NotFound from './pages/NotFound.jsx'

export const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <p className="container page muted">Loading PS Laser portal…</p>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'machines', element: <Machines /> },
      { path: 'machines/:slug', element: <MachineDetail />, loader: machineLoader, errorElement: <RouteError /> },
      { path: 'estimate', element: <Estimate /> },
      { path: 'cart', element: <Cart /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        element: <ProtectedRoute />, // no path: only guards its children
        children: [{ path: 'my-quotes', element: <MyQuotes /> }],
      },
      {
        path: 'track',
        // lazy(): Vite emits Track as a separate JS chunk, fetched on first navigation.
        lazy: async () => ({ Component: (await import('./pages/Track.jsx')).default }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
