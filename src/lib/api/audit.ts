import type { UserRole } from '@/types'
import type { AdminListResponse } from './admin-list'
import { apiFetch } from './client'

export interface AuditLogApiRow {
  id: string
  action: string
  entityType: string
  entityId: string
  payload: Record<string, unknown> | null
  createdAt: string
  actor: { id: string; email: string; role: UserRole } | null
}

export type FetchAuditLogsOptions = {
  entityType?: string
  entityId?: string
  action?: string
  actorEmail?: string
  from?: string
  to?: string
}

/** Query params for GET /admin/audit-log (excluding limit/cursor). */
export function buildAuditQuery(filters: FetchAuditLogsOptions): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.entityType) params.set('entityType', filters.entityType)
  if (filters.entityId) params.set('entityId', filters.entityId)
  if (filters.action) params.set('action', filters.action)
  if (filters.actorEmail) params.set('actorEmail', filters.actorEmail)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  return params
}

const AUDIT_EXPORT_CHUNK = 200
const AUDIT_EXPORT_MAX_PAGES = 5000

export async function fetchAuditLogs(
  getIdToken: () => Promise<string | null>,
  limit = 200,
  cursor?: string,
  options?: FetchAuditLogsOptions,
): Promise<AdminListResponse<AuditLogApiRow>> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (cursor) params.set('cursor', cursor)
  const q = buildAuditQuery(options ?? {})
  q.forEach((value, key) => {
    params.set(key, value)
  })
  return apiFetch<AdminListResponse<AuditLogApiRow>>(
    `/admin/audit-log?${params.toString()}`,
    getIdToken,
  )
}

/** Fetches every row for the current filters (cursor pagination until `total` is reached). */
export async function fetchAllAuditLogs(
  getIdToken: () => Promise<string | null>,
  filters: FetchAuditLogsOptions | undefined,
  chunkSize = AUDIT_EXPORT_CHUNK,
): Promise<AuditLogApiRow[]> {
  const acc: AuditLogApiRow[] = []
  let cursor: string | undefined
  let total = 0
  let pages = 0

  while (pages < AUDIT_EXPORT_MAX_PAGES) {
    pages += 1
    const { items, total: t } = await fetchAuditLogs(
      getIdToken,
      chunkSize,
      cursor,
      filters,
    )
    total = t
    acc.push(...items)
    if (items.length === 0 || acc.length >= total) {
      break
    }
    cursor = items[items.length - 1].id
  }

  if (pages >= AUDIT_EXPORT_MAX_PAGES && acc.length < total) {
    throw new Error(
      'El conjunto de resultados es demasiado grande para exportar en una sola descarga desde el navegador.',
    )
  }

  return acc
}
