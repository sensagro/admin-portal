import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { validateAdminSession } from '@/lib/admin-session'
import type { MeUser } from '@/lib/api'

interface AuthContextValue {
  me: MeUser | null
  authReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (user) => {
      try {
        if (!user) {
          setMe(null)
          return
        }
        const validated = await validateAdminSession(user)
        setMe(validated)
      } catch {
        if (firebaseAuth.currentUser) {
          await firebaseSignOut(firebaseAuth)
        }
        setMe(null)
      } finally {
        setAuthReady(true)
      }
    })
  }, [])

  const getIdToken = useCallback(async () => {
    const u = firebaseAuth.currentUser
    if (!u) return null
    return u.getIdToken()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password)
    try {
      const validated = await validateAdminSession(cred.user)
      setMe(validated)
    } catch (e) {
      await firebaseSignOut(firebaseAuth)
      setMe(null)
      throw e
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(firebaseAuth)
    setMe(null)
  }, [])

  const value = useMemo(
    () => ({
      me,
      authReady,
      signIn,
      signOut,
      getIdToken,
    }),
    [me, authReady, signIn, signOut, getIdToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
