import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'

function invalidateAll(queryClient: QueryClient, keys: readonly (readonly unknown[])[]) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

// A leave type shows up in the request form, the balance cards, the calendar legend (its colors are
// positional, so one more type shifts the rest) and in every request that embeds its name. Creating
// one also allocates balances. Nothing is updated optimistically.
export function invalidateLeaveTypeQueries(queryClient: QueryClient): Promise<unknown> {
  return invalidateAll(queryClient, [
    QUERY_KEYS.ADMIN.LEAVE_TYPES,
    QUERY_KEYS.LEAVE_TYPES.ALL,
    QUERY_KEYS.BALANCES.ALL,
    QUERY_KEYS.CALENDAR.ALL,
    QUERY_KEYS.LEAVE_REQUESTS.ALL,
    QUERY_KEYS.APPROVALS.ALL,
  ])
}

// A holiday changes the working days of previews and new requests, and the calendar marks it.
export function invalidateHolidayQueries(queryClient: QueryClient): Promise<unknown> {
  return invalidateAll(queryClient, [
    QUERY_KEYS.ADMIN.HOLIDAYS.ALL,
    QUERY_KEYS.HOLIDAYS.ALL,
    QUERY_KEYS.CALENDAR.ALL,
    QUERY_KEYS.LEAVE_REQUESTS.ALL,
    QUERY_KEYS.BALANCES.ALL,
  ])
}

// An allocation or an adjustment changes allowances: the person's balance list, the employee's
// dashboard (BALANCES covers both), the balance impact in an approval review and the "balance
// after" of a live request preview. The reconcile result is stale too.
export function invalidateBalanceQueries(queryClient: QueryClient): Promise<unknown> {
  return invalidateAll(queryClient, [
    QUERY_KEYS.ADMIN.BALANCES.ALL,
    QUERY_KEYS.BALANCES.ALL,
    QUERY_KEYS.APPROVALS.ALL,
    QUERY_KEYS.LEAVE_REQUESTS.ALL,
  ])
}
