import type { UserDetail, UserRole } from '@/types'
import type { AdminListResponse } from './admin-list'
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
  suspendedAt: string | null
}

export interface UserSuspendResponse {
  id: string
  suspendedAt: string | null
  affectedSensorCount: number
}

export async function fetchAdminUsers(
  getIdToken: () => Promise<string | null>,
  limit = 200,
  cursor?: string,
): Promise<AdminListResponse<AdminUserRow>> {
  const q = `/admin/users?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
  return apiFetch<AdminListResponse<AdminUserRow>>(q, getIdToken)
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

export async function fetchAdminUser(
  userId: string,
  getIdToken: () => Promise<string | null>,
): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/admin/users/${encodeURIComponent(userId)}`, getIdToken)
}

export async function suspendUser(
  getIdToken: () => Promise<string | null>,
  userId: string,
): Promise<UserSuspendResponse> {
  return apiFetch<UserSuspendResponse>(
    `/admin/users/${encodeURIComponent(userId)}/suspend`,
    getIdToken,
    { method: 'POST' },
  )
}

export async function reactivateUser(
  getIdToken: () => Promise<string | null>,
  userId: string,
): Promise<UserSuspendResponse> {
  return apiFetch<UserSuspendResponse>(
    `/admin/users/${encodeURIComponent(userId)}/reactivate`,
    getIdToken,
    { method: 'POST' },
  )
}
