import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { ChangeUserRoleModal } from '@/components/users/ChangeUserRoleModal'
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
    setPendingRole,
    closeRoleModal,
    roleBusy,
    roleError,
    saveRole,
  } = useUsers()

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
        <p className="text-sm text-gray-500">Cargando usuarios…</p>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white">
            <DataTable columns={columns} rows={rows} keyExtractor={(u) => u.id} />
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

      <ChangeUserRoleModal
        user={roleTarget}
        selectedRole={pendingRole}
        onSelectedRoleChange={setPendingRole}
        onClose={closeRoleModal}
        onSave={() => void saveRole()}
        busy={roleBusy}
        error={roleError}
      />
    </>
  )
}
