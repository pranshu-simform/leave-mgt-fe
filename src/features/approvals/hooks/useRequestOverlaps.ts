import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { approvalApi } from '@/features/approvals/api/approvalApi'

// Who else on the employee's team is off during the request. Only for requests the user may decide
// on: the API answers 404 for their own.
export function useRequestOverlaps(id: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS.OVERLAPS(id),
    queryFn: () => approvalApi.overlaps(id),
    enabled: enabled && !!id,
  })
}
