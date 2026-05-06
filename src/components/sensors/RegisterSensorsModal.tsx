import { useCallback, useMemo, useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import {
  analyzeRows,
  canSubmit,
  sensorsToRegister,
  splitPastedIds,
  SENSOR_TYPES,
  type SensorInputRow,
  type SensorType,
} from '@/utils/terminalRegisterPreview'

let _rowSeq = 0
function newRow(terminalId = ''): SensorInputRow {
  return { rowId: String(++_rowSeq), terminalId, name: '', type: 'WATER_SENSOR' }
}

const inlineInput =
  'w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs text-gray-900 ' +
  'placeholder:text-gray-400/60 transition-colors ' +
  'hover:border-gray-200 hover:bg-gray-50/60 ' +
  'focus:border-emerald-500 focus:bg-white focus:outline-none ' +
  'disabled:opacity-50 ' +
  'dark:text-gray-100 dark:placeholder:text-gray-600 ' +
  'dark:hover:border-slate-600 dark:hover:bg-slate-700/30 ' +
  'dark:focus:border-emerald-500 dark:focus:bg-slate-800'

interface RegisterSensorsModalProps {
  open: boolean
  onClose: () => void
  existingTerminalIds: ReadonlySet<string>
  busy: boolean
  error: string | null
  onSubmit: (sensors: { terminalId: string; name: string; type: SensorType }[]) => void
}

export function RegisterSensorsModal({
  open,
  onClose,
  existingTerminalIds,
  busy,
  error,
  onSubmit,
}: RegisterSensorsModalProps) {
  const [rows, setRows] = useState<SensorInputRow[]>(() => [newRow()])
  const [ignoreInvalid, setIgnoreInvalid] = useState(true)

  const previewRows = useMemo(
    () => (open ? analyzeRows(rows, existingTerminalIds) : []),
    [rows, existingTerminalIds, open],
  )
  const toSend = useMemo(() => sensorsToRegister(previewRows), [previewRows])
  const submitCheck = canSubmit(previewRows, ignoreInvalid)
  const canClickSubmit = submitCheck.ok && toSend.length > 0

  const addRow = useCallback(() => setRows((prev) => [...prev, newRow()]), [])

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.rowId !== rowId)
      return next.length > 0 ? next : [newRow()]
    })
  }, [])

  const updateRow = useCallback(
    (rowId: string, patch: Partial<Omit<SensorInputRow, 'rowId'>>) => {
      setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)))
    },
    [],
  )

  const handleTerminalIdPaste = useCallback(
    (rowId: string, e: React.ClipboardEvent<HTMLInputElement>) => {
      const ids = splitPastedIds(e.clipboardData.getData('text'))
      if (ids.length <= 1) return
      e.preventDefault()
      setRows((prev) => {
        const idx = prev.findIndex((r) => r.rowId === rowId)
        if (idx === -1) return prev
        const [first, ...rest] = ids
        const updated = { ...prev[idx], terminalId: first }
        return [
          ...prev.slice(0, idx),
          updated,
          ...rest.map((id) => newRow(id)),
          ...prev.slice(idx + 1),
        ]
      })
    },
    [],
  )

  return (
    <Modal open={open} title="Registrar sensores" onClose={onClose} size="lg">
      {/* Sensor rows */}
      <div className="mb-2 overflow-y-auto" style={{ maxHeight: '360px' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="w-7 pb-2 pr-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                #
              </th>
              <th className="px-2 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Terminal ID
              </th>
              <th className="px-2 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Nombre
              </th>
              <th className="w-36 px-2 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Tipo
              </th>
              <th className="w-7 pb-2" />
              <th className="w-8 pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const preview = previewRows[i]
              const isValid = preview?.status === 'valid'
              const showStatus = row.terminalId.trim().length > 0

              return (
                <tr key={row.rowId} className="group">
                  <td className="py-1 pr-2 text-xs tabular-nums text-gray-400 dark:text-gray-600">
                    {i + 1}
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className={`${inlineInput} font-mono`}
                      value={row.terminalId}
                      onChange={(e) => updateRow(row.rowId, { terminalId: e.target.value })}
                      onPaste={(e) => handleTerminalIdPaste(row.rowId, e)}
                      placeholder="901820101000096"
                      disabled={busy}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className={inlineInput}
                      value={row.name}
                      onChange={(e) => updateRow(row.rowId, { name: e.target.value })}
                      placeholder={row.terminalId || 'Usar Terminal ID'}
                      disabled={busy}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Select
                      value={row.type}
                      onChange={(v) => updateRow(row.rowId, { type: v as SensorType })}
                      options={SENSOR_TYPES}
                      disabled={busy}
                    />
                  </td>
                  <td className="py-1 pl-1 align-middle">
                    {showStatus &&
                      (isValid ? (
                        <Check className="size-4 text-emerald-500 dark:text-emerald-400" aria-label="Válido" />
                      ) : (
                        <X className="size-4 text-red-500 dark:text-red-400" aria-label="Inválido" />
                      ))}
                  </td>
                  <td className="py-1 pl-1 align-middle">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.rowId)}
                        disabled={busy}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        aria-label="Eliminar fila"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addRow}
        disabled={busy}
        className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 dark:border-slate-600 dark:text-gray-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        <Plus className="size-4" aria-hidden />
        Agregar sensor
      </button>

      {/* Ignore invalid */}
      <label className="mb-3 flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={ignoreInvalid}
          onChange={(e) => setIgnoreInvalid(e.target.checked)}
          disabled={busy}
        />
        <span>Ignorar inválidos y duplicados y registrar solo los válidos</span>
      </label>

      {/* Hint / error */}
      <div className="mb-4 min-h-[1.5rem] text-sm" role="status" aria-live="polite">
        {!submitCheck.ok && (
          <p className="text-amber-800 dark:text-amber-300">{submitCheck.reason}</p>
        )}
        {error && (
          <p className={`text-red-600 dark:text-red-400${!submitCheck.ok ? ' mt-1' : ''}`}>
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-slate-700">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => onSubmit(toSend)}
          disabled={busy || !canClickSubmit}
        >
          {busy ? 'Registrando…' : 'Registrar'}
        </Button>
      </div>
    </Modal>
  )
}
