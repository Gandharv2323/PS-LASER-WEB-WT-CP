// REDUX TOOLKIT — catalogue slice with createAsyncThunk.
// Loads machines + services + materials from Spring Boot in parallel. Each list records
// whether it came from the live API or the offline demo fallback (shown as a badge in the UI).
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../lib/api.js'

export const fetchCatalogue = createAsyncThunk(
  'catalogue/fetch',
  async () => {
    const [machines, services, materials] = await Promise.all([api.getMachines(), api.getServices(), api.getMaterials()])
    return { machines, services, materials }
  },
  {
    // `condition` cancels the thunk if data is already loaded/loading (no duplicate requests).
    condition: (_arg, { getState }) => getState().catalogue.status === 'idle',
  },
)

const catalogueSlice = createSlice({
  name: 'catalogue',
  initialState: {
    machines: [],
    services: [],
    materials: [],
    source: { machines: null, services: null, materials: null }, // 'api' | 'mock'
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    resetCatalogue: (state) => {
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogue.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchCatalogue.fulfilled, (state, { payload }) => {
        state.status = 'succeeded'
        for (const key of ['machines', 'services', 'materials']) {
          state[key] = payload[key].data
          state.source[key] = payload[key].source
        }
      })
      .addCase(fetchCatalogue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { resetCatalogue } = catalogueSlice.actions
export default catalogueSlice.reducer

export const selectMachines = (s) => s.catalogue.machines
export const selectMaterials = (s) => s.catalogue.materials
export const selectServices = (s) => s.catalogue.services
export const selectCatalogueStatus = (s) => s.catalogue.status
export const selectIsMock = (key) => (s) => s.catalogue.source[key] === 'mock'
