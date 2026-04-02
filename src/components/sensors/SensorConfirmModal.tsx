import type { ReactNode } from 'react'
import type { Sensor } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export type ConfirmKind = 'unassign' | 'suspend' | 'decommission'

interface ConfirmCopy {
  title: string
  description: ReactNode
  confirmLabel: string
  variant: 'default' | 'danger'
}

function buildCopy(kind: ConfirmKind, sensor: Sensor): ConfirmCopy {
  const tid = <span className="font-mono text-gray-800">{sensor.terminalId}</span>

  switch (kind) {
    case 'unassign':
      return {
        title: '¿Desasignar este sensor?',
        description: (
          <>
            <p className="mb-2">
              El sensor {tid} dejará de pertenecer a <strong>{sensor.ownerEmail}</strong>. Pasará a{' '}
              <strong>sin asignar</strong>: se borran propietario, finca vinculada y fechas de asignación en el sistema.
            </p>
            <p>
              No es lo mismo que suspender: el hardware sigue registrado y podrás asignarlo a otro usuario después.
            </p>
          </>
        ),
        confirmLabel: 'Desasignar',
        variant: 'default',
      }
    case 'suspend':
      return {
        title: '¿Suspender este sensor?',
        description: (
          <>
            <p className="mb-2">
              El sensor {tid} pasará a estado <strong>suspendido</strong>. En el backend solo cambia el estado a
              SUSPENDED; el propietario actual (si lo hay) <strong>no se elimina</strong> de la base de datos.
            </p>
            <p className="mb-2">
              No existe hoy un endpoint de "reactivar": para volver a operación normal suele usarse{' '}
              <strong>Asignar</strong> de nuevo (al mismo u otro usuario), que deja el sensor en ASSIGNED.
            </p>
            <p>No se puede suspender un sensor ya decomisionado.</p>
          </>
        ),
        confirmLabel: 'Suspender',
        variant: 'default',
      }
    case 'decommission':
      return {
        title: '¿Decomisionar este sensor?',
        description: (
          <>
            <p className="mb-2">
              El sensor {tid} pasará a <strong>decomisionado</strong>: es el cierre definitivo del ciclo de vida en
              plataforma. Se eliminan propietario, finca y datos de asignación.
            </p>
            <p className="mb-2">
              No podrás asignarlo de nuevo (el backend rechaza asignar un sensor decomisionado). Úsalo para equipos
              dados de baja o que no deben volver a usarse en Sensagro.
            </p>
            <p>Esta acción queda registrada en auditoría.</p>
          </>
        ),
        confirmLabel: 'Decomisionar',
        variant: 'danger',
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
    <ConfirmModal
      open
      {...copy}
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
