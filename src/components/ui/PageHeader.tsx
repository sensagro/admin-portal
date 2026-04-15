interface PageHeaderProps {
  title: string
  count?: number
  className?: string
}

export function PageHeader({ title, count, className = 'mb-6' }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-xl font-semibold text-gray-900">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm font-normal text-gray-400">({count})</span>
        )}
      </h1>
    </div>
  )
}
