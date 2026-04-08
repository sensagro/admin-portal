import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface RegisterSensorsModalProps {
  open: boolean
  onClose: () => void
  text: string
  onTextChange: (value: string) => void
  busy: boolean
  error: string | null
  onSubmit: () => void
}

export function RegisterSensorsModal({
  open,
  onClose,
  text,
  onTextChange,
  busy,
  error,
  onSubmit,
}: RegisterSensorsModalProps) {
  return (
    <Modal open={open} title="Registrar sensores" onClose={onClose}>
      <p className="mb-3 text-sm text-gray-600">
        Un ID por línea, o separados por comas. Usa el mismo identificador que Myriota (p. ej.{' '}
        <span className="font-mono text-gray-800">901820101000096</span>), hasta 128 caracteres.
      </p>
      <textarea
        className="mb-3 min-h-32 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        placeholder={'901820101000096\na1b2c3d4e5'}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={busy}
      />
      <p className="mb-3 text-xs text-gray-500">Tipo: sensor de agua (WATER_SENSOR).</p>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={busy}>
          {busy ? 'Registrando…' : 'Registrar'}
        </Button>
      </div>
    </Modal>
  )
}
