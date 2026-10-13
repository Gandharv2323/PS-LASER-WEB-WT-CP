// INTRODUCTION TO REACT — entry point.
// createRoot() attaches React to <div id="root"> and render() draws the component tree.
// <Provider> makes the Redux store available to every component; <RouterProvider> renders
// whichever route matches the URL. StrictMode (dev only) mounts components twice to expose
// unsafe side effects — that is why ClockBanner logs constructor/didMount twice in dev.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store/index.js'
import { router } from './router.jsx'
import './index.css' // plain global CSS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
