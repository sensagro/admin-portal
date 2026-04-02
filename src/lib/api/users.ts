import type { UserRole } from '@/types'
import { apiFetch, apiFetchWithToken } from './client'

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

export async function patchUserRole(
  getIdToken: () => Promise<string | null>,
  userId: string,
  role: UserRole,
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(
    `/admin/users/${encodeURIComponent(userId)}/role`,
    getIdToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    },
  )
}
