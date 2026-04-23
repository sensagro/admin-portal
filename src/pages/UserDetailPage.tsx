import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { fetchAdminUser, patchUserRole } from '@/lib/api/users'
import { useUserSuspendFlow } from '@/hooks/useUsers'
import type { User, UserDetail, UserRole } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ChangeUserRoleModal } from '@/components/users/ChangeUserRoleModal'
import { roleBadge } from '@/components/users/userColumns'
import { statusBadge } from '@/components/sensors/sensorColumns'
import { useFlash } from '@/hooks/useFlash'
import { SuspendUserModal } from '@/components/users/SuspendUserModal'

const ALL_ROLES: UserRole[] = ['FARMER', 'ADMIN', 'SUPPORT']

function firstAlternativeRole(current: UserRole): UserRole {
  return ALL_ROLES.find((r) => r !== current) ?? 'FARMER'
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { me, getIdToken, signOut } = useAuth()
  const canChangeRole = me?.role === 'ADMIN'
  const canSuspendUser = me?.role === 'ADMIN'
  const { banner, showFlash } = useFlash()

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [roleTarget, setRoleTarget] = useState<User | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole>('FARMER')
  const [roleBusy, setRoleBusy] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUser(id, getIdToken)
      setUser(data)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : 'Error al cargar usuario')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [id, getIdToken, signOut])

  const suspendFlow = useUserSuspendFlow({
    getIdToken,
    signOut,
    onSuccess: load,
    showFlash,
  })

  useEffect(() => {
    void load()
  }, [load])

  const openRoleModal = useCallback(() => {
    if (!user) return
    const u: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      suspendedAt: user.suspendedAt ?? null,
    }
    setRoleTarget(u)
    setPendingRole(firstAlternativeRole(user.role))
    setRoleError(null)
  }, [user])

  const closeRoleModal = useCallback(() => {
    setRoleTarget(null)
    setRoleError(null)
  }, [])

  const handleAuthError = useCallback(
    async (e: unknown): Promise<boolean> => {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return true
      }
      return false
    },
    [signOut],
  )

  const saveRole = useCallback(async () => {
    if (!roleTarget || pendingRole === roleTarget.role) return
    setRoleBusy(true)
    setRoleError(null)
    try {
      await patchUserRole(getIdToken, roleTarget.id, pendingRole)
      await load()
      showFlash('success', `Rol actualizado: ${roleTarget.email}`)
      closeRoleModal()
    } catch (e) {
      if (await handleAuthError(e)) return
      setRoleError(e instanceof Error ? e.message : 'No se pudo actualizar el rol')
    } finally {
      setRoleBusy(false)
    }
  }, [roleTarget, pendingRole, getIdToken, load, showFlash, closeRoleModal, handleAuthError])

  const sensorColumns: Column<UserDetail['ownedSensors'][number]>[] = [
    {
      key: 'terminalId',
      header: 'Terminal ID',
      render: (s) => (
        <Link
          to={`/sensors/${s.id}`}
          className="font-mono text-xs text-emerald-800 hover:underline dark:text-emerald-400"
        >
          {s.terminalId}
        </Link>
      ),
    },
    { key: 'name', header: 'Nombre', render: (s) => s.name },
    {
      key: 'status',
      header: 'Estado',
      render: (s) => {
        const badge = statusBadge[s.status]
        return (
          <span className="flex flex-wrap items-center gap-2">
            <Badge label={badge.label} variant={badge.variant} />
            {s.suspendedByUserSuspension ? (
              <span
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                title="Suspendido por baja de usuario"
              >
                Baja usuario
              </span>
            ) : null}
          </span>
        )
      },
    },
  ]

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando usuario…</p>
  }

  if (error || !user) {
    return (
      <div>
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Usuario no encontrado'}</p>
        <Link
          to="/users"
          className="mt-2 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Volver a usuarios
        </Link>
      </div>
    )
  }

  const self = user.id === me?.id
  const badge = roleBadge[user.role]
  const isAdminTarget = user.role === 'ADMIN'
  const assignedForSuspendCount = user.ownedSensors.filter((s) => s.status === 'ASSIGNED').length
  const liftOnReactivateCount = user.suspendedSensorCount ?? 0

  return (
    <>
      <div className="mb-6">
        <Link
          to="/users"
          className="text-sm text-emerald-800 hover:underline dark:text-emerald-400"
        >
          ← Usuarios
        </Link>
      </div>

      {banner && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
              : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <PageHeader title={user.email} />
          {user.suspendedAt ? (
            <div className="mt-2">
              <Badge
                label={`Suspendido · ${new Date(user.suspendedAt).toLocaleDateString('es-CR')}`}
                variant="gray"
              />
            </div>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          {canChangeRole && (
            <span title={self ? 'No puedes cambiar tu propio rol' : undefined}>
              <Button variant="secondary" disabled={self} onClick={openRoleModal}>
                Cambiar rol
              </Button>
            </span>
          )}
          {canSuspendUser && !self && !isAdminTarget ? (
            user.suspendedAt ? (
              <Button
                variant="primary"
                onClick={() =>
                  suspendFlow.openReactivateUser(user.id, user.email, liftOnReactivateCount)
                }
              >
                Reactivar usuario
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() =>
                  suspendFlow.openSuspendUser(user.id, user.email, assignedForSuspendCount)
                }
              >
                Suspender usuario
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Badge label={badge.label} variant={badge.variant} />
        <span className="text-gray-600 dark:text-gray-300">
          Registrado: {new Date(user.createdAt).toLocaleDateString('es-CR')}
        </span>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Sensores asignados</h2>
      <div className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <DataTable columns={sensorColumns} rows={user.ownedSensors} keyExtractor={(s) => s.id} />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Tokens de notificación push</h2>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{user.pushTokens.length} registrado(s)</p>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
          {user.pushTokens.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{t.id.slice(0, 12)}…</span>
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(t.createdAt).toLocaleString('es-CR')}
              </span>
            </li>
          ))}
        </ul>
        {user.pushTokens.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Sin tokens registrados.</p>
        )}
      </div>

      <ChangeUserRoleModal
        user={roleTarget}
        selectedRole={pendingRole}
        onSelectedRoleChange={setPendingRole}
        onClose={closeRoleModal}
        onSave={() => void saveRole()}
        busy={roleBusy}
        error={roleError}
      />

      <SuspendUserModal
        open={suspendFlow.suspendModalOpen}
        kind={suspendFlow.suspendModalKind}
        userEmail={suspendFlow.suspendModalEmail}
        sensorCount={suspendFlow.suspendModalSensorCount}
        loading={suspendFlow.suspendModalBusy}
        error={suspendFlow.suspendModalError}
        onConfirm={() => void suspendFlow.executeSuspendOrReactivate()}
        onCancel={suspendFlow.closeSuspendModal}
      />
    </>
  )
}
