import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50',
  secondary:
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50',
  danger:
    'rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50',
}

interface ButtonProps {
  variant?: ButtonVariant
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

export function Button({ variant = 'secondary', disabled, onClick, children, className }: ButtonProps) {
  const classes = className ? `${variantClasses[variant]} ${className}` : variantClasses[variant]
  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
