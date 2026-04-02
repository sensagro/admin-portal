import type { ReactNode } from 'react'

const backdrop =
  'fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4'
const panel =
  'w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'
      : 'rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50'

  return (
    <div
      className={backdrop}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onMouseDown={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className={panel} onMouseDown={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        <div id="confirm-desc" className="px-5 py-4 text-sm text-gray-600">
          {description}
        </div>
        {error && (
          <div className="px-5 pb-2 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
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
