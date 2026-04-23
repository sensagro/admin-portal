import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export type UserSuspendModalKind = 'suspend' | 'reactivate'

interface SuspendUserModalProps {
  open: boolean
  kind: UserSuspendModalKind
  userEmail: string
  sensorCount: number
  loading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function SuspendUserModal({
  open,
  kind,
  userEmail,
  sensorCount,
  loading,
  error,
  onConfirm,
  onCancel,
}: SuspendUserModalProps) {
  const isSuspend = kind === 'suspend'
  return (
    <ConfirmDialog
      open={open}
      title={isSuspend ? '¿Suspender usuario?' : '¿Reactivar usuario?'}
      entityLabel={userEmail}
      body={
        isSuspend ? (
          <>
            <p>
              Se suspenderán <strong>{sensorCount}</strong> sensor
              {sensorCount === 1 ? '' : 'es'} asignado
              {sensorCount === 1 ? '' : 's'} a este usuario (estado SUSPENDED en plataforma).
            </p>
            <p>
              El usuario podrá seguir iniciando sesión en la app; solo dejan de operar como sensores asignados hasta
              que reactives la cuenta desde aquí.
            </p>
          </>
        ) : (
          <>
            <p>
              Se reactivarán <strong>{sensorCount}</strong> sensor
              {sensorCount === 1 ? '' : 'es'} que fueron suspendidos por esta baja de usuario (vuelven a ASSIGNED).
            </p>
            <p>
              Los sensores suspendidos manualmente por staff (sin marca de baja de usuario) no se modifican.
            </p>
          </>
        )
      }
      reversibility="reversible"
      confirmLabel={isSuspend ? 'Suspender' : 'Reactivar'}
      confirmTone={isSuspend ? 'danger' : 'default'}
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
