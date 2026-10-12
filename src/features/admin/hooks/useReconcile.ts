import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'

// The check recomputes a whole year from the ledger, so it runs only when HR asks (`refetch`), never
// on its own. Nothing is kept once the dialog is gone: an old "all clear" must not come back.
export function useReconcile(year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.BALANCES.RECONCILE(year),
    queryFn: () => adminApi.reconcile(year),
    enabled: false,
    retry: false,
    gcTime: 0,
  })
}
