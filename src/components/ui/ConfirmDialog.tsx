import type { ReactNode } from 'react'

const backdrop =
  'fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 dark:bg-black/60'
const panel =
  'w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-900'

export type ReversibilityHint = 'irreversible' | 'reversible' | 'none'

type Props = {
  open: boolean
  title: string
  /** Affected device / user (shown in monospace). */
  entityLabel?: string
  body: ReactNode
  reversibility?: ReversibilityHint
  confirmLabel: string
  cancelLabel?: string
  /** danger = red confirm button, default = emerald. */
  confirmTone?: 'default' | 'danger'
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

const reversibilityCopy: Record<ReversibilityHint, string | null> = {
  irreversible: 'Esta acción no se puede deshacer desde el portal.',
  reversible: 'Podés corregir el resultado después desde el listado, según el caso.',
  none: null,
}

export function ConfirmDialog({
  open,
  title,
  entityLabel,
  body,
  reversibility = 'none',
  confirmLabel,
  cancelLabel = 'Cancelar',
  confirmTone = 'default',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  const confirmClass =
    confirmTone === 'danger'
      ? 'rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600'
      : 'rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500'

  const rev = reversibilityCopy[reversibility]

  return (
    <div
      className={backdrop}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className={panel} onMouseDown={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-700">
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        <div className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
          {entityLabel && (
            <p className="mb-2">
              <span className="text-gray-500 dark:text-gray-400">Entidad: </span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{entityLabel}</span>
            </p>
          )}
          <div className="space-y-2">{body}</div>
          {rev && <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{rev}</p>}
        </div>
        {error && (
          <div className="px-5 pb-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-slate-700">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
