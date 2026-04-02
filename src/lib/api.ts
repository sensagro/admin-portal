import type { UserRole } from '@/types'

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

export async function apiFetch<T>(
  path: string,
  getIdToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const token = await getIdToken()
  if (!token) {
    throw new ApiError('Sesión expirada', 401)
  }

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  })

  const body = await parseJsonSafe(res)

  if (!res.ok) {
    const msg =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : res.statusText || 'Error de red'
    throw new ApiError(Array.isArray(msg) ? msg.join(', ') : msg, res.status, body)
  }

  return body as T
}

/** Used before Auth is fully wired; same as apiFetch with a fixed token. */
export async function apiFetchWithToken<T>(path: string, idToken: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${idToken}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  })

  const body = await parseJsonSafe(res)

  if (!res.ok) {
    const msg =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : res.statusText || 'Error de red'
    throw new ApiError(Array.isArray(msg) ? msg.join(', ') : msg, res.status, body)
  }

  return body as T
}

export interface MeUser {
  id: string
  email: string
  role: UserRole
  firebaseUid: string
  createdAt: string
  updatedAt: string
}

export async function fetchMe(idToken: string): Promise<MeUser> {
  return apiFetchWithToken<MeUser>('/users/me', idToken)
}

export interface AdminUserRow {
  id: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export async function fetchAdminUsers(
  getIdToken: () => Promise<string | null>,
  limit = 200,
): Promise<AdminUserRow[]> {
  return apiFetch<AdminUserRow[]>(`/admin/users?limit=${limit}`, getIdToken)
}

export interface AdminSensorApiRow {
  id: string
  terminalId: string
  name: string
  type: string
  status: string
  lastReadingAt: string | null
  lastBatteryVoltage: number | null
  createdAt: string
  owner: { id: string; email: string } | null
  farm: { id: string; name: string } | null
}

export async function fetchAdminSensors(
  getIdToken: () => Promise<string | null>,
  limit = 200,
): Promise<AdminSensorApiRow[]> {
  return apiFetch<AdminSensorApiRow[]>(`/admin/sensors?limit=${limit}`, getIdToken)
}

export interface AuditLogApiRow {
  id: string
  action: string
  entityType: string
  entityId: string
  payload: Record<string, unknown> | null
  createdAt: string
  actor: { id: string; email: string; role: UserRole }
}

export async function fetchAuditLogs(
  getIdToken: () => Promise<string | null>,
  limit = 200,
): Promise<AuditLogApiRow[]> {
  return apiFetch<AuditLogApiRow[]>(`/admin/audit-log?limit=${limit}`, getIdToken)
}
