import type { User, UserRole } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { roleBadge } from './userColumns'

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600'

const ROLE_OPTIONS: UserRole[] = ['FARMER', 'ADMIN', 'SUPPORT']

const roleOptionLabel: Record<UserRole, string> = {
  FARMER: 'Agricultor',
  ADMIN: 'Administrador',
  SUPPORT: 'Soporte',
}

export interface ChangeUserRoleModalProps {
  user: User | null
  selectedRole: UserRole
  onSelectedRoleChange: (role: UserRole) => void
  onClose: () => void
  onSave: () => void
  busy: boolean
  error: string | null
}

export function ChangeUserRoleModal({
  user,
  selectedRole,
  onSelectedRoleChange,
  onClose,
  onSave,
  busy,
  error,
}: ChangeUserRoleModalProps) {
  if (!user) return null

  const currentBadge = roleBadge[user.role]
  const unchanged = selectedRole === user.role

  return (
    <Modal open title="Cambiar rol" onClose={onClose}>
      <p className="mb-1 text-sm text-gray-600">
        Usuario: <span className="font-medium text-gray-900">{user.email}</span>
      </p>
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        Rol actual:
        <Badge label={currentBadge.label} variant={currentBadge.variant} />
      </p>

      <label htmlFor="user-role-select" className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
        Nuevo rol
      </label>
      <select
        id="user-role-select"
        className={`mb-4 ${inputClass}`}
        value={selectedRole}
        onChange={(e) => onSelectedRoleChange(e.target.value as UserRole)}
        disabled={busy}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {roleOptionLabel[r]}
          </option>
        ))}
      </select>

      <p className="mb-4 text-xs leading-relaxed text-gray-500">
        Los permisos del usuario se actualizan en el sistema y en Firebase. No puedes cambiar tu propio rol desde aquí.
      </p>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={busy || unchanged}>
          Guardar
        </Button>
      </div>
    </Modal>
  )
}
