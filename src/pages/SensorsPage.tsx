import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError, fetchAdminSensors, type AdminSensorApiRow } from '@/lib/api'
import type { Sensor, SensorStatus, SensorType } from '@/types'
import type { Column } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'

const statusBadge: Record<
  SensorStatus,
  { label: string; variant: 'green' | 'blue' | 'gray' | 'yellow' | 'red' }
> = {
  ASSIGNED: { label: 'Asignado', variant: 'green' },
  UNASSIGNED: { label: 'Sin asignar', variant: 'gray' },
  SUSPENDED: { label: 'Suspendido', variant: 'yellow' },
  DECOMMISSIONED: { label: 'Decomisado', variant: 'red' },
}

function formatBattery(mv: number | null): string {
  if (mv === null) return '—'
  return `${(mv / 1000).toFixed(2)}V`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const columns: Column<Sensor>[] = [
  {
    key: 'terminalId',
    header: 'Terminal ID',
    render: (s) => <span className="font-mono text-xs">{s.terminalId}</span>,
  },
  {
    key: 'name',
    header: 'Nombre',
    render: (s) => <span className="font-medium text-gray-900">{s.name}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (s) => {
      const badge = statusBadge[s.status]
      return <Badge label={badge.label} variant={badge.variant} />
    },
  },
  {
    key: 'ownerEmail',
    header: 'Propietario',
    render: (s) => s.ownerEmail ?? <span className="text-gray-400">—</span>,
  },
  {
    key: 'farmName',
    header: 'Finca',
    render: (s) => s.farmName ?? <span className="text-gray-400">—</span>,
  },
  {
    key: 'lastReadingAt',
    header: 'Última lectura',
    render: (s) => formatDate(s.lastReadingAt),
  },
  {
    key: 'lastBatteryVoltage',
    header: 'Batería',
    render: (s) => formatBattery(s.lastBatteryVoltage),
  },
]

function mapRow(row: AdminSensorApiRow): Sensor {
  return {
    id: row.id,
    terminalId: row.terminalId,
    name: row.name,
    type: row.type as SensorType,
    status: row.status as SensorStatus,
    ownerEmail: row.owner?.email ?? null,
    farmName: row.farm?.name ?? null,
    lastReadingAt: row.lastReadingAt,
    lastBatteryVoltage: row.lastBatteryVoltage,
    createdAt: row.createdAt,
  }
}

export function SensorsPage() {
  const { getIdToken, signOut } = useAuth()
  const [rows, setRows] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminSensors(getIdToken)
      setRows(data.map(mapRow))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar sensores')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <PageHeader title="Sensores" count={loading ? undefined : rows.length} />
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando sensores…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <DataTable columns={columns} rows={rows} keyExtractor={(s) => s.id} />
        </div>
      )}
    </>
  )
}
