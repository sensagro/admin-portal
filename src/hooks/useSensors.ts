import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import {
  assignSensor,
  bulkRegisterSensors,
  decommissionSensor,
  fetchAdminSensors,
  suspendSensor,
  transferSensor,
  unassignSensor,
} from '@/lib/api/sensors'
import { fetchAdminUsers, type AdminUserRow } from '@/lib/api/users'
import { mapSensorRow } from '@/lib/mappers/sensor'
import { parseTerminalIds } from '@/utils/parseTerminalIds'
import type { ConfirmKind } from '@/components/sensors/SensorConfirmModal'
import { useFlash } from './useFlash'
import type { Sensor, SensorSignalStatus } from '@/types'
import { useAdminTablePageSize } from '@/contexts/AdminTablePageSizeContext'

export function useSensors() {
  const { me, getIdToken, signOut } = useAuth()
  const canMutate = me?.role === 'ADMIN'
  const { banner, showFlash } = useFlash()
  const { pageSize, setPageSize } = useAdminTablePageSize('sensors')

  const [rows, setRows] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [signalTableFilter, setSignalTableFilter] = useState<SensorSignalStatus | null>(
    null,
  )
  const [fleetRefreshKey, setFleetRefreshKey] = useState(0)

  const bumpFleetRefresh = useCallback(() => {
    setFleetRefreshKey((k) => k + 1)
  }, [])

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [userFilter, setUserFilter] = useState('')

  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerText, setRegisterText] = useState('')
  const [registerBusy, setRegisterBusy] = useState(false)
  const [registerErr, setRegisterErr] = useState<string | null>(null)

  const [manageSensor, setManageSensor] = useState<Sensor | null>(null)
  const [assignUserId, setAssignUserId] = useState('')
  const [transferUserId, setTransferUserId] = useState('')
  const [manageBusy, setManageBusy] = useState(false)
  const [manageErr, setManageErr] = useState<string | null>(null)

  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [confirmErr, setConfirmErr] = useState<string | null>(null)

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

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    try {
      const { items, total: t } = await fetchAdminSensors(
        getIdToken,
        pageSize,
        undefined,
        signalTableFilter ?? undefined,
      )
      setRows(items.map(mapSensorRow))
      setTotal(t)
      const loaded = items.length
      const more = loaded < t
      setHasMore(more)
      setCursor(more && loaded > 0 ? items[loaded - 1].id : null)
    } catch (e) {
      if (await handleAuthError(e)) return
      setHasMore(false)
      setCursor(null)
      setTotal(null)
      setError(e instanceof Error ? e.message : 'Error al cargar sensores')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, handleAuthError, pageSize, signalTableFilter])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return
    if (cursor == null) return
    setLoadingMore(true)
    setError(null)
    try {
      const { items, total: t } = await fetchAdminSensors(
        getIdToken,
        pageSize,
        cursor,
        signalTableFilter ?? undefined,
      )
      const chunk = items.map(mapSensorRow)
      const nextLen = rows.length + chunk.length
      setRows((prev) => [...prev, ...chunk])
      setTotal(t)
      const more = nextLen < t
      setHasMore(more)
      setCursor(more && items.length > 0 ? items[items.length - 1].id : null)
    } catch (e) {
      if (await handleAuthError(e)) return
      setError(e instanceof Error ? e.message : 'Error al cargar sensores')
    } finally {
      setLoadingMore(false)
    }
  }, [
    getIdToken,
    handleAuthError,
    hasMore,
    loadingMore,
    loading,
    cursor,
    pageSize,
    rows.length,
    signalTableFilter,
  ])

  const loadUsers = useCallback(async () => {
    if (!canMutate) return
    try {
      const { items } = await fetchAdminUsers(getIdToken, 500)
      setUsers(items.sort((a, b) => a.email.localeCompare(b.email)))
    } catch (e) {
      if (await handleAuthError(e)) return
      console.error(e)
    }
  }, [canMutate, getIdToken, handleAuthError])

  useEffect(() => { void reload() }, [reload])
  useEffect(() => { void loadUsers() }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const q = userFilter.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.email.toLowerCase().includes(q))
  }, [users, userFilter])

  const openRegister = useCallback(() => setRegisterOpen(true), [])
  const closeRegister = useCallback(() => {
    setRegisterOpen(false)
    setRegisterText('')
    setRegisterErr(null)
  }, [])

  const openManage = useCallback((s: Sensor) => {
    setManageSensor(s)
    setAssignUserId('')
    setTransferUserId('')
    setUserFilter('')
    setManageErr(null)
  }, [])

  const closeManage = useCallback(() => {
    setManageSensor(null)
    setAssignUserId('')
    setTransferUserId('')
    setUserFilter('')
    setManageErr(null)
    setConfirmKind(null)
    setConfirmErr(null)
  }, [])

  const closeConfirmOnly = useCallback(() => {
    setConfirmKind(null)
    setConfirmErr(null)
  }, [])

  const handleBulkRegister = useCallback(async () => {
    const parsed = parseTerminalIds(registerText)
    if (!parsed.ok) {
      setRegisterErr(parsed.error)
      return
    }
    setRegisterErr(null)
    setRegisterBusy(true)
    try {
      const res = await bulkRegisterSensors(getIdToken, { terminalIds: parsed.ids, type: 'WATER_SENSOR' })
      showFlash('success', `Se registraron ${res.registered} sensor(es).`)
      closeRegister()
      await reload()
      bumpFleetRefresh()
    } catch (e) {
      if (await handleAuthError(e)) return
      setRegisterErr(e instanceof Error ? e.message : 'Error al registrar')
    } finally {
      setRegisterBusy(false)
    }
  }, [registerText, getIdToken, showFlash, closeRegister, reload, handleAuthError, bumpFleetRefresh])

  const runManage = useCallback(
    async (fn: () => Promise<void>) => {
      setManageErr(null)
      setManageBusy(true)
      try {
        await fn()
        closeManage()
        await reload()
        bumpFleetRefresh()
        showFlash('success', 'Cambio aplicado.')
      } catch (e) {
        if (await handleAuthError(e)) return
        setManageErr(e instanceof Error ? e.message : 'Error')
      } finally {
        setManageBusy(false)
      }
    },
    [closeManage, reload, showFlash, handleAuthError, bumpFleetRefresh],
  )

  const handleAssign = useCallback(async () => {
    if (!manageSensor) return
    await runManage(async () => {
      await assignSensor(getIdToken, manageSensor.id, assignUserId)
    })
  }, [runManage, getIdToken, manageSensor, assignUserId])

  const handleTransfer = useCallback(async () => {
    if (!manageSensor) return
    await runManage(async () => {
      await transferSensor(getIdToken, manageSensor.id, transferUserId)
    })
  }, [runManage, getIdToken, manageSensor, transferUserId])

  const executeConfirmedAction = useCallback(async () => {
    if (!manageSensor || !confirmKind) return
    setConfirmErr(null)
    setConfirmBusy(true)
    try {
      if (confirmKind === 'unassign') {
        await unassignSensor(getIdToken, manageSensor.id)
      } else if (confirmKind === 'suspend') {
        await suspendSensor(getIdToken, manageSensor.id)
      } else {
        await decommissionSensor(getIdToken, manageSensor.id)
      }
      closeConfirmOnly()
      closeManage()
      await reload()
      bumpFleetRefresh()
      showFlash('success', 'Cambio aplicado.')
    } catch (e) {
      if (await handleAuthError(e)) return
      setConfirmErr(e instanceof Error ? e.message : 'Error')
    } finally {
      setConfirmBusy(false)
    }
  }, [manageSensor, confirmKind, getIdToken, closeConfirmOnly, closeManage, reload, showFlash, handleAuthError, bumpFleetRefresh])

  return {
    canMutate,
    rows,
    signalTableFilter,
    setSignalTableFilter,
    fleetRefreshKey,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    total,
    banner,
    users: filteredUsers,
    userFilter,
    setUserFilter,
    registerOpen,
    openRegister,
    closeRegister,
    registerText,
    setRegisterText,
    registerBusy,
    registerErr,
    handleBulkRegister,
    manageSensor,
    openManage,
    closeManage,
    assignUserId,
    setAssignUserId,
    transferUserId,
    setTransferUserId,
    manageBusy,
    manageErr,
    handleAssign,
    handleTransfer,
    confirmKind,
    setConfirmKind,
    confirmBusy,
    confirmErr,
    closeConfirmOnly,
    executeConfirmedAction,
  }
}
