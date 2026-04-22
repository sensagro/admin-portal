const MAX_LEN = 128

export type RowStatus = 'valid' | 'invalid_len' | 'dup_in_list' | 'exists_in_system'

export type TerminalPreviewRow = {
  index: number
  terminalId: string
  status: RowStatus
}

/**
 * Splits and analyses pasted terminal IDs for the bulk register preview.
 * Order is preserved. Duplicate-in-list: first index wins, later are dup_in_list.
 */
export function analyzeTerminalInput(
  raw: string,
  existingTerminalIds: ReadonlySet<string>,
): TerminalPreviewRow[] {
  const parts = raw
    .split(/[\n\r,\t;]+/g)
    .map((s) => s.trim())
    .filter(Boolean)

  const seenInPaste = new Map<string, number>()
  const rows: TerminalPreviewRow[] = []
  for (let i = 0; i < parts.length; i++) {
    const terminalId = parts[i]
    const index = i + 1
    if (terminalId.length < 1 || terminalId.length > MAX_LEN) {
      rows.push({ index, terminalId, status: 'invalid_len' })
      continue
    }
    if (seenInPaste.has(terminalId)) {
      rows.push({ index, terminalId, status: 'dup_in_list' })
      continue
    }
    seenInPaste.set(terminalId, index)
    if (existingTerminalIds.has(terminalId)) {
      rows.push({ index, terminalId, status: 'exists_in_system' })
      continue
    }
    rows.push({ index, terminalId, status: 'valid' })
  }
  return rows
}

/** IDs that can be sent to the API (valid, uniques, not already in system). */
export function terminalIdsToRegister(rows: TerminalPreviewRow[]): string[] {
  return rows.filter((r) => r.status === 'valid').map((r) => r.terminalId)
}

export function rowStatusLabel(s: RowStatus): string {
  switch (s) {
    case 'valid':
      return 'Válido'
    case 'invalid_len':
      return 'Formato inválido'
    case 'dup_in_list':
      return 'Duplicado en lista'
    case 'exists_in_system':
      return 'Ya existe'
    default:
      return s
  }
}

export function canSubmit(
  rows: TerminalPreviewRow[],
  ignoreInvalid: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (rows.length === 0) {
    return { ok: false, reason: 'Añade al menos un terminal ID.' }
  }
  const toSend = terminalIdsToRegister(rows)
  if (toSend.length === 0) {
    return { ok: false, reason: 'No hay terminal IDs listos para registrar.' }
  }
  if (ignoreInvalid) {
    return { ok: true }
  }
  const allValid = rows.every((r) => r.status === 'valid')
  if (!allValid) {
    return {
      ok: false,
      reason: 'Revisa las filas con error o activá «Ignorar inválidos y duplicados…».',
    }
  }
  return { ok: true }
}
