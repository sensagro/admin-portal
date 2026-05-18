import { X } from 'lucide-react'
import type { FlashBanner } from '@/hooks/useFlash'

interface FlashOverlayProps {
  banner: FlashBanner | null
  onDismiss: () => void
}

export function FlashOverlay({ banner, onDismiss }: FlashOverlayProps) {
  if (!banner) return null

  const tone =
    banner.type === 'success'
      ? 'border-emerald-200/80 bg-emerald-50/95 text-emerald-900 shadow-emerald-900/10 dark:border-emerald-800/80 dark:bg-emerald-950/90 dark:text-emerald-100'
      : 'border-red-200/80 bg-red-50/95 text-red-900 shadow-red-900/10 dark:border-red-900/50 dark:bg-red-950/90 dark:text-red-100'

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:pt-5"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${tone}`}
      >
        <p className="min-w-0 flex-1 leading-snug">{banner.text}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-current opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Cerrar aviso"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
