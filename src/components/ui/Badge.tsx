interface BadgeProps {
  label: string
  variant: 'green' | 'gray' | 'yellow' | 'red' | 'blue'
  title?: string
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  green:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  gray: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300',
  yellow:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
}

export function Badge({ label, variant, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
