import { Link } from 'react-router-dom'
import type { Column } from '@/components/ui/DataTable'
import type { Sensor, SensorStatus, SensorType } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const statusBadge: Record<
  SensorStatus,
  { label: string; variant: 'green' | 'blue' | 'gray' | 'yellow' | 'red' }
> = {
  ASSIGNED: { label: 'Asignado', variant: 'green' },
  UNASSIGNED: { label: 'Sin asignar', variant: 'gray' },
  SUSPENDED: { label: 'Suspendido', variant: 'yellow' },
  DECOMMISSIONED: { label: 'Decomisado', variant: 'red' },
}

export const typeLabels: Record<SensorType, string> = {
  WATER_SENSOR: 'Sensor de agua',
}

export function formatBattery(mv: number | null): string {
  if (mv === null) return '—'
  return `${(mv / 1000).toFixed(2)}V`
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CR')
}

interface BuildColumnsOptions {
  canMutate: boolean
  onManage: (sensor: Sensor) => void
}

export function buildSensorColumns({ canMutate, onManage }: BuildColumnsOptions): Column<Sensor>[] {
  const columns: Column<Sensor>[] = [
    {
      key: 'terminalId',
      header: 'Terminal ID',
      render: (s) => (
        <Link to={`/sensors/${s.id}`} className="font-mono text-xs text-emerald-800 hover:underline">
          {s.terminalId}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (s) => (
        <Link to={`/sensors/${s.id}`} className="font-medium text-gray-900 hover:underline">
          {s.name}
        </Link>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (s) => typeLabels[s.type] ?? s.type,
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
      key: 'createdAt',
      header: 'Alta',
      render: (s) => formatDateShort(s.createdAt),
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

  if (canMutate) {
    columns.push({
      key: 'actions',
      header: 'Acciones',
      render: (s) => (
        <Button variant="secondary" className="py-1.5" onClick={() => onManage(s)}>
          Gestionar
        </Button>
      ),
    })
  }

  return columns
}
