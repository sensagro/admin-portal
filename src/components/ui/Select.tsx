import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

interface SelectProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  disabled?: boolean
  placeholder?: string
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
      zIndex: 9999,
    })
    const idx = options.findIndex((o) => o.value === value)
    setFocusedIdx(idx >= 0 ? idx : 0)
    setOpen(true)
  }, [options, value])

  // Scroll focused option into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const item = listRef.current.children[focusedIdx] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [focusedIdx, open])

  // Close on outside click (capture phase to bypass Modal's stopPropagation)
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle, true)
    return () => document.removeEventListener('mousedown', handle, true)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) {
          if (focusedIdx >= 0) onChange(options[focusedIdx].value)
          setOpen(false)
        } else {
          openDropdown()
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { openDropdown(); break }
        setFocusedIdx((i) => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIdx((i) => Math.max(i - 1, 0))
        break
      case 'Escape':
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 transition-colors hover:border-gray-300 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:hover:border-slate-500 dark:focus:border-emerald-500"
      >
        <span className={selected ? '' : 'text-gray-400 dark:text-gray-500'}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          style={dropdownStyle}
          className="overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          onMouseLeave={() => {
            const idx = options.findIndex((o) => o.value === value)
            setFocusedIdx(idx >= 0 ? idx : 0)
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value
            const isFocused = idx === focusedIdx
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(opt.value)
                  setOpen(false)
                }}
                onMouseEnter={() => setFocusedIdx(idx)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs select-none ${
                  isFocused
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
                    : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                <span className="w-3.5 shrink-0">
                  {isSelected && (
                    <Check
                      className="size-3.5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                  )}
                </span>
                {opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
