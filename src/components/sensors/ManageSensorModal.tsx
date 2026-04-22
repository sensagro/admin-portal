import type { ReactNode } from 'react'
import type { Sensor } from '@/types'
import type { AdminUserRow } from '@/lib/api/users'
import type { ConfirmKind } from './SensorConfirmModal'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { statusBadge } from './sensorColumns'

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100'

function ActionSection({ title, hint, children }: { title: string; hint: ReactNode; children: ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-3 dark:border-slate-700">
      <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {title}
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{hint}</p>
      {children}
    </div>
  )
}

interface UserPickerProps {
  users: AdminUserRow[]
  selectedId: string
  filter: string
  onFilterChange: (v: string) => void
  onSelectChange: (v: string) => void
  placeholder: string
  disabled: boolean
}

function UserPicker({ users, selectedId, filter, onFilterChange, onSelectChange, placeholder, disabled }: UserPickerProps) {
  return (
    <>
      <input
        type="search"
        className={`mb-2 ${inputClass}`}
        placeholder="Filtrar por email…"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        disabled={disabled}
      />
      <select
        className={`mb-2 text-gray-900 ${inputClass}`}
        value={selectedId}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.email} ({u.role})
          </option>
        ))}
      </select>
    </>
  )
}

export interface ManageSensorModalProps {
  sensor: Sensor | null
  onClose: () => void
  users: AdminUserRow[]
  userFilter: string
  onUserFilterChange: (v: string) => void
  assignUserId: string
  onAssignUserIdChange: (v: string) => void
  onAssign: () => void
  transferUserId: string
  onTransferUserIdChange: (v: string) => void
  onTransfer: () => void
  busy: boolean
  error: string | null
  confirmKind: ConfirmKind | null
  onRequestConfirm: (kind: ConfirmKind) => void
}

export function ManageSensorModal({
  sensor,
  onClose,
  users,
  userFilter,
  onUserFilterChange,
  assignUserId,
  onAssignUserIdChange,
  onAssign,
  transferUserId,
  onTransferUserIdChange,
  onTransfer,
  busy,
  error,
  confirmKind,
  onRequestConfirm,
}: ManageSensorModalProps) {
  if (!sensor) return null

  const isConfirmPending = confirmKind !== null
  const showAssign = sensor.status !== 'ASSIGNED' && sensor.status !== 'DECOMMISSIONED'
  const showTransfer = sensor.status === 'ASSIGNED'
  const showUnassign = sensor.status === 'ASSIGNED'
  const showSuspend = sensor.status !== 'DECOMMISSIONED'
  const transferableUsers = users.filter((u) => u.id !== sensor.ownerId)

  return (
    <Modal open title="Gestionar sensor" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-slate-800/60">
          <div className="font-mono text-gray-900 dark:text-gray-100">{sensor.terminalId}</div>
          <div className="text-gray-700 dark:text-gray-300">{sensor.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge label={statusBadge[sensor.status].label} variant={statusBadge[sensor.status].variant} />
            {sensor.ownerEmail && (
              <span className="text-gray-600 dark:text-gray-400">Propietario: {sensor.ownerEmail}</span>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

        {showAssign && (
          <ActionSection
            title="Asignar a usuario"
            hint={
              <>
                Vincula el sensor a un usuario y lo deja en estado <strong>asignado</strong>. Solo disponible si no
                está ya asignado (si lo está, usa transferir) y no está decomisionado. También sirve para sacar un
                sensor <strong>suspendido</strong> de ese estado al volver a asignarlo.
              </>
            }
          >
            <UserPicker
              users={users}
              selectedId={assignUserId}
              filter={userFilter}
              onFilterChange={onUserFilterChange}
              onSelectChange={onAssignUserIdChange}
              placeholder="Seleccionar usuario…"
              disabled={busy}
            />
            <Button variant="primary" disabled={busy || !assignUserId} onClick={onAssign}>
              Asignar
            </Button>
          </ActionSection>
        )}

        {showTransfer && (
          <ActionSection
            title="Transferir a otro usuario"
            hint={
              <>
                Solo con el sensor en <strong>asignado</strong>. Cambia el propietario al usuario elegido; el campo
                vinculado se limpia en el servidor para evitar inconsistencias.
              </>
            }
          >
            <UserPicker
              users={transferableUsers}
              selectedId={transferUserId}
              filter={userFilter}
              onFilterChange={onUserFilterChange}
              onSelectChange={onTransferUserIdChange}
              placeholder="Seleccionar nuevo propietario…"
              disabled={busy}
            />
            <Button variant="primary" disabled={busy || !transferUserId} onClick={onTransfer}>
              Transferir
            </Button>
          </ActionSection>
        )}

        {showUnassign && (
          <ActionSection
            title="Desasignar"
            hint={
              <>
                Solo con el sensor en <strong>asignado</strong>. Quita propietario y el campo; el sensor queda{' '}
                <strong>sin asignar</strong> y listo para asignarse a otro usuario más adelante.
              </>
            }
          >
            <Button
              variant="secondary"
              disabled={busy || isConfirmPending}
              onClick={() => onRequestConfirm('unassign')}
            >
              Desasignar…
            </Button>
          </ActionSection>
        )}

        {showSuspend && (
          <ActionSection
            title="Suspender"
            hint={
              <>
                Marca el sensor como suspendido (p. ej. morosidad o revisión). El propietario en base de datos no se
                borra.
              </>
            }
          >
            <Button
              variant="secondary"
              disabled={busy || isConfirmPending}
              onClick={() => onRequestConfirm('suspend')}
            >
              Suspender…
            </Button>
          </ActionSection>
        )}

        <ActionSection
          title="Decomisionar"
          hint="Baja definitiva en plataforma: estado decomisionado, sin propietario, y el backend no permite volver a asignarlo."
        >
          <Button
            variant="danger"
            disabled={busy || isConfirmPending}
            onClick={() => onRequestConfirm('decommission')}
          >
            Decomisionar…
          </Button>
        </ActionSection>

        <div className="flex justify-end border-t border-gray-100 pt-3 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
