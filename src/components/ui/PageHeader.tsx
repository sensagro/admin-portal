interface PageHeaderProps {
  title: string
  count?: number
  total?: number | null
  className?: string
}

export function PageHeader({ title, count, total, className = 'mb-6' }: PageHeaderProps) {
  const suffix =
    count !== undefined && total != null ? (
      <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
        ({count} de {total})
      </span>
    ) : count !== undefined ? (
      <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">({count})</span>
    ) : null

  return (
    <div className={className}>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
        {suffix}
      </h1>
    </div>
  )
}
