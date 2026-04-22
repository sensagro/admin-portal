import { PAGE_SIZE_OPTIONS, type PageSize } from '@/constants/pagination'

type PageSizeSelectProps = {
  id: string
  value: number
  onChange: (size: PageSize) => void
  disabled?: boolean
}

export function PageSizeSelect({ id, value, onChange, disabled }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <label htmlFor={id} className="whitespace-nowrap">
        Filas por carga
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) as PageSize)}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200"
      >
        {PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  )
}
