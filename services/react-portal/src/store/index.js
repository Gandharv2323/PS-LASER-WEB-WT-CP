// REDUX store. configureStore = createStore + combineReducers + thunk middleware + devtools.
//
//   Classic equivalent (Redux <= 4 style, kept for comparison):
//     import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
//     import { thunk } from 'redux-thunk'
//     const store = createStore(combineReducers({ cart, auth, catalogue, recent }), applyMiddleware(thunk))
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice.js'
import authReducer, { persistAuth } from './authSlice.js'
import catalogueReducer from './catalogueSlice.js'
import recentlyViewedReducer from './classic/recentlyViewed.js'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    catalogue: catalogueReducer,
    recent: recentlyViewedReducer, // plain hand-written reducer, works alongside slices
  },
})

// store.subscribe runs after every dispatch: persist the cart (localStorage) and the
// JWT session (sessionStorage) only when those slices actually changed.
let prev = store.getState()
store.subscribe(() => {
  const next = store.getState()
  if (next.cart !== prev.cart) {
    try {
      localStorage.setItem('pslaser.cart', JSON.stringify(next.cart.items))
    } catch { /* storage unavailable: cart still lives in Redux memory */ }
  }
  if (next.auth.token !== prev.auth.token) persistAuth(next.auth)
  prev = next
})
