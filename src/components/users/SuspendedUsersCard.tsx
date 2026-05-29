import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminUsers, type AdminUserRow } from '@/lib/api/users'
import { DashboardListRow } from '@/components/ui/DashboardListRow'

const PAGE_SIZE = 100
const PREVIEW_LIMIT = 10

/** No server-side suspended filter yet; scan paginated list client-side. */
async function loadSuspendedUsers(
  getIdToken: () => Promise<string | null>,
): Promise<{ items: AdminUserRow[]; total: number }> {
  const suspended: AdminUserRow[] = []
  let cursor: string | undefined

  for (;;) {
    const res = await fetchAdminUsers(getIdToken, PAGE_SIZE, cursor)
    suspended.push(...res.items.filter((u) => u.suspendedAt != null))
    if (res.items.length < PAGE_SIZE) break
    cursor = res.items[res.items.length - 1]?.id
    if (!cursor) break
  }

  return {
    total: suspended.length,
    items: suspended.slice(0, PREVIEW_LIMIT),
  }
}

function formatSuspendedAgo(iso: string): string {
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

export function SuspendedUsersCard() {
  const { getIdToken, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await loadSuspendedUsers(getIdToken)
      setRows(res.items)
      setTotal(res.total)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios suspendidos')
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
          onClick={() => navigate('/users')}
          className="text-left text-sm font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300"
        >
          Usuarios suspendidos{' '}
          <span className="font-normal text-gray-500 dark:text-gray-400">({total})</span>
        </button>
        {total > 0 && (
          <Link
            to="/users"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ver todos
          </Link>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No hay usuarios suspendidos.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-slate-800 dark:border-slate-700">
          {rows.map((row) => (
            <li key={row.id}>
              <DashboardListRow
                onClick={() => navigate(`/users/${encodeURIComponent(row.id)}`)}
                primary={row.email}
                primaryClassName="text-gray-900 dark:text-gray-100"
                tertiary={row.suspendedAt ? formatSuspendedAgo(row.suspendedAt) : '—'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
