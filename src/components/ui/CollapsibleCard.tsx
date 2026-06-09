import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  count?: number
  titleHref?: string
  onTitleClick?: () => void
  viewAllHref?: string
  onViewAll?: () => void
  defaultCollapsed?: boolean
  loading?: boolean
  error?: string | null
  children: ReactNode
}

export function CollapsibleCard({
  title,
  count,
  titleHref,
  onTitleClick,
  viewAllHref,
  onViewAll,
  defaultCollapsed = false,
  loading = false,
  error = null,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  if (loading) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </div>
    )
  }

  const titleContent = (
    <>
      {title}
      {count !== undefined && (
        <>
          {' '}
          <span className="font-normal text-gray-500 dark:text-gray-400">({count})</span>
        </>
      )}
    </>
  )

  const titleClass = 'text-sm font-semibold text-gray-900 dark:text-gray-100'
  const titleInteractiveClass = `${titleClass} text-left hover:text-blue-700 dark:hover:text-blue-300`

  const titleEl = titleHref ? (
    <Link to={titleHref} className={titleInteractiveClass}>
      {titleContent}
    </Link>
  ) : onTitleClick ? (
    <button type="button" onClick={onTitleClick} className={titleInteractiveClass}>
      {titleContent}
    </button>
  ) : (
    <h2 className={titleClass}>{titleContent}</h2>
  )

  const showViewAll = !collapsed && (viewAllHref || onViewAll)
  const viewAllClass =
    'text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {titleEl}
        <div className="flex items-center gap-3">
          {showViewAll &&
            (viewAllHref ? (
              <Link to={viewAllHref} className={viewAllClass}>
                Ver todos
              </Link>
            ) : (
              <button type="button" onClick={onViewAll} className={viewAllClass}>
                Ver todos
              </button>
            ))}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>
      </div>

      {!collapsed && <div className="mt-3">{children}</div>}
    </div>
  )
}
