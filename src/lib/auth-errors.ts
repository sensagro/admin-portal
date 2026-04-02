import { AdminSessionError } from '@/lib/admin-session'

export function formatAuthError(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code?: string }).code
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Email o contraseña incorrectos'
    }
    if (code === 'auth/user-not-found') {
      return 'No existe una cuenta con ese email'
    }
    if (code === 'auth/too-many-requests') {
      return 'Demasiados intentos. Espera un momento e intenta de nuevo'
    }
  }
  if (e instanceof AdminSessionError) {
    return e.message
  }
  if (e instanceof Error) {
    return e.message
  }
  return 'No se pudo iniciar sesión'
}
