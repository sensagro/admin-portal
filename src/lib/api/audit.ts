import type { UserRole } from '@/types'
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
): Promise<AuditLogApiRow[]> {
  return apiFetch<AuditLogApiRow[]>(`/admin/audit-log?limit=${limit}`, getIdToken)
}
