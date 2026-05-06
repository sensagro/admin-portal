import { useState } from 'react'
import type { User, UserRole } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { roleBadge } from './userColumns'

const ROLE_OPTIONS = [
  { value: 'FARMER' as UserRole, label: 'Agricultor' },
  { value: 'ADMIN' as UserRole, label: 'Administrador' },
]

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
  const [showConfirm, setShowConfirm] = useState(false)
  if (!user) return null

  const currentBadge = roleBadge[user.role]
  const unchanged = selectedRole === user.role

  return (
    <>
      <Modal open title="Cambiar rol" onClose={onClose}>
        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
          Usuario:{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
        </p>
        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          Rol actual:
          <Badge label={currentBadge.label} variant={currentBadge.variant} />
        </p>

        <label className="mb-1 block text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
          Nuevo rol
        </label>
        <div className="mb-4">
          <Select
            value={selectedRole}
            onChange={(v) => onSelectedRoleChange(v as UserRole)}
            options={ROLE_OPTIONS}
            disabled={busy}
          />
        </div>

        <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Los permisos del usuario se actualizan en el sistema y en Firebase. No puedes cambiar tu
          propio rol desde aquí.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowConfirm(true)}
            disabled={busy || unchanged}
          >
            Guardar
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar cambio de rol"
        entityLabel={user.email}
        body={
          <>
            <p>
              El rol pasará de{' '}
              <strong>{ROLE_OPTIONS.find((o) => o.value === user.role)?.label}</strong> a{' '}
              <strong>{ROLE_OPTIONS.find((o) => o.value === selectedRole)?.label}</strong>.
            </p>
            <p>Se actualizan la base de datos y las reclamaciones de Firebase para este usuario.</p>
          </>
        }
        reversibility="reversible"
        confirmLabel="Confirmar"
        onConfirm={() => {
          setShowConfirm(false)
          onSave()
        }}
        onCancel={() => setShowConfirm(false)}
        loading={busy}
        error={null}
        confirmTone="default"
      />
    </>
  )
}
