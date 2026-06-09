import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminSensors, type AdminSensorApiRow } from '@/lib/api/sensors'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { DashboardListRow } from '@/components/ui/DashboardListRow'

const LIMIT = 10

function formatUnassignedAgo(iso: string): string {
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

export function RecentlyUnassignedCard() {
  const { getIdToken, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AdminSensorApiRow[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminSensors(getIdToken, LIMIT, undefined, undefined, {
        status: 'UNASSIGNED',
        orderBy: 'unassignedAt:desc',
      })
      setRows(res.items)
      setTotal(res.total)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar sensores sin asignar')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <CollapsibleCard
      title="Desasignados recientemente"
      count={total}
      viewAllHref={total > 0 ? '/sensors?status=UNASSIGNED' : undefined}
      loading={loading}
      error={error}
    >
      {total === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No hay sensores sin asignar.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
          {rows.map((row) => (
            <li key={row.id}>
              <DashboardListRow
                onClick={() => navigate(`/sensors/${encodeURIComponent(row.id)}`)}
                primary={row.terminalId}
                tertiary={row.unassignedAt ? formatUnassignedAgo(row.unassignedAt) : '—'}
              />
            </li>
          ))}
        </ul>
      )}
    </CollapsibleCard>
  )
}
