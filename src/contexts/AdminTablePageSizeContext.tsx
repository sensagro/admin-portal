import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, type PageSize } from '@/constants/pagination'

const STORAGE_KEY = 'algrot:admin:tablePageSizes'

export type AdminTableId = 'users' | 'sensors' | 'audit'

type Store = Record<AdminTableId, PageSize>

function isPageSize(n: number): n is PageSize {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n)
}

function loadFromStorage(): Partial<Store> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Partial<Store> = {}
    for (const key of ['users', 'sensors', 'audit'] as const) {
      const v = (parsed as Record<string, unknown>)[key]
      if (typeof v === 'number' && isPageSize(v)) out[key] = v
    }
    return out
  } catch {
    return {}
  }
}

function saveToStorage(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
  }
}

const defaultStore = (): Store => ({
  users: DEFAULT_PAGE_SIZE,
  sensors: DEFAULT_PAGE_SIZE,
  audit: DEFAULT_PAGE_SIZE,
})

type AdminTablePageSizeContextValue = {
  store: Store
  setPageSize: (id: AdminTableId, size: PageSize) => void
}

const AdminTablePageSizeContext = createContext<AdminTablePageSizeContextValue | null>(null)

export function AdminTablePageSizeProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => ({
    ...defaultStore(),
    ...loadFromStorage(),
  }))

  const setPageSize = useCallback((id: AdminTableId, size: PageSize) => {
    setStore((prev) => {
      const next = { ...prev, [id]: size }
      saveToStorage(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ store, setPageSize }), [store, setPageSize])

  return (
    <AdminTablePageSizeContext.Provider value={value}>{children}</AdminTablePageSizeContext.Provider>
  )
}

export function useAdminTablePageSize(id: AdminTableId): {
  pageSize: PageSize
  setPageSize: (size: PageSize) => void
} {
  const ctx = useContext(AdminTablePageSizeContext)
  if (!ctx) {
    throw new Error('useAdminTablePageSize must be used within AdminTablePageSizeProvider')
  }
  const { store, setPageSize: setInStore } = ctx
  const setPageSize = useCallback((size: PageSize) => setInStore(id, size), [id, setInStore])
  return { pageSize: store[id], setPageSize }
}
