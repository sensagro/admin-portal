export function ErrorFallback({ resetError }: { error: unknown; resetError: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center dark:bg-slate-950">
      <p className="text-base text-gray-700 dark:text-gray-300">
        Algo salió mal — recargá la página
      </p>
      <button
        onClick={resetError}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Recargar
      </button>
    </div>
  )
}
