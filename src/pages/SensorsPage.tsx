import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { DataTable } from '@/components/ui/DataTable'
import { RegisterSensorsModal } from '@/components/sensors/RegisterSensorsModal'
import { ManageSensorModal } from '@/components/sensors/ManageSensorModal'
import { SensorConfirmModal } from '@/components/sensors/SensorConfirmModal'
import { buildSensorColumns, typeLabels, statusBadge } from '@/components/sensors/sensorColumns'
import { FleetSignalCard } from '@/components/sensors/FleetSignalCard'
import { FlashOverlay } from '@/components/ui/FlashOverlay'
import { useSensors } from '@/hooks/useSensors'
import type { SensorSignalStatus, SensorStatus, SensorType } from '@/types'

export function SensorsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    canMutate,
    rows,
    signalTableFilter,
    setSignalTableFilter,
    statusTableFilter,
    setStatusTableFilter,
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
    dismissFlash,
    users,
    userFilter,
    setUserFilter,
    registerOpen,
    registerModalKey,
    openRegister,
    closeRegister,
    registerBusy,
    registerErr,
    handleBulkRegister,
    existingTerminalIds,
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
  } = useSensors()

  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [ownerDraft, setOwnerDraft] = useState('')
  const [ownerQuery, setOwnerQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SensorType | ''>('')
  const [statusFilterLocal, setStatusFilterLocal] = useState<SensorStatus | ''>('')

  useEffect(() => {
    const handle = window.setTimeout(() => setSearchQuery(searchDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    const handle = window.setTimeout(() => setOwnerQuery(ownerDraft.trim()), 300)
    return () => window.clearTimeout(handle)
  }, [ownerDraft])

  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const oq = ownerQuery.toLowerCase()
    return rows.filter((r) => {
      if (q && !r.terminalId.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false
      if (oq && !(r.ownerEmail ?? '').toLowerCase().includes(oq)) return false
      if (typeFilter && r.type !== typeFilter) return false
      if (statusFilterLocal && r.status !== statusFilterLocal) return false
      return true
    })
  }, [rows, searchQuery, ownerQuery, typeFilter, statusFilterLocal])

  const hasLocalFilters = searchQuery || ownerQuery || typeFilter || statusFilterLocal

  const clearLocalFilters = () => {
    setSearchDraft('')
    setSearchQuery('')
    setOwnerDraft('')
    setOwnerQuery('')
    setTypeFilter('')
    setStatusFilterLocal('')
  }

  useEffect(() => {
    const sig = searchParams.get('signalStatus')
    const st = searchParams.get('status')
    const validSig =
      sig === 'SILENT' || sig === 'NEVER_REPORTED' || sig === 'FRESH'
    const validSt =
      st === 'UNASSIGNED' ||
      st === 'ASSIGNED' ||
      st === 'SUSPENDED' ||
      st === 'DECOMMISSIONED'

    if (validSig) {
      setSignalTableFilter(sig as SensorSignalStatus)
    } else if (validSt) {
      setStatusTableFilter(st as SensorStatus)
    } else {
      setSignalTableFilter(null)
      setStatusTableFilter(null)
    }
  }, [searchParams, setSignalTableFilter, setStatusTableFilter])

  const columns = useMemo(
    () => buildSensorColumns({ canMutate, onManage: openManage }),
    [canMutate, openManage],
  )

  return (
    <>
      <FlashOverlay banner={banner} onDismiss={dismissFlash} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Sensores"
          count={loading ? undefined : filteredRows.length}
          total={loading ? undefined : total ?? undefined}
          className="min-w-0"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <PageSizeSelect
            id="sensors-page-size"
            value={pageSize}
            onChange={setPageSize}
            disabled={loading || loadingMore}
          />
          {canMutate && (
            <Button variant="primary" onClick={openRegister}>
              Registrar sensores
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      <FleetSignalCard
        refreshKey={fleetRefreshKey}
        onApplySignalTableFilter={setSignalTableFilter}
        onApplyStatusTableFilter={setStatusTableFilter}
        onOpenSensor={openManage}
      />

      {(signalTableFilter || statusTableFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Filtro:{' '}
            <strong>
              {statusTableFilter === 'UNASSIGNED'
                ? 'Sin asignar'
                : signalTableFilter === 'SILENT'
                  ? 'Sin señal'
                  : signalTableFilter === 'NEVER_REPORTED'
                    ? 'Esperando primera lectura'
                    : 'Señal reciente'}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setSignalTableFilter(null)
              navigate('/sensors', { replace: true })
            }}
            className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
          >
            Quitar filtro
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Terminal ID / Nombre
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Buscar..."
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Propietario
            <input
              type="text"
              value={ownerDraft}
              onChange={(e) => setOwnerDraft(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Tipo
            <Select
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as SensorType | '')}
              options={[
                { value: '', label: 'Todos' },
                ...(Object.entries(typeLabels) as [SensorType, string][]).map(([k, v]) => ({
                  value: k,
                  label: v,
                })),
              ]}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Estado
            <Select
              value={statusFilterLocal}
              onChange={(v) => setStatusFilterLocal(v as SensorStatus | '')}
              options={[
                { value: '', label: 'Todos' },
                ...(Object.entries(statusBadge) as [SensorStatus, { label: string }][]).map(
                  ([k, v]) => ({ value: k, label: v.label }),
                ),
              ]}
            />
          </label>
        </div>
        {hasLocalFilters && (
          <div>
            <button
              type="button"
              onClick={clearLocalFilters}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <DataTable
            isLoading={loading}
            columns={columns}
            rows={filteredRows}
            keyExtractor={(r) => r.id}
          />
        </div>
        {hasMore && !loading && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              {loadingMore ? 'Cargando…' : 'Cargar más'}
            </button>
          </div>
        )}
      </>

      <RegisterSensorsModal
        key={registerModalKey}
        open={registerOpen}
        onClose={closeRegister}
        existingTerminalIds={existingTerminalIds}
        busy={registerBusy}
        error={registerErr}
        onSubmit={(sensors) => void handleBulkRegister(sensors)}
      />

      <ManageSensorModal
        sensor={manageSensor}
        onClose={closeManage}
        users={users}
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

      {confirmKind && manageSensor && (
        <SensorConfirmModal
          kind={confirmKind}
          sensor={manageSensor}
          loading={confirmBusy}
          error={confirmErr}
          onConfirm={() => void executeConfirmedAction()}
          onCancel={closeConfirmOnly}
        />
      )}
    </>
  )
}
