import type { User as FirebaseUser } from 'firebase/auth'
import { fetchMe } from '@/lib/api'

export class AdminSessionError extends Error {
  readonly code: 'CLAIM' | 'DATABASE' | 'ME_FETCH'

  constructor(message: string, code: 'CLAIM' | 'DATABASE' | 'ME_FETCH') {
    super(message)
    this.name = 'AdminSessionError'
    this.code = code
  }
}

/**
 * Requires Firebase custom claim `role === "ADMIN"` (after token refresh) and DB role ADMIN via GET /users/me.
 * Matches backend RolesGuard (DB) and promote-admin / setCustomUserClaims (Firebase).
 */
export async function validateAdminSession(user: FirebaseUser) {
  await user.getIdToken(true)
  const { claims } = await user.getIdTokenResult()
  const claimRole = claims['role']

  if (claimRole !== 'ADMIN') {
    throw new AdminSessionError(
      claimRole === undefined
        ? 'Tu cuenta no tiene el rol de administrador en Firebase. Pide que sincronicen los custom claims o vuelve a iniciar sesión más tarde.'
        : 'Tu token de Firebase no tiene rol ADMIN. Si acaban de cambiarte el rol, cierra sesión y entra de nuevo.',
      'CLAIM',
    )
  }

  const idToken = await user.getIdToken()
  let me
  try {
    me = await fetchMe(idToken)
  } catch {
    throw new AdminSessionError('No se pudo verificar tu usuario en el servidor.', 'ME_FETCH')
  }

  if (me.role !== 'ADMIN') {
    throw new AdminSessionError(
      'Solo administradores pueden usar este portal (tu rol en la base de datos no es ADMIN).',
      'DATABASE',
    )
  }

  return me
}
