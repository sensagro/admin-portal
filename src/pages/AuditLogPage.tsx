import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  buildAuditQuery,
  fetchAllAuditLogs,
  fetchAuditLogs,
  type FetchAuditLogsOptions,
} from '@/lib/api'
import { mapAuditRow } from '@/lib/mappers/audit'
import type { AuditLog } from '@/types'
import type { Column } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSizeSelect } from '@/components/ui/PageSizeSelect'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useAdminData } from '@/hooks/useAdminData'
import { useAuth } from '@/contexts/AuthContext'
import { AUDIT_ACTION_OPTIONS } from '@/constants/auditActions'
import { downloadCsvFile, rowToCsvLine } from '@/utils/downloadCsv'

const ENTITY_TYPE_OPTIONS = ['', 'Sensor', 'User'] as const

function AuditPayloadCell({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) {
    return <span className="text-gray-400 dark:text-gray-500">—</span>
  }
  const compact = JSON.stringify(payload)
  const preview = compact.length > 64 ? `${compact.slice(0, 64)}…` : compact
  return (
    <details className="max-w-xs text-xs">
      <summary className="cursor-pointer list-none text-gray-600 marker:hidden hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 [&::-webkit-details-marker]:hidden">
        <span className="break-all font-mono">{preview}</span>
      </summary>
      <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-gray-50 p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-gray-800 dark:bg-slate-800 dark:text-gray-200">
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
      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-slate-700 dark:text-gray-200">
        {log.action}
      </span>
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

function hasActiveAuditFilters(f: FetchAuditLogsOptions): boolean {
  return buildAuditQuery(f).toString().length > 0
}

function auditLogsToCsvBody(logs: AuditLog[]): string {
  const header = rowToCsvLine([
    'createdAt',
    'action',
    'entityType',
    'entityId',
    'actorEmail',
    'payload',
  ])
  const lines = logs.map((log) =>
    rowToCsvLine([
      log.createdAt,
      log.action,
      log.entityType,
      log.entityId,
      log.actorEmail,
      JSON.stringify(log.payload ?? null),
    ]),
  )
  return [header, ...lines].join('\n')
}

export function AuditLogPage() {
  const { getIdToken, signOut } = useAuth()
  const [entityType, setEntityType] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [actorEmailDraft, setActorEmailDraft] = useState('')
  const [actorEmailFilter, setActorEmailFilter] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActorEmailFilter(actorEmailDraft.trim())
    }, 400)
    return () => window.clearTimeout(handle)
  }, [actorEmailDraft])

  const filters = useMemo((): FetchAuditLogsOptions => {
    const f: FetchAuditLogsOptions = {}
    if (entityType) f.entityType = entityType
    if (action) f.action = action
    if (actorEmailFilter) f.actorEmail = actorEmailFilter
    if (from) f.from = from
    if (to) f.to = to
    return f
  }, [entityType, action, actorEmailFilter, from, to])

  const fetchPage = useCallback(
    (
      getIdToken: () => Promise<string | null>,
      limit: number,
      cursor?: string,
    ) => fetchAuditLogs(getIdToken, limit, cursor, filters),
    [filters],
  )

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
  } = useAdminData(fetchPage, mapAuditRow, 'Error al cargar auditoría', 'audit')

  const [exportingTotal, setExportingTotal] = useState(false)
  const [totalExportError, setTotalExportError] = useState<string | null>(null)

  const clearFilters = () => {
    setEntityType('')
    setAction('')
    setFrom('')
    setTo('')
    setActorEmailDraft('')
    setActorEmailFilter('')
  }

  const exportLoadedCsv = () => {
    const dateStamp = new Date().toISOString().slice(0, 10)
    downloadCsvFile(`audit-cargados-${dateStamp}.csv`, auditLogsToCsvBody(rows))
  }

  const exportTotalCsv = async () => {
    setTotalExportError(null)
    setExportingTotal(true)
    try {
      const raw = await fetchAllAuditLogs(getIdToken, filters)
      const mapped = raw.map(mapAuditRow)
      const dateStamp = new Date().toISOString().slice(0, 10)
      downloadCsvFile(`audit-total-${dateStamp}.csv`, auditLogsToCsvBody(mapped))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setTotalExportError(
        e instanceof Error ? e.message : 'Error al exportar el total filtrado',
      )
    } finally {
      setExportingTotal(false)
    }
  }

  const filtersActive = hasActiveAuditFilters(filters)
  const showFilteredEmpty = !loading && rows.length === 0 && filtersActive
  const showEmpty = !loading && rows.length === 0 && !filtersActive

  return (
    <>
      <div className="mb-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Registro de auditoría"
            count={loading ? undefined : rows.length}
            total={loading ? undefined : total ?? undefined}
            className="min-w-0 shrink-0 mb-0"
          />
          <PageSizeSelect
            id="audit-page-size"
            value={pageSize}
            onChange={setPageSize}
            disabled={loading || loadingMore}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-slate-600 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              CSV · solo cargados
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filas en esta página (incluye lo acumulado con «Cargar más»). Rápido, sin llamadas extra.
            </p>
            <Button
              variant="secondary"
              onClick={exportLoadedCsv}
              disabled={loading || rows.length === 0}
              className="self-start"
            >
              Descargar cargados
            </Button>
          </div>
          <div className="hidden w-px shrink-0 bg-gray-200 dark:bg-slate-600 md:block" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/25">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
              CSV · total filtrado
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Todas las filas que coinciden con los filtros actuales ({total ?? '—'}). Puede tardar si hay muchas.
            </p>
            {totalExportError && (
              <p className="text-xs text-red-600 dark:text-red-400">{totalExportError}</p>
            )}
            <Button
              variant="secondary"
              onClick={() => void exportTotalCsv()}
              disabled={
                loading ||
                exportingTotal ||
                total === null ||
                total === 0
              }
              className="self-start"
            >
              {exportingTotal ? 'Generando…' : 'Descargar total'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Entidad
            <Select
              value={entityType}
              onChange={setEntityType}
              options={ENTITY_TYPE_OPTIONS.map((v) => ({
                value: v,
                label: v === '' ? 'Todas' : v,
              }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Acción
            <Select
              value={action}
              onChange={setAction}
              options={[
                { value: '', label: 'Todas' },
                ...AUDIT_ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
              ]}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 sm:col-span-2 xl:col-span-2">
            Correo del actor
            <input
              type="email"
              value={actorEmailDraft}
              onChange={(e) => setActorEmailDraft(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            />
          </label>
        </div>
        <div>
          <Button variant="secondary" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}
      <>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {showFilteredEmpty && (
            <p className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Sin resultados para los filtros actuales.
            </p>
          )}
          {showEmpty && (
            <p className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
              No hay registros de auditoría.
            </p>
          )}
          {(!showEmpty && !showFilteredEmpty) || loading ? (
            <DataTable
              isLoading={loading}
              columns={columns}
              rows={rows}
              keyExtractor={(l) => l.id}
            />
          ) : null}
        </div>
        {hasMore && !loading && rows.length > 0 && (
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
    </>
  )
}
