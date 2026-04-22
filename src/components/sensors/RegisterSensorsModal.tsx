import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  analyzeTerminalInput,
  canSubmit,
  rowStatusLabel,
  terminalIdsToRegister,
} from '@/utils/terminalRegisterPreview'

interface RegisterSensorsModalProps {
  open: boolean
  onClose: () => void
  text: string
  onTextChange: (value: string) => void
  existingTerminalIds: ReadonlySet<string>
  busy: boolean
  error: string | null
  onSubmit: (terminalIds: string[]) => void
}

export function RegisterSensorsModal({
  open,
  onClose,
  text,
  onTextChange,
  existingTerminalIds,
  busy,
  error,
  onSubmit,
}: RegisterSensorsModalProps) {
  const [ignoreInvalid, setIgnoreInvalid] = useState(false)
  const previewRows = useMemo(
    () => (open ? analyzeTerminalInput(text, existingTerminalIds) : []),
    [text, existingTerminalIds, open],
  )
  const toSend = useMemo(() => terminalIdsToRegister(previewRows), [previewRows])
  const submitCheck = canSubmit(previewRows, ignoreInvalid)
  const canClickSubmit = submitCheck.ok && toSend.length > 0

  return (
    <Modal open={open} title="Registrar sensores" onClose={onClose}>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Un ID por línea, o separados por comas, tabulación o punto y coma. Mismo identificador que Myriota (p. ej.{' '}
        <span className="font-mono text-gray-800 dark:text-gray-200">901820101000096</span>), 1 a 128 caracteres.
      </p>
      <textarea
        className="mb-3 min-h-28 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-gray-500"
        placeholder={'901820101000096\na1b2c3d4e5'}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={busy}
      />
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Tipo: sensor de agua (WATER_SENSOR).</p>

      <div
        className="mb-3 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 dark:border-slate-600"
        aria-label="Vista previa de terminal IDs"
      >
        {previewRows.length === 0 ? (
          <p className="p-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Escribí o pegá arriba; la tabla se llena con una fila por ID (se actualiza al instante).
          </p>
        ) : (
          <table className="w-full min-w-0 text-left text-xs">
            <thead>
              <tr className="sticky top-0 z-[1] border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/80">
                <th className="px-2 py-1.5 font-medium">#</th>
                <th className="px-2 py-1.5 font-medium">Terminal ID</th>
                <th className="w-[36%] min-w-[6.5rem] font-medium sm:w-[32%]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((r) => (
                <tr
                  key={r.index}
                  className="border-b border-gray-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{r.index}</td>
                  <td className="px-2 py-1 font-mono break-all text-gray-800 dark:text-gray-200">
                    {r.terminalId}
                  </td>
                  <td className="px-2 py-1 align-top">
                    <span
                      className={
                        r.status === 'valid'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-800 dark:text-amber-300'
                      }
                    >
                      {rowStatusLabel(r.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <label className="mb-3 flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          className="mt-1"
          checked={ignoreInvalid}
          onChange={(e) => setIgnoreInvalid(e.target.checked)}
          disabled={busy}
        />
        <span>Ignorar inválidos y duplicados y registrar solo los válidos</span>
      </label>

      {/* Fixed height: validation hint + API error scroll inside, buttons stay put */}
      <div
        className="mb-3 h-16 overflow-y-auto text-sm"
        role="status"
        aria-live="polite"
      >
        {!submitCheck.ok && (
          <p className="pr-0.5 text-amber-800 dark:text-amber-300">{submitCheck.reason}</p>
        )}
        {error && (
          <p
            className={
              !submitCheck.ok
                ? 'mt-1 text-red-600 dark:text-red-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {error}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => onSubmit(toSend)}
          disabled={busy || !canClickSubmit}
        >
          {busy ? 'Registrando…' : `Registrar${toSend.length > 0 ? ` (${toSend.length})` : ''}`}
        </Button>
      </div>
    </Modal>
  )
}
