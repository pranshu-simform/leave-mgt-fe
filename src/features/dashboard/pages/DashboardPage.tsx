import { WalletCardsIcon } from 'lucide-react'
import { Link } from 'react-router'
import { CardSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { NEW_REQUEST_PATH } from '@/constants/pathRoutes'
import { useMyBalances } from '@/features/balances/hooks/useMyBalances'
import { BalanceCard } from '@/features/dashboard/components/BalanceCard'
import { UpcomingLeave } from '@/features/dashboard/components/UpcomingLeave'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: balances, isLoading, isError, refetch } = useMyBalances()
  const year = balances?.[0]?.year

  return (
    <>
      <PageHeader
        title={user ? `Welcome, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description={year ? `Your leave balances for ${year}` : 'Your leave balances'}
        actions={
          <Button render={<Link to={NEW_REQUEST_PATH} />} nativeButton={false}>
            Request leave
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <section aria-label="Leave balances">
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}
          {isError && <ErrorState message="We could not load your balances." onRetry={refetch} />}
          {balances && balances.length === 0 && (
            <EmptyState
              icon={WalletCardsIcon}
              title="No balances yet"
              description="Your leave allowance for this year has not been set up. Ask HR if this looks wrong."
            />
          )}
          {balances && balances.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {balances.map((balance) => (
                <li key={balance.leaveTypeId}>
                  <BalanceCard balance={balance} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <UpcomingLeave />
      </div>
    </>
  )
}
