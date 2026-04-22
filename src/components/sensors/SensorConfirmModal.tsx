import type { ReactNode } from 'react'
import type { Sensor } from '@/types'
import { ConfirmDialog, type ReversibilityHint } from '@/components/ui/ConfirmDialog'

export type ConfirmKind = 'unassign' | 'suspend' | 'decommission'

interface ConfirmCopy {
  title: string
  body: ReactNode
  confirmLabel: string
  confirmTone: 'default' | 'danger'
  reversibility: ReversibilityHint
}

function buildCopy(kind: ConfirmKind, sensor: Sensor): ConfirmCopy {
  switch (kind) {
    case 'unassign':
      return {
        title: '¿Desasignar este sensor?',
        body: (
          <>
            <p>
              El sensor dejará de pertenecer a <strong>{sensor.ownerEmail}</strong>. Pasará a{' '}
              <strong>sin asignar</strong>: se borran propietario, finca vinculada y fechas de asignación en el sistema.
            </p>
            <p>
              No es lo mismo que suspender: el hardware sigue registrado y podrás asignarlo a otro usuario después.
            </p>
          </>
        ),
        confirmLabel: 'Desasignar',
        confirmTone: 'default',
        reversibility: 'reversible',
      }
    case 'suspend':
      return {
        title: '¿Suspender este sensor?',
        body: (
          <>
            <p>
              El sensor pasará a estado <strong>suspendido</strong>. En el backend solo cambia el estado a SUSPENDED;
              el propietario actual (si lo hay) <strong>no se elimina</strong> de la base de datos.
            </p>
            <p>
              No existe hoy un endpoint de &quot;reactivar&quot;: para volver a operación normal suele usarse{' '}
              <strong>Asignar</strong> de nuevo (al mismo u otro usuario), que deja el sensor en ASSIGNED.
            </p>
            <p>No se puede suspender un sensor ya decomisionado.</p>
          </>
        ),
        confirmLabel: 'Suspender',
        confirmTone: 'default',
        reversibility: 'reversible',
      }
    case 'decommission':
      return {
        title: '¿Decomisionar este sensor?',
        body: (
          <>
            <p>
              El sensor pasará a <strong>decomisionado</strong>: es el cierre definitivo del ciclo de vida en
              plataforma. Se eliminan propietario, finca y datos de asignación.
            </p>
            <p>
              No podrás asignarlo de nuevo (el backend rechaza asignar un sensor decomisionado). Úsalo para equipos
              dados de baja o que no deben volver a usarse en Sensagro.
            </p>
            <p>Esta acción queda registrada en auditoría.</p>
          </>
        ),
        confirmLabel: 'Decomisionar',
        confirmTone: 'danger',
        reversibility: 'irreversible',
      }
  }
}

interface SensorConfirmModalProps {
  kind: ConfirmKind
  sensor: Sensor
  loading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function SensorConfirmModal({ kind, sensor, loading, error, onConfirm, onCancel }: SensorConfirmModalProps) {
  const copy = buildCopy(kind, sensor)
  return (
    <ConfirmDialog
      open
      title={copy.title}
      entityLabel={sensor.terminalId}
      body={copy.body}
      reversibility={copy.reversibility}
      confirmLabel={copy.confirmLabel}
      confirmTone={copy.confirmTone}
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
