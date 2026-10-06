import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { approvalApi, type ApprovalListParams } from '@/features/approvals/api/approvalApi'

export function useApprovals(params: ApprovalListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS.LIST(params),
    queryFn: () => approvalApi.list(params),
    // Keeps the rows on screen while the next page or tab loads.
    placeholderData: keepPreviousData,
  })
}
