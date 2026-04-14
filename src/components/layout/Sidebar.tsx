import { ClipboardList, LogOut, Radio, Users, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

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
      ? 'bg-emerald-50 font-medium text-emerald-800'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`

export function Sidebar({ onLogout }: SidebarProps) {
  const { me } = useAuth()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">Sensagro</div>
          <div
            className="truncate text-xs text-gray-500"
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

      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="size-4 shrink-0 opacity-80" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
