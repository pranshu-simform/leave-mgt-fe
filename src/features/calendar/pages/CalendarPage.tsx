import { CalendarCheckIcon, UsersRoundIcon } from 'lucide-react'
import { useMemo } from 'react'
import { EmptyState, ErrorState, PageHeader, TableSkeleton } from '@/components/shared'
import { USER_ROLES } from '@/constants/constant'
import { CalendarLegend } from '@/features/calendar/components/CalendarLegend'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import { MonthGrid } from '@/features/calendar/components/MonthGrid'
import { useCalendarMonth } from '@/features/calendar/hooks/useCalendarMonth'
import { useCalendarParams } from '@/features/calendar/hooks/useCalendarParams'
import { useCalendarSummary } from '@/features/calendar/hooks/useCalendarSummary'
import { useCalendarTeams } from '@/features/calendar/hooks/useCalendarTeams'
import { useHolidays } from '@/features/calendar/hooks/useHolidays'
import { useLeaveTypes } from '@/features/leave-types/hooks/useLeaveTypes'
import { useAuth } from '@/hooks/useAuth'
import { isApiError } from '@/lib/apiClient'
import { formatMonth } from '@/lib/dates'

export default function CalendarPage() {
  const { user } = useAuth()
  const { month, team, includePending, setMonth, setTeam, setIncludePending } = useCalendarParams()

  // HR looks at one team at a time. Everyone else gets their own, which the API works out, so no
  // team is ever sent for them (and a `team` in their URL is ignored).
  const isHr = user?.role === USER_ROLES.HR_ADMIN
  const sendsLoad = user?.role !== USER_ROLES.EMPLOYEE
  const managerId = isHr ? team : undefined
  const needsTeam = isHr && !managerId

  const teams = useCalendarTeams(isHr)
  const types = useLeaveTypes()
  const holidays = useHolidays(month)
  const calendar = useCalendarMonth({ month, managerId, includePending, enabled: !needsTeam })
  const summary = useCalendarSummary(month, managerId, sendsLoad && !needsTeam)

  const teamOptions = useMemo(
    () =>
      isHr
        ? (teams.data ?? []).map((item) => ({
            value: item.managerId,
            label: `${item.managerName}'s team (${item.teamSize})`,
          }))
        : undefined,
    [isHr, teams.data],
  )
  const teamName = teams.data?.find((item) => item.managerId === managerId)?.managerName

  const typeCodes = useMemo(() => types.data?.map((type) => type.code) ?? [], [types.data])
  const typesAway = useMemo(() => {
    const seen = new Map<string, { code: string; name: string }>()
    for (const item of calendar.items) seen.set(item.leaveType.code, item.leaveType)
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [calendar.items])

  let body
  if (needsTeam) {
    body = (
      <EmptyState
        icon={UsersRoundIcon}
        title="Choose a team"
        description="Pick a team above to see who is away this month."
      />
    )
  } else if (calendar.isError) {
    body =
      isApiError(calendar.error) && calendar.error.status === 404 ? (
        <EmptyState
          icon={UsersRoundIcon}
          title="You are not part of a team yet"
          description="The calendar shows the people who share your manager. Ask HR if this looks wrong."
        />
      ) : (
        <ErrorState
          message="We could not load the calendar. Check your connection and try again."
          onRetry={() => void calendar.refetch()}
        />
      )
  } else if (calendar.isLoading || types.isLoading) {
    body = <TableSkeleton rows={5} columns={8} />
  } else if (calendar.items.length === 0 && !calendar.isLoadingMore) {
    body = (
      <EmptyState
        icon={CalendarCheckIcon}
        title={`Nobody is away in ${formatMonth(month)}`}
        description={
          includePending
            ? 'Approved and pending leave for this team shows up here.'
            : 'No approved leave this month. Turn on Show pending to include requests that wait for a decision.'
        }
      />
    )
  } else {
    body = (
      <>
        <MonthGrid
          month={month}
          items={calendar.items}
          holidays={holidays.data ?? []}
          typeCodes={typeCodes}
          load={sendsLoad ? summary.data : undefined}
          isBusy={calendar.isLoadingMore}
        />
        {calendar.isTruncated && (
          <p role="status" className="pt-3 text-body-sm text-muted-foreground">
            This month has more leave than the calendar shows. Only the earliest is listed.
          </p>
        )}
        <CalendarLegend types={typesAway} typeCodes={typeCodes} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Team calendar"
        description={
          isHr
            ? teamName
              ? `${teamName}'s team`
              : 'Who is away, one team at a time'
            : 'Who on your team is away'
        }
      />
      <CalendarToolbar
        month={month}
        onMonthChange={setMonth}
        includePending={includePending}
        onIncludePendingChange={setIncludePending}
        teamOptions={teamOptions}
        team={team}
        onTeamChange={isHr ? setTeam : undefined}
      />
      {body}
    </>
  )
}
