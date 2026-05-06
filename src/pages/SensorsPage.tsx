import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { RegisterSensorsModal } from '@/components/sensors/RegisterSensorsModal'
import { ManageSensorModal } from '@/components/sensors/ManageSensorModal'
import { SensorConfirmModal } from '@/components/sensors/SensorConfirmModal'
import { buildSensorColumns } from '@/components/sensors/sensorColumns'
import { FleetSignalCard } from '@/components/sensors/FleetSignalCard'
import { useSensors } from '@/hooks/useSensors'
import type { SensorSignalStatus, SensorStatus } from '@/types'

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Sensores"
          count={loading ? undefined : rows.length}
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

      <>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <DataTable
            isLoading={loading}
            columns={columns}
            rows={rows}
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
