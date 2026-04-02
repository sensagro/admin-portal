import { useCallback, useState } from 'react'

export interface FlashBanner {
  type: 'success' | 'error'
  text: string
}

const FLASH_DURATION_MS = 5000

export function useFlash() {
  const [banner, setBanner] = useState<FlashBanner | null>(null)

  const showFlash = useCallback((type: 'success' | 'error', text: string) => {
    setBanner({ type, text })
    window.setTimeout(() => setBanner(null), FLASH_DURATION_MS)
  }, [])

  return { banner, showFlash }
}
