import type { ReactNode } from 'react'

const rowClassName =
  'grid w-full grid-cols-[minmax(0,1fr)_13rem_6.5rem] items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800/80'

type Props = {
  onClick: () => void
  primary: ReactNode
  secondary?: ReactNode
  tertiary?: ReactNode
  tertiaryClassName?: string
  primaryClassName?: string
}

export function DashboardListRow({
  onClick,
  primary,
  secondary,
  tertiary,
  tertiaryClassName = 'text-gray-500 dark:text-gray-400',
  primaryClassName = 'font-mono text-gray-900 dark:text-gray-100',
}: Props) {
  return (
    <button type="button" onClick={onClick} className={rowClassName}>
      <span className={`min-w-0 truncate ${primaryClassName}`}>{primary}</span>
      <span className="min-w-0 truncate text-xs text-gray-500 dark:text-gray-400">
        {secondary ?? ''}
      </span>
      <span className={`min-w-0 truncate text-right text-xs ${tertiaryClassName}`}>
        {tertiary ?? ''}
      </span>
    </button>
  )
}
