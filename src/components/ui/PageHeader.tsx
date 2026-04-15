interface PageHeaderProps {
  title: string
  count?: number
  total?: number | null
  className?: string
}

export function PageHeader({ title, count, total, className = 'mb-6' }: PageHeaderProps) {
  const suffix =
    count !== undefined && total != null ? (
      <span className="ml-2 text-sm font-normal text-gray-400">
        ({count} de {total})
      </span>
    ) : count !== undefined ? (
      <span className="ml-2 text-sm font-normal text-gray-400">({count})</span>
    ) : null

  return (
    <div className={className}>
      <h1 className="text-xl font-semibold text-gray-900">
        {title}
        {suffix}
      </h1>
    </div>
  )
}
