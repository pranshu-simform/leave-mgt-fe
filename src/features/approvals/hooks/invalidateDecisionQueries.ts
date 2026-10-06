import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'

// A decision changes the queue, the request and its history, the overlaps (a pending request counts
// differently from an approved one) and the employee's balance. Nothing is updated optimistically.
export function invalidateDecisionQueries(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS.ALL }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVE_REQUESTS.ALL }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BALANCES.ALL }),
  ])
}
