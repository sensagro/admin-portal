interface BadgeProps {
  label: string
  variant: 'green' | 'gray' | 'yellow' | 'red' | 'blue'
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  green: 'bg-emerald-100 text-emerald-800',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
}

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
