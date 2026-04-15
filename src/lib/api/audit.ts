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
  actor: { id: string; email: string; role: UserRole }
}

export async function fetchAuditLogs(
  getIdToken: () => Promise<string | null>,
  limit = 200,
  cursor?: string,
): Promise<AdminListResponse<AuditLogApiRow>> {
  const q = `/admin/audit-log?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
  return apiFetch<AdminListResponse<AuditLogApiRow>>(q, getIdToken)
}
