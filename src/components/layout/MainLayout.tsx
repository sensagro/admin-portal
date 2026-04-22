import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

interface MainLayoutProps {
  onLogout: () => void
  children: ReactNode
}

export function MainLayout({ onLogout, children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-8 text-gray-900 dark:text-gray-100">{children}</main>
    </div>
  )
}
