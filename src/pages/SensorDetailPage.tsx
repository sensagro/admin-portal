import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import {
  assignSensor,
  decommissionSensor,
  fetchAdminSensor,
  suspendSensor,
  transferSensor,
  unassignSensor,
} from '@/lib/api/sensors'
import { fetchAdminUsers, type AdminUserRow } from '@/lib/api/users'
import { mapSensorDetailToSensor } from '@/lib/mappers/sensor'
import type { Sensor, SensorDetail } from '@/types'
import { ManageSensorModal } from '@/components/sensors/ManageSensorModal'
import { SensorConfirmModal } from '@/components/sensors/SensorConfirmModal'
import type { ConfirmKind } from '@/components/sensors/SensorConfirmModal'
import { formatBattery, formatDate, statusBadge, typeLabels } from '@/components/sensors/sensorColumns'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { useFlash } from '@/hooks/useFlash'

export function SensorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { me, getIdToken, signOut } = useAuth()
  const canMutate = me?.role === 'ADMIN'
  const { banner, showFlash } = useFlash()

  const [detail, setDetail] = useState<SensorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [userFilter, setUserFilter] = useState('')

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

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminSensor(id, getIdToken)
      setDetail(data)
    } catch (e) {
      if (await handleAuthError(e)) return
      setError(e instanceof Error ? e.message : 'Error al cargar sensor')
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [id, getIdToken, handleAuthError])

  useEffect(() => {
    void load()
  }, [load])

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

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const q = userFilter.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.email.toLowerCase().includes(q))
  }, [users, userFilter])

  const openManage = useCallback(() => {
    if (!detail) return
    setManageSensor(mapSensorDetailToSensor(detail))
    setAssignUserId('')
    setTransferUserId('')
    setUserFilter('')
    setManageErr(null)
  }, [detail])

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

  const runManage = useCallback(
    async (fn: () => Promise<void>) => {
      setManageErr(null)
      setManageBusy(true)
      try {
        await fn()
        closeManage()
        await load()
        showFlash('success', 'Cambio aplicado.')
      } catch (e) {
        if (await handleAuthError(e)) return
        setManageErr(e instanceof Error ? e.message : 'Error')
      } finally {
        setManageBusy(false)
      }
    },
    [closeManage, load, showFlash, handleAuthError],
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
      await load()
      showFlash('success', 'Cambio aplicado.')
    } catch (e) {
      if (await handleAuthError(e)) return
      setConfirmErr(e instanceof Error ? e.message : 'Error')
    } finally {
      setConfirmBusy(false)
    }
  }, [manageSensor, confirmKind, getIdToken, closeConfirmOnly, closeManage, load, showFlash, handleAuthError])

  const readingColumns: Column<SensorDetail['readings'][number]>[] = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Fecha',
        render: (r) => formatDate(r.timestamp),
      },
      {
        key: 'type',
        header: 'Tipo',
        render: (r) => (
          <Badge
            label={r.type === 'ALERT' ? 'Alerta' : 'Periódica'}
            variant={r.type === 'ALERT' ? 'yellow' : 'blue'}
          />
        ),
      },
      {
        key: 'hasWater',
        header: 'Agua',
        render: (r) =>
          r.hasWater === null ? (
            '—'
          ) : r.hasWater ? (
            <span className="text-emerald-700 dark:text-emerald-400">Sí</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">No</span>
          ),
      },
      {
        key: 'batteryVoltage',
        header: 'Batería',
        render: (r) => formatBattery(r.batteryVoltage),
      },
      {
        key: 'temperature',
        header: 'Temp. °C',
        render: (r) => (r.temperature === null ? '—' : String(r.temperature)),
      },
    ],
    [],
  )

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando sensor…</p>
  }

  if (error || !detail) {
    return (
      <div>
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Sensor no encontrado'}</p>
        <Link
          to="/sensors"
          className="mt-2 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Volver a sensores
        </Link>
      </div>
    )
  }

  const st = statusBadge[detail.status]
  const manageSensorForModal = manageSensor

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <Link
          to="/sensors"
          className="text-sm text-emerald-800 hover:underline dark:text-emerald-400"
        >
          ← Sensores
        </Link>
        {canMutate && (
          <Button variant="primary" onClick={openManage}>
            Gestionar
          </Button>
        )}
      </div>

      {banner && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
              : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="mb-6">
        <PageHeader title={detail.name} />
        <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">{detail.terminalId}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge
            label={st.label}
            variant={st.variant}
            title={
              detail.suspendedByUserSuspension
                ? 'Suspendido por baja de usuario'
                : undefined
            }
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {typeLabels[detail.type] ?? detail.type}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Alta: {formatDate(detail.createdAt)}</span>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Propietario</h3>
        {detail.owner ? (
          <Link
            to={`/users/${detail.owner.id}`}
            className="text-emerald-800 hover:underline dark:text-emerald-400"
          >
            {detail.owner.email}
          </Link>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Sin asignar</span>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Última lectura (resumen)</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Última señal</dt>
            <dd className="text-gray-800 dark:text-gray-200">{formatDate(detail.lastReadingAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Batería</dt>
            <dd className="text-gray-800 dark:text-gray-200">{formatBattery(detail.lastBatteryVoltage)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Temperatura</dt>
            <dd className="text-gray-800 dark:text-gray-200">
              {detail.lastTemperature === null ? '—' : `${detail.lastTemperature} °C`}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Elevación</dt>
            <dd className="text-gray-800 dark:text-gray-200">
              {detail.lastElevation === null ? '—' : `${detail.lastElevation} m`}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Agua (último alerta)</dt>
            <dd className="text-gray-800 dark:text-gray-200">
              {detail.lastAlertHasWater === null
                ? '—'
                : detail.lastAlertHasWater
                  ? 'Sí'
                  : 'No'}
            </dd>
          </div>
        </dl>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Últimas lecturas</h2>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <DataTable columns={readingColumns} rows={detail.readings} keyExtractor={(r) => r.id} />
      </div>

      <ManageSensorModal
        sensor={manageSensorForModal}
        onClose={closeManage}
        users={filteredUsers}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
        assignUserId={assignUserId}
        onAssignUserIdChange={setAssignUserId}
        onAssign={() => void handleAssign()}
        transferUserId={transferUserId}
        onTransferUserIdChange={setTransferUserId}
        onTransfer={() => void handleTransfer()}
        busy={manageBusy}
        error={manageErr}
        confirmKind={confirmKind}
        onRequestConfirm={(kind) => setConfirmKind(kind)}
      />

      {confirmKind && manageSensorForModal && (
        <SensorConfirmModal
          kind={confirmKind}
          sensor={manageSensorForModal}
          loading={confirmBusy}
          error={confirmErr}
          onConfirm={() => void executeConfirmedAction()}
          onCancel={closeConfirmOnly}
        />
      )}
    </>
  )
}
