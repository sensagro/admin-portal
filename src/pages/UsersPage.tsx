import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError, fetchAdminUsers, type AdminUserRow } from '@/lib/api'
import type { User, UserRole } from '@/types'
import type { Column } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'

const roleBadge: Record<UserRole, { label: string; variant: 'green' | 'blue' | 'gray' }> = {
  ADMIN: { label: 'Admin', variant: 'green' },
  FARMER: { label: 'Farmer', variant: 'blue' },
  SUPPORT: { label: 'Support', variant: 'gray' },
}

const columns: Column<User>[] = [
  {
    key: 'email',
    header: 'Email',
    render: (user) => <span className="font-medium text-gray-900">{user.email}</span>,
  },
  {
    key: 'role',
    header: 'Rol',
    render: (user) => {
      const badge = roleBadge[user.role]
      return <Badge label={badge.label} variant={badge.variant} />
    },
  },
  {
    key: 'createdAt',
    header: 'Registrado',
    render: (user) => new Date(user.createdAt).toLocaleDateString('es-CR'),
  },
  {
    key: 'updatedAt',
    header: 'Última actualización',
    render: (user) => new Date(user.updatedAt).toLocaleDateString('es-CR'),
  },
]

function mapRow(row: AdminUserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function UsersPage() {
  const { getIdToken, signOut } = useAuth()
  const [rows, setRows] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers(getIdToken)
      setRows(data.map(mapRow))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [getIdToken, signOut])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <PageHeader title="Usuarios registrados" count={loading ? undefined : rows.length} />
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando usuarios…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <DataTable columns={columns} rows={rows} keyExtractor={(u) => u.id} />
        </div>
      )}
    </>
  )
}
