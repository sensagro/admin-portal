interface PageHeaderProps {
  title: string
  count?: number
}

export function PageHeader({ title, count }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-gray-900">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm font-normal text-gray-400">({count})</span>
        )}
      </h1>
    </div>
  )
}
