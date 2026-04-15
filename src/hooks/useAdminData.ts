import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminTablePageSize, type AdminTableId } from '@/contexts/AdminTablePageSizeContext'
import { ApiError } from '@/lib/api'
import type { PageSize } from '@/constants/pagination'

type ApiFn<TRaw extends { id: string }> = (
  getIdToken: () => Promise<string | null>,
  limit: number,
  cursor?: string,
) => Promise<{ items: TRaw[]; total: number }>

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
  /** Total rows matching the current filters (from the server), not only loaded rows. */
  total: number | null
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
  const [total, setTotal] = useState<number | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    try {
      const { items: raw, total: t } = await apiFn(getIdToken, pageSize, undefined)
      const mapped = raw.map(mapper)
      setData(mapped)
      setTotal(t)
      const loaded = mapped.length
      const more = loaded < t
      setHasMore(more)
      setCursor(more && raw.length > 0 ? raw[raw.length - 1].id : null)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setHasMore(false)
      setCursor(null)
      setTotal(null)
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
      const { items: raw, total: t } = await apiFn(getIdToken, pageSize, cursor)
      const chunk = raw.map(mapper)
      const nextLen = data.length + chunk.length
      setData((prev) => [...prev, ...chunk])
      setTotal(t)
      const more = nextLen < t
      setHasMore(more)
      setCursor(more && raw.length > 0 ? raw[raw.length - 1].id : null)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut()
        return
      }
      setError(e instanceof Error ? e.message : errorMessage)
    } finally {
      setLoadingMore(false)
    }
  }, [
    apiFn,
    mapper,
    getIdToken,
    signOut,
    errorMessage,
    hasMore,
    loadingMore,
    loading,
    cursor,
    pageSize,
    data.length,
  ])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    data,
    loading,
    error,
    reload,
    hasMore,
    loadingMore,
    loadMore,
    pageSize,
    setPageSize,
    total,
  }
}
