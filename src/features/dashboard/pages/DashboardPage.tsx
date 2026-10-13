import { WalletCardsIcon } from 'lucide-react'
import { useMemo } from 'react'
import { CardSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/shared'
import { USER_ROLES } from '@/constants/constant'
import { useMyBalances } from '@/features/balances/hooks/useMyBalances'
import { BalanceCard } from '@/features/dashboard/components/BalanceCard'
import { MonthlyTrendChart } from '@/features/dashboard/components/MonthlyTrendChart'
import { TeamPanel } from '@/features/dashboard/components/TeamPanel'
import { UpcomingLeave } from '@/features/dashboard/components/UpcomingLeave'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useLeaveTypes } from '@/features/leave-types/hooks/useLeaveTypes'
import { useAuth } from '@/hooks/useAuth'
import { typeSlot } from '@/lib/leaveTypeColors'

export default function DashboardPage() {
  const { user } = useAuth()
  const balances = useMyBalances()
  const stats = useDashboardStats()
  const types = useLeaveTypes()
  const typeIds = useMemo(() => types.data?.map((type) => type.id) ?? [], [types.data])

  const year = balances.data?.[0]?.year ?? stats.data?.year
  const isApprover = user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.HR_ADMIN

  return (
    <>
      <PageHeader
        title={user ? `Welcome, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description={year ? `Your leave at a glance for ${year}` : 'Your leave at a glance'}
      />
      <div className="flex flex-col gap-8">
        <section aria-labelledby="balances-heading" className="flex flex-col gap-3">
          <h2 id="balances-heading" className="text-h3">
            Balances
          </h2>
          {balances.isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}
          {balances.isError && (
            <ErrorState message="We could not load your balances." onRetry={balances.refetch} />
          )}
          {balances.data && balances.data.length === 0 && (
            <EmptyState
              icon={WalletCardsIcon}
              title="No balances yet"
              description="Your leave allowance for this year has not been set up. Ask HR if this looks wrong."
            />
          )}
          {balances.data && balances.data.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {balances.data.map((balance) => (
                <li key={balance.leaveTypeId}>
                  <BalanceCard balance={balance} slot={typeSlot(balance.leaveTypeId, typeIds)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {isApprover && stats.isLoading && <CardSkeleton />}
        {isApprover && stats.data?.team && (
          <TeamPanel team={stats.data.team} isHr={user?.role === USER_ROLES.HR_ADMIN} />
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {stats.isLoading && <CardSkeleton />}
            {stats.isError && (
              <ErrorState
                message="We could not load your leave by month."
                onRetry={stats.refetch}
              />
            )}
            {stats.data && (
              <MonthlyTrendChart
                year={stats.data.year}
                monthly={stats.data.monthly}
                typeIds={typeIds}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <UpcomingLeave typeIds={typeIds} />
          </div>
        </div>
      </div>
    </>
  )
}
