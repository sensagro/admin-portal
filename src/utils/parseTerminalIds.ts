const MAX_LEN = 128

export function parseTerminalIds(
  raw: string,
): { ok: true; ids: string[] } | { ok: false; error: string } {
  const parts = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return {
      ok: false,
      error:
        'Añade al menos un terminal ID (como en Myriota; 1–128 caracteres).',
    }
  }

  const invalid = parts.filter((id) => id.length < 1 || id.length > MAX_LEN)
  if (invalid.length > 0) {
    const sample = invalid.slice(0, 3).join(', ')
    return {
      ok: false,
      error: `IDs inválidos (longitud 1–${MAX_LEN}): ${sample}${invalid.length > 3 ? '…' : ''}`,
    }
  }

  const unique = [...new Set(parts.map((id) => id.toLowerCase()))]
  return { ok: true, ids: unique }
}
