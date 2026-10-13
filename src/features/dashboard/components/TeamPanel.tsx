import { InboxIcon, PlaneIcon, UsersIcon } from 'lucide-react'
import { StatCard } from '@/components/shared'
import { PATH_ROUTES } from '@/constants/pathRoutes'
import { useApprovals } from '@/features/approvals/hooks/useApprovals'
import { TeamLoadChart } from '@/features/dashboard/components/TeamLoadChart'
import type { TeamStats } from '@/features/dashboard/types/dashboardTypes'

// Only the count is needed: one row is enough to read the total.
const QUEUE_COUNT = { page: 1, limit: 1, status: 'PENDING' } as const

interface TeamPanelProps {
  team: TeamStats
  isHr: boolean
}

export function TeamPanel({ team, isHr }: Readonly<TeamPanelProps>) {
  const queue = useApprovals(QUEUE_COUNT)
  const waiting = queue.data?.pagination.total ?? 0
  const scopeLabel = isHr ? 'the company' : 'your team'

  return (
    <section aria-labelledby="team-heading" className="flex flex-col gap-3">
      <h2 id="team-heading" className="text-h3">
        {isHr ? 'Company' : 'Your team'}
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1">
          <StatCard
            icon={InboxIcon}
            label="Waiting for you"
            value={queue.isError ? '–' : waiting}
            hint={waiting === 1 ? 'request to decide' : 'requests to decide'}
            tone={waiting > 0 ? 'warning' : undefined}
            to={PATH_ROUTES.APPROVALS.PATH}
            isLoading={queue.isLoading}
            className="col-span-2 sm:col-span-1"
          />
          <StatCard
            icon={PlaneIcon}
            label="Away today"
            value={team.awayToday}
            hint={`of ${team.teamSize} ${team.teamSize === 1 ? 'person' : 'people'}`}
          />
          <StatCard
            icon={UsersIcon}
            label={isHr ? 'Active people' : 'Team size'}
            value={team.teamSize}
            hint={isHr ? 'everyone but you' : 'your direct reports'}
          />
        </div>
        <TeamLoadChart days={team.days} scopeLabel={scopeLabel} className="lg:col-span-2" />
      </div>
    </section>
  )
}
