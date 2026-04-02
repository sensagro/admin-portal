import { useState, type ComponentType } from 'react'
import type { PageId } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { UsersPage } from '@/pages/UsersPage'
import { SensorsPage } from '@/pages/SensorsPage'
import { AuditLogPage } from '@/pages/AuditLogPage'

const pages: Record<PageId, ComponentType> = {
  users: UsersPage,
  sensors: SensorsPage,
  audit: AuditLogPage,
}

export default function App() {
  const { me, authReady, signOut } = useAuth()
  const [activePage, setActivePage] = useState<PageId>('users')

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Cargando…
      </div>
    )
  }

  if (!me) {
    return <LoginPage />
  }

  const ActivePage = pages[activePage]

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={() => void signOut()}
    >
      <ActivePage />
    </MainLayout>
  )
}
