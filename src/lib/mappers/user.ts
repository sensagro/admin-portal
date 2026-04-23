import type { User } from '@/types'
import type { AdminUserRow } from '@/lib/api/users'

export function mapUserRow(row: AdminUserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    suspendedAt: row.suspendedAt ?? null,
  }
}
