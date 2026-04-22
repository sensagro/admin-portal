import { Link } from 'react-router-dom'
import type { Column } from '@/components/ui/DataTable'
import type { User, UserRole } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const roleBadge: Record<UserRole, { label: string; variant: 'green' | 'blue' | 'gray' }> = {
  ADMIN: { label: 'Admin', variant: 'green' },
  FARMER: { label: 'Farmer', variant: 'blue' },
  SUPPORT: { label: 'Support', variant: 'gray' },
}

interface BuildUserColumnsOptions {
  canChangeRole: boolean
  currentUserId: string | undefined
  onChangeRole: (user: User) => void
}

export function buildUserColumns({
  canChangeRole,
  currentUserId,
  onChangeRole,
}: BuildUserColumnsOptions): Column<User>[] {
  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <Link
          to={`/users/${user.id}`}
          className="font-medium text-emerald-800 hover:underline dark:text-emerald-400"
        >
          {user.email}
        </Link>
      ),
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

  if (canChangeRole) {
    columns.push({
      key: 'actions',
      header: 'Acciones',
      render: (user) => {
        const isSelf = user.id === currentUserId
        return (
          <span
            className="inline-block"
            title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
          >
            <Button
              variant="secondary"
              className="py-1.5"
              disabled={isSelf}
              onClick={() => onChangeRole(user)}
            >
              Cambiar rol
            </Button>
          </span>
        )
      },
    })
  }

  return columns
}
