const TERMINAL_ID_HEX = /^[0-9a-f]{10}$/i

export function parseTerminalIds(
  raw: string,
): { ok: true; ids: string[] } | { ok: false; error: string } {
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
