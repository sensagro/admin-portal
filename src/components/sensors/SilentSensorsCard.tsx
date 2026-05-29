import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminSensors, type AdminSensorApiRow } from '@/lib/api/sensors'
import { DashboardListRow } from '@/components/ui/DashboardListRow'

const LIMIT = 10

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

export function SilentSensorsCard() {
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
      const res = await fetchAdminSensors(getIdToken, LIMIT, undefined, 'SILENT')
      setRows(sortSilentRows(res.items))
      setTotal(res.total)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar sensores en silencio')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/sensors?signalStatus=SILENT')}
          className="text-left text-sm font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300"
        >
          Sensores en silencio{' '}
          <span className="font-normal text-gray-500 dark:text-gray-400">({total})</span>
        </button>
        {total > 0 && (
          <Link
            to="/sensors?signalStatus=SILENT"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ver todos
          </Link>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Toda la flota transmitiendo.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
          {rows.map((row) => (
            <li key={row.id}>
              <DashboardListRow
                onClick={() => navigate(`/sensors/${encodeURIComponent(row.id)}`)}
                primary={row.terminalId}
                secondary={row.owner?.email ?? '—'}
                tertiary={
                  row.lastReadingAt ? formatLastReadingAgo(row.lastReadingAt) : '—'
                }
                tertiaryClassName="text-amber-700 dark:text-amber-300"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
