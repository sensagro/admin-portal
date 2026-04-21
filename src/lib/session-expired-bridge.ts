type SessionExpiredHandler = () => void

let handler: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(next: SessionExpiredHandler | null) {
  handler = next
}

export function notifySessionExpired() {
  handler?.()
}
