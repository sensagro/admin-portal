import { useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { RegisterSensorsModal } from '@/components/sensors/RegisterSensorsModal'
import { ManageSensorModal } from '@/components/sensors/ManageSensorModal'
import { SensorConfirmModal } from '@/components/sensors/SensorConfirmModal'
import { buildSensorColumns } from '@/components/sensors/sensorColumns'
import { useSensors } from '@/hooks/useSensors'

export function SensorsPage() {
  const {
    canMutate,
    rows,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    banner,
    users,
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
  } = useSensors()

  const columns = useMemo(
    () => buildSensorColumns({ canMutate, onManage: openManage }),
    [canMutate, openManage],
  )

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Sensores" count={loading ? undefined : rows.length} className="min-w-0" />
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
            banner.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-600'
          }`}
        >
          {banner.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando sensores…</p>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white">
            <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} />
          </div>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? 'Cargando…' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}

      <RegisterSensorsModal
        open={registerOpen}
        onClose={closeRegister}
        text={registerText}
        onTextChange={setRegisterText}
        busy={registerBusy}
        error={registerErr}
        onSubmit={() => void handleBulkRegister()}
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
