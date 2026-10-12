import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import { invalidateBalanceQueries } from '@/features/admin/hooks/invalidateAdminQueries'
import type { AdjustBalancePayload } from '@/features/admin/types/adminTypes'
import { showSuccess } from '@/lib/toast'

export function useAllocateBalances() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (year: number) => adminApi.allocateBalances(year),
    retry: false,
    onSuccess: ({ year, created }) => {
      showSuccess(
        created === 0
          ? `Nothing to create: every balance for ${year} already exists`
          : `Created ${created} ${created === 1 ? 'balance' : 'balances'} for ${year}`,
      )
    },
    onSettled: () => invalidateBalanceQueries(queryClient),
  })
}

export function useAdjustBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdjustBalancePayload) => adminApi.adjustBalance(payload),
    retry: false,
    onSuccess: (balance) => {
      showSuccess(`${balance.name} ${balance.year}: ${balance.remaining} days left`)
    },
    onSettled: () => invalidateBalanceQueries(queryClient),
  })
}
