import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError, fetchAuditLogs, type AuditLogApiRow } from '@/lib/api'
import type { AuditLog } from '@/types'
import type { Column } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'

const columns: Column<AuditLog>[] = [
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (log) =>
      new Date(log.createdAt).toLocaleString('es-CR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
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
    render: (log) =>
      log.payload ? (
        <span className="text-xs text-gray-500">{JSON.stringify(log.payload)}</span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
]

function mapRow(row: AuditLogApiRow): AuditLog {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    actorEmail: row.actor.email,
    payload: row.payload,
    createdAt: row.createdAt,
  }
}

export function AuditLogPage() {
  const { getIdToken, signOut } = useAuth()
  const [rows, setRows] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAuditLogs(getIdToken)
      setRows(data.map(mapRow))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar auditoría')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <PageHeader title="Registro de auditoría" count={loading ? undefined : rows.length} />
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando auditoría…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <DataTable columns={columns} rows={rows} keyExtractor={(l) => l.id} />
        </div>
      )}
    </>
  )
}
