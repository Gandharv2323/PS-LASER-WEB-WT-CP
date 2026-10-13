// =====================================================================================
//  CLASSIC REDUX (pre-Toolkit) — "recently viewed machines"
// =====================================================================================
// Before Redux Toolkit you wrote three things by hand for every feature:
//   1. action TYPE constants   2. action CREATOR functions   3. a pure REDUCER with a switch
// and the store was made with `createStore(rootReducer, applyMiddleware(...))`.
// RTK's createSlice (see ../cartSlice.js) generates 1 + 2 for you and uses Immer so you can
// "mutate" safely. This file keeps the old style on purpose so both can be compared; it is
// plugged into the same RTK store (configureStore accepts any plain reducer) and read by a
// class component through the connect() HOC (src/components/RecentlyViewed.jsx).
// =====================================================================================

// 1. Action types
export const VIEW_MACHINE = 'recent/VIEW_MACHINE'
export const CLEAR_RECENT = 'recent/CLEAR'

// 2. Action creators
export const viewMachine = (machine) => ({
  type: VIEW_MACHINE,
  payload: { slug: machine.slug, shortName: machine.shortName, image: machine.image },
})
export const clearRecent = () => ({ type: CLEAR_RECENT })

// 3. Reducer — must be PURE: never mutate `state`, always return a new object.
const initialState = { items: [] }
const MAX = 4

export default function recentlyViewedReducer(state = initialState, action) {
  switch (action.type) {
    case VIEW_MACHINE: {
      const rest = state.items.filter((m) => m.slug !== action.payload.slug)
      return { ...state, items: [action.payload, ...rest].slice(0, MAX) }
    }
    case CLEAR_RECENT:
      return { ...state, items: [] }
    default:
      return state
  }
}
