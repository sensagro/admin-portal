import { Button } from '@/components/ui/Button'

type Props = {
  open: boolean
  onSignInAgain: () => void
}

export function SessionExpiredModal({ open, onSignInAgain }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 id="session-expired-title" className="text-lg font-semibold text-gray-900">
          Sesión expirada
        </h2>
        <p id="session-expired-desc" className="mt-3 text-sm text-gray-600">
          Tu sesión expiró. Iniciá sesión nuevamente para continuar.
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => void onSignInAgain()}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
