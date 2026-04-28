import type { AuditLog } from '@/types'
import type { AuditLogApiRow } from '@/lib/api/audit'

export function mapAuditRow(row: AuditLogApiRow): AuditLog {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    actorEmail: row.actor?.email ?? 'Sistema',
    payload: row.payload,
    createdAt: row.createdAt,
  }
}
