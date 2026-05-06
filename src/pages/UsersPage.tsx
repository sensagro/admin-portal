import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ROLE_OPTIONS } from '@/components/users/userColumns'
import { useUsers } from '@/hooks/useUsers'

export function UsersPage() {
  const {
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
  } = useUsers()

  const fromLabel = ROLE_OPTIONS.find((o) => o.value === roleTarget?.role)?.label
  const toLabel = ROLE_OPTIONS.find((o) => o.value === pendingRole)?.label

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Usuarios registrados"
          count={loading ? undefined : rows.length}
          total={loading ? undefined : total ?? undefined}
          className="min-w-0"
        />
        <PageSizeSelect
          id="users-page-size"
          value={pageSize}
          onChange={setPageSize}
          disabled={loading || loadingMore}
        />
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

      <>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <DataTable
            isLoading={loading}
            columns={columns}
            rows={rows}
            keyExtractor={(u) => u.id}
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

      <ConfirmDialog
        open={roleTarget !== null}
        title="Confirmar cambio de rol"
        entityLabel={roleTarget?.email ?? ''}
        body={
          <>
            <p>
              El rol pasará de <strong>{fromLabel}</strong> a <strong>{toLabel}</strong>.
            </p>
            <p>Se actualizan la base de datos y las reclamaciones de Firebase para este usuario.</p>
          </>
        }
        reversibility="reversible"
        confirmLabel="Confirmar"
        onConfirm={() => void saveRole()}
        onCancel={cancelRoleChange}
        loading={roleBusy}
        error={roleError}
        confirmTone="default"
      />
    </>
  )
}
