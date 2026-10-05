import { SESSION_REFRESH } from '@/constants/constant'

let inflight: Promise<void> | null = null

function refreshedRecentlyByAnotherTab(): boolean {
  try {
    const last = Number(localStorage.getItem(SESSION_REFRESH.LAST_REFRESH_KEY))
    return Number.isFinite(last) && Date.now() - last < SESSION_REFRESH.RECENT_WINDOW_MS
  } catch {
    return false
  }
}

function markRefreshed(): void {
  try {
    localStorage.setItem(SESSION_REFRESH.LAST_REFRESH_KEY, String(Date.now()))
  } catch {
    // Storage can be blocked. Tabs then only coordinate through the lock.
  }
}

async function refreshOnce(refresh: () => Promise<void>): Promise<void> {
  // The refresh token rotates on every use, and replaying an old one revokes the whole session.
  // So two refreshes must never overlap, in this tab or in another one.
  const run = async () => {
    if (refreshedRecentlyByAnotherTab()) return
    await refresh()
    markRefreshed()
  }
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    await navigator.locks.request(SESSION_REFRESH.LOCK_NAME, run)
    return
  }
  await run()
}

// Single flight: every caller that arrives while a refresh is running shares its result.
export function refreshSession(refresh: () => Promise<void>): Promise<void> {
  inflight ??= refreshOnce(refresh).finally(() => {
    inflight = null
  })
  return inflight
}
