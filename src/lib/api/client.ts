import { firebaseAuth } from '@/lib/firebase'
import { notifySessionExpired } from '@/lib/session-expired-bridge'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown | undefined

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
  return base.replace(/\/$/, '')
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function extractApiErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const m = (body as { message: unknown }).message
    if (typeof m === 'string') return m
    if (Array.isArray(m)) {
      const parts = m.filter((x): x is string => typeof x === 'string')
      if (parts.length > 0) return parts.join(', ')
    }
  }
  return fallback
}

function buildUrl(path: string): string {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

function buildHeaders(token: string, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

async function tryRefreshIdToken(): Promise<string | null> {
  const u = firebaseAuth.currentUser
  if (!u) return null
  try {
    return await u.getIdToken(true)
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  path: string,
  getIdToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getIdToken()
  if (!token) {
    notifySessionExpired()
    throw new ApiError('Sesión expirada', 401)
  }

  const doFetch = (idTok: string) =>
    fetch(buildUrl(path), { ...init, headers: buildHeaders(idTok, init) })

  let res = await doFetch(token)
  let body = await parseJsonSafe(res)

  if (res.status === 401) {
    const refreshed = await tryRefreshIdToken()
    if (!refreshed) {
      notifySessionExpired()
      throw new ApiError(extractApiErrorMessage(body, 'Sesión expirada'), 401, body)
    }
    res = await doFetch(refreshed)
    body = await parseJsonSafe(res)
  }

  if (!res.ok) {
    if (res.status === 401) {
      notifySessionExpired()
    }
    const msg = extractApiErrorMessage(body, res.statusText || 'Error de red')
    throw new ApiError(msg, res.status, body)
  }

  return body as T
}

/** Uses a fixed token instead of a factory; useful before Auth is fully wired. */
export async function apiFetchWithToken<T>(path: string, idToken: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, () => Promise.resolve(idToken), init)
}
