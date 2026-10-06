import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { currentMonthLocal, isValidMonth } from '@/lib/dates'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The month, the team (HR only) and the pending toggle live in the URL, so a view can be shared and
// survives a reload. A value that does not parse falls back to its default.
export function useCalendarParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawMonth = searchParams.get('month')
  const month = rawMonth && isValidMonth(rawMonth) ? rawMonth : currentMonthLocal()
  const rawTeam = searchParams.get('team')
  const team = rawTeam && UUID.test(rawTeam) ? rawTeam : undefined
  const includePending = searchParams.get('pending') !== '0'

  const update = useCallback(
    (change: (next: URLSearchParams) => void) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          change(next)
          return next
        },
        { replace: true },
      ),
    [setSearchParams],
  )

  const setMonth = useCallback(
    (value: string) =>
      update((next) => {
        if (value === currentMonthLocal()) next.delete('month')
        else next.set('month', value)
      }),
    [update],
  )
  const setTeam = useCallback(
    (value: string) =>
      update((next) => {
        if (value) next.set('team', value)
        else next.delete('team')
      }),
    [update],
  )
  const setIncludePending = useCallback(
    (value: boolean) =>
      update((next) => {
        if (value) next.delete('pending')
        else next.set('pending', '0')
      }),
    [update],
  )

  return { month, team, includePending, setMonth, setTeam, setIncludePending }
}
