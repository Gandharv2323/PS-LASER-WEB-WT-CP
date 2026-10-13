// Tiny fetch wrapper for the two backends in services/CONTRACT.md:
//   Spring Boot  http://localhost:8081  (auth, machines, services, materials, quotes, work orders)
//   Node/Express http://localhost:4000  (enquiries, catalogue)
// Every call has a timeout. If a backend is unreachable we throw OfflineError and remember
// that for 30 s, so the UI can fall back to OFFLINE DEMO DATA without hammering a dead port.

import { SPRING_URL, NODE_URL } from './config.js'
import {
  mockMachines, mockServices, mockMaterials, mockWorkOrders, mockQuotes,
} from './mockData.js'
import { estimateLocally } from './estimate.js'
import { normalizeMachine, normalizeMaterial, normalizeService, normalizeTrack, normalizeQuote } from './normalize.js'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.fieldErrors = body?.fieldErrors ?? null
  }
}

export class OfflineError extends Error {
  constructor(base) {
    super(`${base} is not reachable`)
    this.name = 'OfflineError'
    this.offline = true
  }
}

const OFFLINE_TTL_MS = 30_000
const offlineUntil = new Map() // base URL -> timestamp

export function isMarkedOffline(base) {
  return (offlineUntil.get(base) ?? 0) > Date.now()
}

export async function request(base, path, { method = 'GET', body, token, form, timeoutMs = 5000 } = {}) {
  if (isMarkedOffline(base)) throw new OfflineError(base)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = { Accept: 'application/json' }
  if (body !== undefined && !form) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(base + path, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    })
  } catch {
    offlineUntil.set(base, Date.now() + OFFLINE_TTL_MS)
    throw new OfflineError(base)
  } finally {
    clearTimeout(timer)
  }
  offlineUntil.delete(base)

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }
  if (!res.ok) throw new ApiError(data?.message || data?.error || `HTTP ${res.status}`, res.status, data)
  return data
}

/** Client errors (bad input / auth) must reach the user; anything else may fall back to demo data. */
const isClientError = (e) => e instanceof ApiError && [400, 401, 403, 409, 422].includes(e.status)

/** Run the live call; on OfflineError / 404 / 5xx return the mock instead and flag source:'mock'. */
export async function withFallback(live, mock) {
  try {
    return { data: await live(), source: 'api' }
  } catch (e) {
    if (isClientError(e)) throw e
    return { data: await mock(), source: 'mock', reason: e.message }
  }
}

const list = (d) => (Array.isArray(d) ? d : d?.content ?? d?.items ?? d?.data ?? [])

// ---------- Catalogue ----------
// Order of preference: Spring Boot -> Node /api/catalogue (same MySQL data) -> offline mock.
// Node counts as a live source ('api'); only the mock is flagged as offline demo data.
let nodeCatalogue = null
async function fromNodeCatalogue() {
  nodeCatalogue ??= request(NODE_URL, '/api/catalogue').catch((e) => {
    nodeCatalogue = null
    throw e
  })
  return nodeCatalogue
}

async function machinesLive() {
  try {
    return list(await request(SPRING_URL, '/api/machines')).map(normalizeMachine)
  } catch (e) {
    if (isClientError(e)) throw e
    const cat = await fromNodeCatalogue()
    const m = list(cat?.machines)
    if (!m.length) throw e
    return m.map(normalizeMachine)
  }
}

export const getMachines = () => withFallback(machinesLive, () => mockMachines)

export const getMachine = (slug) =>
  withFallback(
    async () => {
      try {
        return normalizeMachine(await request(SPRING_URL, `/api/machines/${encodeURIComponent(slug)}`))
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null
        const all = await machinesLive()
        return all.find((m) => m.slug === slug) ?? null
      }
    },
    () => mockMachines.find((m) => m.slug === slug) ?? null,
  )

export const getServices = () =>
  withFallback(
    async () => {
      try {
        return list(await request(SPRING_URL, '/api/services')).map(normalizeService)
      } catch (e) {
        const s = list((await fromNodeCatalogue())?.services)
        if (!s.length) throw e
        return s.map(normalizeService)
      }
    },
    () => mockServices,
  )

export const getMaterials = () =>
  withFallback(
    async () => list(await request(SPRING_URL, '/api/materials')).map(normalizeMaterial),
    () => mockMaterials,
  )

// ---------- Estimate & quotes ----------
export const postEstimate = (input) =>
  withFallback(
    () => request(SPRING_URL, '/api/quotes/estimate', { method: 'POST', body: input }),
    () => estimateLocally(input),
  )

export const saveQuote = (input) => request(SPRING_URL, '/api/quotes', { method: 'POST', body: input })

export const getMyQuotes = (token) =>
  withFallback(
    async () => list(await request(SPRING_URL, '/api/me/quotes', { token })).map(normalizeQuote),
    () => mockQuotes,
  )

// ---------- Auth ----------
export const login = (email, password) =>
  request(SPRING_URL, '/api/auth/login', { method: 'POST', body: { email, password } })

export const register = (payload) =>
  request(SPRING_URL, '/api/auth/register', { method: 'POST', body: payload })

// ---------- Tracking ----------
export const trackOrder = (orderNo, phone) =>
  withFallback(
    async () =>
      normalizeTrack(
        await request(SPRING_URL, `/api/work-orders/track?orderNo=${encodeURIComponent(orderNo)}&phone=${encodeURIComponent(phone)}`),
      ),
    () => {
      const o = mockWorkOrders.find((w) => w.orderNo.toUpperCase() === orderNo.trim().toUpperCase() && w.phone === phone.trim())
      return o ?? null
    },
  )

// ---------- Node enquiries ----------
export const postEnquiry = (payloadOrForm) =>
  payloadOrForm instanceof FormData
    ? request(NODE_URL, '/api/enquiries', { method: 'POST', form: payloadOrForm, timeoutMs: 15000 })
    : request(NODE_URL, '/api/enquiries', { method: 'POST', body: payloadOrForm })

// ---------- Health (dashboard status pills) ----------
export async function health() {
  const ping = async (base, path) => {
    try {
      await request(base, path, { timeoutMs: 2500 })
      return 'online'
    } catch (e) {
      return e instanceof OfflineError ? 'offline' : 'online' // reachable but e.g. 401/404 still means "up"
    }
  }
  const [spring, node] = await Promise.all([ping(SPRING_URL, '/actuator/health'), ping(NODE_URL, '/api/health')])
  return { spring, node }
}
