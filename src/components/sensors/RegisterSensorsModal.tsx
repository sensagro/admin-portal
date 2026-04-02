import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const TERMINAL_ID_HEX = /^[0-9a-f]{10}$/i

export function parseTerminalIds(raw: string): { ok: true; ids: string[] } | { ok: false; error: string } {
  const parts = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return { ok: false, error: 'Añade al menos un terminal ID (10 caracteres hexadecimales).' }
  }

  const invalid = parts.filter((id) => !TERMINAL_ID_HEX.test(id))
  if (invalid.length > 0) {
    const sample = invalid.slice(0, 3).join(', ')
    return {
      ok: false,
      error: `IDs inválidos (deben ser exactamente 10 hex): ${sample}${invalid.length > 3 ? '…' : ''}`,
    }
  }

  const unique = [...new Set(parts.map((id) => id.toLowerCase()))]
  return { ok: true, ids: unique }
}

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
        Un ID por línea, o separados por comas. Cada uno debe ser exactamente{' '}
        <span className="font-mono text-gray-800">10</span> caracteres hexadecimales.
      </p>
      <textarea
        className="mb-3 min-h-32 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        placeholder={'a1b2c3d4e5\nf6e7d8c9b0'}
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
