// REDUX TOOLKIT — auth slice. The JWT issued by Spring Boot (POST /api/auth/login) lives in
// Redux state (memory) and is mirrored to sessionStorage so a page refresh keeps you signed in
// for this tab only (closing the tab logs you out). It is never put in localStorage or a URL.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../lib/api.js'

const SESSION_KEY = 'pslaser.auth'

const loadSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

export const persistAuth = (auth) => {
  try {
    if (auth.token) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: auth.token, user: auth.user }))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* private mode: memory only */ }
}

const describe = (e) =>
  e.offline ? 'Login server (Spring Boot :8081) is offline. Start services/spring-api and try again.' : e.message

/** createAsyncThunk dispatches auth/login/pending, /fulfilled, /rejected automatically. */
export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.login(email, password)
  } catch (e) {
    return rejectWithValue({ message: describe(e), fieldErrors: e.fieldErrors ?? null, status: e.status ?? 0, offline: Boolean(e.offline) })
  }
})

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await api.register(payload)
  } catch (e) {
    return rejectWithValue({ message: describe(e), fieldErrors: e.fieldErrors ?? null, status: e.status ?? 0, offline: Boolean(e.offline) })
  }
})

const saved = loadSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: saved?.token ?? null,
    user: saved?.user ?? null,
    status: 'idle', // idle | loading | failed
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
    // Offered on the Login page ONLY when Spring Boot is unreachable, so the protected
    // route can still be demonstrated. The UI flags it as an offline demo session.
    startOfflineDemo(state) {
      state.token = 'offline-demo-session'
      state.user = { id: 0, name: 'Demo Customer', email: 'demo@offline.invalid', role: 'customer', offlineDemo: true }
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const fulfilled = (state, action) => {
      state.status = 'idle'
      state.token = action.payload.token
      state.user = action.payload.user
    }
    const rejected = (state, action) => {
      state.status = 'failed'
      state.error = action.payload ?? { message: action.error.message }
    }
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)
  },
})

export const { logout, clearAuthError, startOfflineDemo } = authSlice.actions
export default authSlice.reducer

export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsLoggedIn = (state) => Boolean(state.auth.token)
