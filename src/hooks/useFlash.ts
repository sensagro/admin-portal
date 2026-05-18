import { useCallback, useEffect, useRef, useState } from 'react'

export interface FlashBanner {
  type: 'success' | 'error'
  text: string
}

const FLASH_DURATION_MS = 5000

export function useFlash() {
  const [banner, setBanner] = useState<FlashBanner | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const dismissFlash = useCallback(() => {
    clearTimer()
    setBanner(null)
  }, [clearTimer])

  const showFlash = useCallback(
    (type: 'success' | 'error', text: string) => {
      clearTimer()
      setBanner({ type, text })
      timerRef.current = setTimeout(() => {
        setBanner(null)
        timerRef.current = null
      }, FLASH_DURATION_MS)
    },
    [clearTimer],
  )

  useEffect(() => () => clearTimer(), [clearTimer])

  return { banner, showFlash, dismissFlash }
}
