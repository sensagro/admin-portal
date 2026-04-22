import { ClipboardList, LogOut, Monitor, Moon, Radio, Sun, Users, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

interface SidebarProps {
  onLogout: () => void
}

const navItems: { path: string; label: string; Icon: LucideIcon }[] = [
  { path: '/users', label: 'Usuarios', Icon: Users },
  { path: '/sensors', label: 'Sensores', Icon: Radio },
  { path: '/audit', label: 'Auditoría', Icon: ClipboardList },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100'
  }`

function ThemeIcon({ mode }: { mode: 'light' | 'dark' | 'system' }) {
  if (mode === 'light') return <Sun className="size-4 shrink-0 opacity-80" aria-hidden />
  if (mode === 'dark') return <Moon className="size-4 shrink-0 opacity-80" aria-hidden />
  return <Monitor className="size-4 shrink-0 opacity-80" aria-hidden />
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { me } = useAuth()
  const { mode, cycleMode, modeLabel } = useTheme()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white dark:bg-emerald-600">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sensagro</div>
          <div
            className="truncate text-xs text-gray-500 dark:text-gray-400"
            title={me?.email ?? undefined}
          >
            {me?.email ?? '—'}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink key={path} to={path} className={navLinkClass}>
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-slate-700">
        <button
          type="button"
          onClick={cycleMode}
          title={modeLabel}
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100"
        >
          <ThemeIcon mode={mode} />
          <span className="truncate text-left">{modeLabel}</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100"
        >
          <LogOut className="size-4 shrink-0 opacity-80" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
