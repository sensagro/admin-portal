const MAX_LEN = 128

export type SensorType = 'WATER_SENSOR' | 'TEST_SENSOR'

export const SENSOR_TYPES: { value: SensorType; label: string; shortLabel: string }[] = [
  { value: 'WATER_SENSOR', label: 'Sensor de agua', shortLabel: 'Agua' },
  { value: 'TEST_SENSOR', label: 'Test', shortLabel: 'Test' },
]

export type RowStatus = 'valid' | 'invalid_len' | 'dup_in_list' | 'exists_in_system'

export type SensorInputRow = {
  rowId: string
  terminalId: string
  name: string
  type: SensorType
}

export type SensorPreviewRow = SensorInputRow & {
  index: number
  status: RowStatus
}

export function analyzeRows(
  rows: SensorInputRow[],
  existingTerminalIds: ReadonlySet<string>,
): SensorPreviewRow[] {
  const seenInList = new Map<string, number>()
  return rows.map((row, i) => {
    const { terminalId } = row
    const index = i + 1

    if (terminalId.length < 1 || terminalId.length > MAX_LEN) {
      return { ...row, index, status: 'invalid_len' as RowStatus }
    }
    if (seenInList.has(terminalId)) {
      return { ...row, index, status: 'dup_in_list' as RowStatus }
    }
    seenInList.set(terminalId, index)
    if (existingTerminalIds.has(terminalId)) {
      return { ...row, index, status: 'exists_in_system' as RowStatus }
    }
    return { ...row, index, status: 'valid' as RowStatus }
  })
}

export function sensorsToRegister(
  rows: SensorPreviewRow[],
): { terminalId: string; name: string; type: SensorType }[] {
  return rows
    .filter((r) => r.status === 'valid')
    .map((r) => ({ terminalId: r.terminalId, name: r.name || r.terminalId, type: r.type }))
}

export function rowStatusLabel(s: RowStatus): string {
  switch (s) {
    case 'valid':
      return 'Válido'
    case 'invalid_len':
      return 'ID inválido'
    case 'dup_in_list':
      return 'Duplicado'
    case 'exists_in_system':
      return 'Ya existe'
    default:
      return s
  }
}

export function canSubmit(
  rows: SensorPreviewRow[],
  ignoreInvalid: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (rows.length === 0) {
    return { ok: false, reason: 'Añadí al menos un sensor.' }
  }
  const toSend = sensorsToRegister(rows)
  if (toSend.length === 0) {
    return { ok: false, reason: 'No hay sensores listos para registrar.' }
  }
  if (ignoreInvalid) {
    return { ok: true }
  }
  const allValid = rows.every((r) => r.status === 'valid')
  if (!allValid) {
    return {
      ok: false,
      reason: 'Revisá las filas con error o activá «Ignorar inválidos y duplicados…».',
    }
  }
  return { ok: true }
}

/** Splits pasted text (newlines/commas/tabs/semicolons) into an array of terminal IDs. */
export function splitPastedIds(text: string): string[] {
  return text
    .split(/[\n\r,\t;]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
}
