import { PAGE_SIZE_OPTIONS, type PageSize } from '@/constants/pagination'
import { Select } from '@/components/ui/Select'

type PageSizeSelectProps = {
  id: string
  value: number
  onChange: (size: PageSize) => void
  disabled?: boolean
}

const OPTIONS = PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))

export function PageSizeSelect({ id, value, onChange, disabled }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <label htmlFor={id} className="whitespace-nowrap">
        Filas por carga
      </label>
      <Select
        value={String(value)}
        onChange={(v) => onChange(Number(v) as PageSize)}
        options={OPTIONS}
        disabled={disabled}
      />
    </div>
  )
}
