import type { ReactNode } from 'react'
import type { PageId } from '@/types'
import { Sidebar } from '@/components/layout/Sidebar'

interface MainLayoutProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  onLogout: () => void
  children: ReactNode
}

export function MainLayout({
  activePage,
  onNavigate,
  onLogout,
  children,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
