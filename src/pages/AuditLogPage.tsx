import { fetchAuditLogs } from '@/lib/api/audit'
import { mapAuditRow } from '@/lib/mappers/audit'
import type { AuditLog } from '@/types'
import type { Column } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { useAdminData } from '@/hooks/useAdminData'

function AuditPayloadCell({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) {
    return <span className="text-gray-400">—</span>
  }
  const compact = JSON.stringify(payload)
  const preview = compact.length > 64 ? `${compact.slice(0, 64)}…` : compact
  return (
    <details className="max-w-xs text-xs">
      <summary className="cursor-pointer list-none text-gray-600 marker:hidden hover:text-gray-900 [&::-webkit-details-marker]:hidden">
        <span className="break-all font-mono">{preview}</span>
      </summary>
      <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-gray-50 p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-gray-800">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </details>
  )
}

const columns: Column<AuditLog>[] = [
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (log) =>
      new Date(log.createdAt).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' }),
  },
  {
    key: 'action',
    header: 'Acción',
    render: (log) => (
      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">{log.action}</span>
    ),
  },
  {
    key: 'entityType',
    header: 'Entidad',
    render: (log) => log.entityType,
  },
  {
    key: 'entityId',
    header: 'ID Entidad',
    render: (log) => <span className="font-mono text-xs">{log.entityId}</span>,
  },
  {
    key: 'actorEmail',
    header: 'Actor',
    render: (log) => log.actorEmail,
  },
  {
    key: 'payload',
    header: 'Detalle',
    render: (log) => <AuditPayloadCell payload={log.payload} />,
  },
]

export function AuditLogPage() {
  const {
    data: rows,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    total,
  } = useAdminData(
    fetchAuditLogs,
    mapAuditRow,
    'Error al cargar auditoría',
    'audit',
  )

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Registro de auditoría"
          count={loading ? undefined : rows.length}
          total={loading ? undefined : total ?? undefined}
          className="min-w-0"
        />
        <PageSizeSelect
          id="audit-page-size"
          value={pageSize}
          onChange={setPageSize}
          disabled={loading || loadingMore}
        />
      </div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando auditoría…</p>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white">
            <DataTable columns={columns} rows={rows} keyExtractor={(l) => l.id} />
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
    </>
  )
}
