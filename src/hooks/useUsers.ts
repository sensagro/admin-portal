import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminUsers, patchUserRole, reactivateUser, suspendUser } from '@/lib/api/users'
import { mapUserRow } from '@/lib/mappers/user'
import type { User, UserRole } from '@/types'
import { buildUserColumns } from '@/components/users/userColumns'
import { useAdminData } from './useAdminData'
import { useFlash } from './useFlash'


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

  const requestRoleChange = useCallback((user: User, newRole: UserRole) => {
    if (newRole === user.role) return
    setRoleTarget(user)
    setPendingRole(newRole)
    setRoleError(null)
  }, [])

  const cancelRoleChange = useCallback(() => {
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
      cancelRoleChange()
    } catch (e) {
      if (await handleAuthError(e)) return
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el rol'
      setRoleError(msg)
    } finally {
      setRoleBusy(false)
    }
  }, [roleTarget, pendingRole, getIdToken, reload, showFlash, cancelRoleChange, handleAuthError])

  const columns = useMemo(
    () =>
      buildUserColumns({
        canChangeRole,
        currentUserId: me?.id,
        onChangeRole: requestRoleChange,
      }),
    [canChangeRole, me?.id, requestRoleChange],
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
    cancelRoleChange,
    roleBusy,
    roleError,
    saveRole,
  }
}

export type UserSuspendModalKind = 'suspend' | 'reactivate'

type UseUserSuspendFlowOptions = {
  getIdToken: () => Promise<string | null>
  signOut: () => Promise<void>
  onSuccess: () => void | Promise<void>
  showFlash: (type: 'success' | 'error', text: string) => void
}

export function useUserSuspendFlow({
  getIdToken,
  signOut,
  onSuccess,
  showFlash,
}: UseUserSuspendFlowOptions) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<UserSuspendModalKind>('suspend')
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [sensorCount, setSensorCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

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

  const closeModal = useCallback(() => {
    setOpen(false)
    setTargetUserId(null)
    setErr(null)
  }, [])

  const openSuspend = useCallback((userId: string, email: string, assignedSensorCount: number) => {
    setKind('suspend')
    setTargetUserId(userId)
    setUserEmail(email)
    setSensorCount(assignedSensorCount)
    setErr(null)
    setOpen(true)
  }, [])

  const openReactivate = useCallback((userId: string, email: string, liftCount: number) => {
    setKind('reactivate')
    setTargetUserId(userId)
    setUserEmail(email)
    setSensorCount(liftCount)
    setErr(null)
    setOpen(true)
  }, [])

  const executeConfirmed = useCallback(async () => {
    if (!targetUserId) return
    setBusy(true)
    setErr(null)
    try {
      if (kind === 'suspend') {
        await suspendUser(getIdToken, targetUserId)
        showFlash('success', 'Usuario suspendido.')
      } else {
        await reactivateUser(getIdToken, targetUserId)
        showFlash('success', 'Usuario reactivado.')
      }
      closeModal()
      await onSuccess()
    } catch (e) {
      if (await handleAuthError(e)) return
      setErr(e instanceof Error ? e.message : 'Error')
    } finally {
      setBusy(false)
    }
  }, [targetUserId, kind, getIdToken, showFlash, closeModal, onSuccess, handleAuthError])

  return {
    suspendModalOpen: open,
    suspendModalKind: kind,
    suspendModalEmail: userEmail,
    suspendModalSensorCount: sensorCount,
    suspendModalBusy: busy,
    suspendModalError: err,
    openSuspendUser: openSuspend,
    openReactivateUser: openReactivate,
    closeSuspendModal: closeModal,
    executeSuspendOrReactivate: executeConfirmed,
  }
}

