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

export async function apiFetch<T>(
  path: string,
  getIdToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getIdToken()
  if (!token) {
    throw new ApiError('Sesión expirada', 401)
  }

  const res = await fetch(buildUrl(path), { ...init, headers: buildHeaders(token, init) })
  const body = await parseJsonSafe(res)

  if (!res.ok) {
    const msg = extractApiErrorMessage(body, res.statusText || 'Error de red')
    throw new ApiError(msg, res.status, body)
  }

  return body as T
}

/** Uses a fixed token instead of a factory; useful before Auth is fully wired. */
export async function apiFetchWithToken<T>(path: string, idToken: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, () => Promise.resolve(idToken), init)
}
