import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'

type ApiFn<TRaw> = (getIdToken: () => Promise<string | null>) => Promise<TRaw[]>

interface UseAdminDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useAdminData<TRaw, T = TRaw>(
  apiFn: ApiFn<TRaw>,
  mapper: (raw: TRaw) => T,
  errorMessage: string,
): UseAdminDataResult<T> {
  const { getIdToken, signOut } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await apiFn(getIdToken)
      setData(raw.map(mapper))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiFn, mapper, getIdToken, signOut, errorMessage])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload }
}
