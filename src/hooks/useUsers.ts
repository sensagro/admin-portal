import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminUsers, patchUserRole } from '@/lib/api/users'
import { mapUserRow } from '@/lib/mappers/user'
import type { User, UserRole } from '@/types'
import { buildUserColumns } from '@/components/users/userColumns'
import { useAdminData } from './useAdminData'
import { useFlash } from './useFlash'

const ALL_ROLES: UserRole[] = ['FARMER', 'ADMIN', 'SUPPORT']

function firstAlternativeRole(current: UserRole): UserRole {
  return ALL_ROLES.find((r) => r !== current) ?? 'FARMER'
}

export function useUsers() {
  const { me, getIdToken, signOut } = useAuth()
  const canChangeRole = me?.role === 'ADMIN'
  const { banner, showFlash } = useFlash()

  const {
    data: rows,
    loading,
    error,
    reload,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    total,
  } = useAdminData(
    fetchAdminUsers,
    mapUserRow,
    'Error al cargar usuarios',
    'users',
  )

  const [roleTarget, setRoleTarget] = useState<User | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole>('FARMER')
  const [roleBusy, setRoleBusy] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)

  const openRoleModal = useCallback((user: User) => {
    setRoleTarget(user)
    setPendingRole(firstAlternativeRole(user.role))
    setRoleError(null)
  }, [])

  const closeRoleModal = useCallback(() => {
    setRoleTarget(null)
    setRoleError(null)
  }, [])

  const handleAuthError = useCallback(
    async (e: unknown): Promise<boolean> => {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return true
      }
      return false
    },
    [signOut],
  )

  const saveRole = useCallback(async () => {
    if (!roleTarget || pendingRole === roleTarget.role) return
    setRoleBusy(true)
    setRoleError(null)
    try {
      await patchUserRole(getIdToken, roleTarget.id, pendingRole)
      await reload()
      showFlash('success', `Rol actualizado: ${roleTarget.email}`)
      closeRoleModal()
    } catch (e) {
      if (await handleAuthError(e)) return
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el rol'
      setRoleError(msg)
    } finally {
      setRoleBusy(false)
    }
  }, [roleTarget, pendingRole, getIdToken, reload, showFlash, closeRoleModal, handleAuthError])

  const columns = useMemo(
    () =>
      buildUserColumns({
        canChangeRole,
        currentUserId: me?.id,
        onChangeRole: openRoleModal,
      }),
    [canChangeRole, me?.id, openRoleModal],
  )

  return {
    rows,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    total,
    banner,
    columns,
    roleTarget,
    pendingRole,
    setPendingRole,
    closeRoleModal,
    roleBusy,
    roleError,
    saveRole,
  }
}
