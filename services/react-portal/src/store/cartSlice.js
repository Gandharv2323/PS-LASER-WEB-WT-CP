// REDUX TOOLKIT — quote cart slice.
// createSlice generates action types + action creators from the reducer map, and lets us
// write "mutating" code that Immer turns into immutable updates.
import { createSlice, nanoid } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('pslaser.cart') ?? '[]')
  } catch {
    return []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addItem: {
      // `prepare` keeps the reducer pure: random ids are created in the action creator.
      prepare(item) {
        return { payload: { id: nanoid(), qty: 1, ...item } }
      },
      reducer(state, action) {
        const { kind, ref } = action.payload
        // Machines/services are unique lines (bump qty); every estimate is its own line.
        const existing = kind !== 'estimate' && state.items.find((i) => i.kind === kind && i.ref === ref)
        if (existing) existing.qty += 1
        else state.items.push(action.payload)
      },
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
    updateQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) item.qty = Math.max(1, Math.min(9999, Number(action.payload.qty) || 1))
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions
export default cartSlice.reducer

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + (i.kind === 'estimate' ? 1 : i.qty), 0)
export const selectEstimateTotal = (state) =>
  state.cart.items.filter((i) => i.kind === 'estimate').reduce((sum, i) => sum + Number(i.estimate?.total ?? 0), 0)
