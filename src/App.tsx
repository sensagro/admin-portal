import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { SensorsPage } from '@/pages/SensorsPage'
import { SensorDetailPage } from '@/pages/SensorDetailPage'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { AdminTablePageSizeProvider } from '@/contexts/AdminTablePageSizeContext'

export default function App() {
  const { me, authReady, signOut } = useAuth()

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

  return (
    <MainLayout onLogout={() => void signOut()}>
      <AdminTablePageSizeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/sensors" element={<SensorsPage />} />
          <Route path="/sensors/:id" element={<SensorDetailPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </AdminTablePageSizeProvider>
    </MainLayout>
  )
}
