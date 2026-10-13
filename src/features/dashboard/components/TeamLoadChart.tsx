import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartCard } from '@/features/dashboard/components/ChartCard'
import { useReducedMotion } from '@/features/dashboard/hooks/useReducedMotion'
import type { TeamDay } from '@/features/dashboard/types/dashboardTypes'
import { plural, toTeamDayRows } from '@/features/dashboard/utils/dashboardCharts'
import { formatWeekdayDate } from '@/lib/dates'

// Approved is the brand color and pending the warning color, the pair the validator passes for color
// vision deficiency in both themes. The legend names both, so the colors are never the only cue.
const CHART_CONFIG = {
  approved: { label: 'Approved', color: 'var(--primary)' },
  pending: { label: 'Pending', color: 'var(--warning)' },
} satisfies ChartConfig

interface TeamLoadChartProps {
  days: readonly TeamDay[]
  scopeLabel: string
  className?: string
}

export function TeamLoadChart({ days, scopeLabel, className }: Readonly<TeamLoadChartProps>) {
  const reducedMotion = useReducedMotion()
  const rows = toTeamDayRows(days)
  const peak = rows.reduce((top, row) => Math.max(top, row.approved + row.pending), 0)
  const summary =
    peak === 0
      ? `Nobody in ${scopeLabel} is away in the next ${rows.length} working days.`
      : `People in ${scopeLabel} away in the next ${rows.length} working days: at most ${plural(peak, 'person', 'people')} on one day.`

  return (
    <ChartCard
      title="Who is away"
      description={`People in ${scopeLabel} off over the next ${rows.length} working days`}
      className={className}
    >
      <div role="img" aria-label={summary} className="flex min-h-56 flex-1 flex-col">
        <ChartContainer config={CHART_CONFIG} className="aspect-auto min-h-56 w-full flex-1">
          <BarChart
            accessibilityLayer={false}
            data={rows}
            margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, (max: number) => Math.max(max, 1)]}
            />
            <ChartTooltip
              cursor={{ fillOpacity: 0.5 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date
                    return typeof date === 'string' ? formatWeekdayDate(date) : null
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="approved"
              stackId="away"
              fill="var(--color-approved)"
              // Both ends are rounded: on most days nothing is pending, so approved is the top.
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={!reducedMotion}
            />
            <Bar
              dataKey="pending"
              stackId="away"
              fill="var(--color-pending)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={!reducedMotion}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </ChartCard>
  )
}
