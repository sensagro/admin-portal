import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminSensors, type AdminSensorApiRow } from '@/lib/api/sensors'
import { mapSensorRow } from '@/lib/mappers/sensor'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { DashboardListRow } from '@/components/ui/DashboardListRow'
import type { Sensor, SensorSignalStatus, SensorStatus } from '@/types'

const FLEET_PREVIEW_LIMIT = 50
const ROWS_SHOWN = 5

function formatLastReadingAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / (60 * 1000))
  const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })
  if (Math.abs(minutes) < 60) {
    return rtf.format(-minutes, 'minute')
  }
  const hours = Math.round(diffMs / (3600 * 1000))
  if (Math.abs(hours) < 48) {
    return rtf.format(-hours, 'hour')
  }
  const days = Math.round(diffMs / (24 * 3600 * 1000))
  return rtf.format(-days, 'day')
}

function sortSilentRows(rows: AdminSensorApiRow[]): AdminSensorApiRow[] {
  return [...rows].sort((a, b) => {
    const ta = a.lastReadingAt ? new Date(a.lastReadingAt).getTime() : 0
    const tb = b.lastReadingAt ? new Date(b.lastReadingAt).getTime() : 0
    return ta - tb
  })
}

function sortNeverRows(rows: AdminSensorApiRow[]): AdminSensorApiRow[] {
  return [...rows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

type Props = {
  refreshKey: number
  onApplySignalTableFilter: (status: SensorSignalStatus | null) => void
  onApplyStatusTableFilter: (status: SensorStatus | null) => void
  onOpenSensor: (sensor: Sensor) => void
}

export function FleetSignalCard({
  refreshKey,
  onApplySignalTableFilter,
  onApplyStatusTableFilter,
  onOpenSensor,
}: Props) {
  const { getIdToken, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [silent, setSilent] = useState<{ items: AdminSensorApiRow[]; total: number }>({
    items: [],
    total: 0,
  })
  const [neverReported, setNeverReported] = useState<{
    items: AdminSensorApiRow[]
    total: number
  }>({ items: [], total: 0 })
  const [unassigned, setUnassigned] = useState<{
    items: AdminSensorApiRow[]
    total: number
  }>({ items: [], total: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [silentRes, neverRes, unassignedRes] = await Promise.all([
        fetchAdminSensors(getIdToken, FLEET_PREVIEW_LIMIT, undefined, 'SILENT'),
        fetchAdminSensors(getIdToken, FLEET_PREVIEW_LIMIT, undefined, 'NEVER_REPORTED'),
        fetchAdminSensors(getIdToken, FLEET_PREVIEW_LIMIT, undefined, undefined, {
          status: 'UNASSIGNED',
          orderBy: 'unassignedAt:desc',
        }),
      ])
      setSilent({
        items: sortSilentRows(silentRes.items).slice(0, ROWS_SHOWN),
        total: silentRes.total,
      })
      setNeverReported({
        items: sortNeverRows(neverRes.items).slice(0, ROWS_SHOWN),
        total: neverRes.total,
      })
      setUnassigned({
        items: unassignedRes.items.slice(0, ROWS_SHOWN),
        total: unassignedRes.total,
      })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar estado de flota')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  return (
    <CollapsibleCard title="Estado de flota" loading={loading} error={error}>
      <div className="flex flex-col gap-5">
        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Sin señal{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">({silent.total})</span>
              </span>
            </div>
            {silent.total > 0 && (
              <button
                type="button"
                onClick={() => onApplySignalTableFilter('SILENT')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver todos
              </button>
            )}
          </div>
          {silent.total === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Toda la flota transmitiendo.</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
              {silent.items.map((row) => (
                <li key={row.id}>
                  <DashboardListRow
                    onClick={() => onOpenSensor(mapSensorRow(row))}
                    primary={row.terminalId}
                    secondary={row.owner?.email ?? '—'}
                    tertiary={row.lastReadingAt ? formatLastReadingAgo(row.lastReadingAt) : '—'}
                    tertiaryClassName="text-amber-700 dark:text-amber-300"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {neverReported.total > 0 && (
          <section>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Esperando primera lectura{' '}
                  <span className="font-normal text-gray-500 dark:text-gray-400">({neverReported.total})</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onApplySignalTableFilter('NEVER_REPORTED')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver todos
              </button>
            </div>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
              {neverReported.items.map((row) => (
                <li key={row.id}>
                  <DashboardListRow
                    onClick={() => onOpenSensor(mapSensorRow(row))}
                    primary={row.terminalId}
                    secondary={row.owner?.email ?? '—'}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {unassigned.total > 0 && (
          <section>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Sin asignar{' '}
                  <span className="font-normal text-gray-500 dark:text-gray-400">({unassigned.total})</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onApplyStatusTableFilter('UNASSIGNED')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver todos
              </button>
            </div>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
              {unassigned.items.map((row) => (
                <li key={row.id}>
                  <DashboardListRow
                    onClick={() => onOpenSensor(mapSensorRow(row))}
                    primary={row.terminalId}
                    secondary="—"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </CollapsibleCard>
  )
}
