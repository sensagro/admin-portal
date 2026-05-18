import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import type { UserRole } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { createAdminUser, type CreateUserPayload } from '@/lib/api/users'

const ROLE_OPTIONS = [
  { value: 'FARMER' as UserRole, label: 'Agricultor' },
  { value: 'ADMIN' as UserRole, label: 'Administrador' },
]

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500'

const iconActionBtnClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100'

const iconActionBtnCopiedClass =
  'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50'

const COPY_FEEDBACK_MS = 1500

function randomBase64UrlPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  getIdToken: () => Promise<string | null>
  onAuthError: (e: unknown) => Promise<boolean>
  onCreated: () => Promise<void>
  showFlash: (type: 'success' | 'error', text: string) => void
}

export function CreateUserModal({
  open,
  onClose,
  getIdToken,
  onAuthError,
  onCreated,
  showFlash,
}: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('FARMER')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [summaryEmail, setSummaryEmail] = useState('')
  const [summaryPassword, setSummaryPassword] = useState('')
  const [showSummaryPassword, setShowSummaryPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailCopied, setEmailCopied] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const emailCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const passwordCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCopyFeedbackTimers = useCallback(() => {
    if (emailCopyTimerRef.current) {
      clearTimeout(emailCopyTimerRef.current)
      emailCopyTimerRef.current = null
    }
    if (passwordCopyTimerRef.current) {
      clearTimeout(passwordCopyTimerRef.current)
      passwordCopyTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearCopyFeedbackTimers()
  }, [clearCopyFeedbackTimers])

  useEffect(() => {
    if (!open) {
      clearCopyFeedbackTimers()
      setEmailCopied(false)
      setPasswordCopied(false)
      return
    }
    clearCopyFeedbackTimers()
    setEmailCopied(false)
    setPasswordCopied(false)
    setStep('form')
    setEmail('')
    setName('')
    setRole('FARMER')
    setPassword('')
    setShowPassword(false)
    setSummaryEmail('')
    setSummaryPassword('')
    setShowSummaryPassword(false)
    setBusy(false)
    setError(null)
  }, [open, clearCopyFeedbackTimers])

  const handleClose = useCallback(() => {
    if (busy) return
    onClose()
  }, [busy, onClose])

  const handleGeneratePassword = useCallback(() => {
    setPassword(randomBase64UrlPassword())
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        setError('Ingresa un correo electrónico')
        return
      }
      const trimmedPwd = password.trim()
      if (trimmedPwd.length > 0 && trimmedPwd.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres, o déjala vacía para generar una')
        return
      }

      setBusy(true)
      setError(null)
      try {
        const payload: CreateUserPayload = {
          email: trimmedEmail,
          role,
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(trimmedPwd.length >= 8 ? { password: trimmedPwd } : {}),
        }
        const res = await createAdminUser(getIdToken, payload)
        await onCreated()
        const plainPassword =
          res.generatedPassword ?? (trimmedPwd.length >= 8 ? trimmedPwd : '')
        setSummaryEmail(res.email)
        setSummaryPassword(plainPassword)
        setShowSummaryPassword(false)
        setStep('confirm')
      } catch (err) {
        if (await onAuthError(err)) return
        const msg = err instanceof Error ? err.message : 'No se pudo crear el usuario'
        setError(msg)
      } finally {
        setBusy(false)
      }
    },
    [email, name, role, password, getIdToken, onCreated, onAuthError],
  )

  const copyToClipboard = useCallback(
    async (text: string, kind: 'email' | 'password') => {
      try {
        await navigator.clipboard.writeText(text)
        if (kind === 'email') {
          setEmailCopied(true)
          if (emailCopyTimerRef.current) clearTimeout(emailCopyTimerRef.current)
          emailCopyTimerRef.current = setTimeout(() => {
            setEmailCopied(false)
            emailCopyTimerRef.current = null
          }, COPY_FEEDBACK_MS)
        } else {
          setPasswordCopied(true)
          if (passwordCopyTimerRef.current) clearTimeout(passwordCopyTimerRef.current)
          passwordCopyTimerRef.current = setTimeout(() => {
            setPasswordCopied(false)
            passwordCopyTimerRef.current = null
          }, COPY_FEEDBACK_MS)
        }
      } catch {
        showFlash('error', 'No se pudo copiar; copia manualmente')
      }
    },
    [showFlash],
  )

  const finishConfirm = useCallback(() => {
    showFlash('success', 'Usuario creado. Comparte el correo y la contraseña por un canal seguro.')
    onClose()
  }, [onClose, showFlash])

  if (!open) return null

  if (step === 'confirm' && summaryEmail !== '') {
    return (
      <Modal open title="Usuario creado" onClose={handleClose} size="lg">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Estos datos <strong>no se volverán a mostrar</strong> al cerrar. Cópialos y compártelos con
          el usuario por un canal seguro.
        </p>

        <div className="mb-4 space-y-3">
          <div>
            <label
              htmlFor="confirm-summary-email"
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Correo electrónico
            </label>
            <div className="flex gap-2">
              <input
                id="confirm-summary-email"
                readOnly
                value={summaryEmail}
                className={`${inputClass} min-w-0 flex-1 font-mono text-sm`}
              />
              <button
                type="button"
                className={`${iconActionBtnClass} ${emailCopied ? iconActionBtnCopiedClass : ''}`}
                onClick={() => void copyToClipboard(summaryEmail, 'email')}
                disabled={busy}
                aria-label={emailCopied ? 'Copiado' : 'Copiar correo electrónico'}
              >
                {emailCopied ? (
                  <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />
                ) : (
                  <Copy className="size-4 shrink-0" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-summary-password"
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Contraseña
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  id="confirm-summary-password"
                  readOnly
                  type={showSummaryPassword ? 'text' : 'password'}
                  value={summaryPassword}
                  className={`${inputClass} w-full pr-10 font-mono text-sm`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                  onClick={() => setShowSummaryPassword((v) => !v)}
                  disabled={busy}
                  aria-label={showSummaryPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showSummaryPassword}
                >
                  {showSummaryPassword ? (
                    <EyeOff className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <Eye className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              </div>
              <button
                type="button"
                className={`${iconActionBtnClass} ${passwordCopied ? iconActionBtnCopiedClass : ''}`}
                onClick={() => void copyToClipboard(summaryPassword, 'password')}
                disabled={busy}
                aria-label={passwordCopied ? 'Copiado' : 'Copiar contraseña'}
              >
                {passwordCopied ? (
                  <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />
                ) : (
                  <Copy className="size-4 shrink-0" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="primary" onClick={finishConfirm}>
            Listo
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open title="Crear usuario" onClose={handleClose} size="lg">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Se crea la cuenta en Firebase y el registro en la base de datos. El usuario podrá cambiar
          su contraseña desde la app móvil.
        </p>

        <div>
          <label htmlFor="create-user-email" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Correo electrónico
          </label>
          <input
            id="create-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            disabled={busy}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="create-user-name" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Nombre (opcional)
          </label>
          <input
            id="create-user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            disabled={busy}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="create-user-role" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Rol
          </label>
          <Select
            value={role}
            onChange={(v) => setRole(v as UserRole)}
            options={ROLE_OPTIONS}
            disabled={busy}
          />
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="create-user-password" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Contraseña inicial (opcional)
            </label>
            <Button type="button" variant="secondary" className="!py-1 !text-xs" onClick={handleGeneratePassword} disabled={busy}>
              Generar
            </Button>
          </div>
          <div className="relative">
            <input
              id="create-user-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vacío = el sistema genera una contraseña"
              autoComplete="new-password"
              disabled={busy}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
              onClick={() => setShowPassword((v) => !v)}
              disabled={busy}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4 shrink-0" aria-hidden />
              ) : (
                <Eye className="size-4 shrink-0" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo 8 caracteres si la defines. Si la dejas vacía, se genera una y podrás copiarla al
            finalizar.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
