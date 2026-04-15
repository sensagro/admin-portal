import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminTablePageSize, type AdminTableId } from '@/contexts/AdminTablePageSizeContext'
import { ApiError } from '@/lib/api'
import type { PageSize } from '@/constants/pagination'

type ApiFn<TRaw extends { id: string }> = (
  getIdToken: () => Promise<string | null>,
  limit: number,
  cursor?: string,
) => Promise<TRaw[]>

interface UseAdminDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => Promise<void>
  pageSize: PageSize
  setPageSize: (size: PageSize) => void
}

export function useAdminData<TRaw extends { id: string }, T = TRaw>(
  apiFn: ApiFn<TRaw>,
  mapper: (raw: TRaw) => T,
  errorMessage: string,
  tableId: AdminTableId,
): UseAdminDataResult<T> {
  const { getIdToken, signOut } = useAuth()
  const { pageSize, setPageSize } = useAdminTablePageSize(tableId)
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    try {
      const raw = await apiFn(getIdToken, pageSize, undefined)
      setData(raw.map(mapper))
      if (raw.length === pageSize) {
        setHasMore(true)
        setCursor(raw[raw.length - 1].id)
      } else {
        setHasMore(false)
        setCursor(null)
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setHasMore(false)
      setCursor(null)
      setError(e instanceof Error ? e.message : errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiFn, mapper, getIdToken, signOut, errorMessage, pageSize])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return
    if (cursor == null) return
    setLoadingMore(true)
    setError(null)
    try {
      const raw = await apiFn(getIdToken, pageSize, cursor)
      setData((prev) => [...prev, ...raw.map(mapper)])
      if (raw.length === pageSize) {
        setHasMore(true)
        setCursor(raw[raw.length - 1].id)
      } else {
        setHasMore(false)
        setCursor(null)
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : errorMessage)
    } finally {
      setLoadingMore(false)
    }
  }, [apiFn, mapper, getIdToken, signOut, errorMessage, hasMore, loadingMore, loading, cursor, pageSize])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload, hasMore, loadingMore, loadMore, pageSize, setPageSize }
}
