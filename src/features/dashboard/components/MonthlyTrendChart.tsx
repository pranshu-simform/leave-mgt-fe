import { CalendarRangeIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/shared'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartCard } from '@/features/dashboard/components/ChartCard'
import { useReducedMotion } from '@/features/dashboard/hooks/useReducedMotion'
import { useIsMobile } from '@/hooks/use-mobile'
import type { MonthlyDays } from '@/features/dashboard/types/dashboardTypes'
import { type MonthRow, plural, toMonthRows } from '@/features/dashboard/utils/dashboardCharts'
import { formatMonth } from '@/lib/dates'
import { swatchClass, typeSlot } from '@/lib/leaveTypeColors'
import { cn } from '@/lib/utils'

// One series, so one color and no legend: the title says what the bars are. The split by leave type is
// in the tooltip, named in text, so the type colors never have to be told apart.
const CHART_CONFIG = {
  days: { label: 'Working days', color: 'var(--primary)' },
} satisfies ChartConfig

interface MonthlyTrendChartProps {
  year: number
  monthly: readonly MonthlyDays[]
  typeIds: readonly string[]
}

export function MonthlyTrendChart({ year, monthly, typeIds }: Readonly<MonthlyTrendChartProps>) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const rows = toMonthRows(year, monthly)
  const total = rows.reduce((sum, row) => sum + row.days, 0)
  const withLeave = rows.filter((row) => row.days > 0)
  const busiest = withLeave.reduce<MonthRow | undefined>(
    (top, row) => (!top || row.days > top.days ? row : top),
    undefined,
  )

  return (
    <ChartCard title="Leave by month" description={`Approved working days off in ${year}`}>
      {!busiest ? (
        <EmptyState
          icon={CalendarRangeIcon}
          title="No approved leave yet this year"
          description="Approved leave shows up here, counted in working days per month."
          className="py-8"
        />
      ) : (
        <div
          role="img"
          aria-label={`Approved working days off per month in ${year}: ${plural(total, 'day', 'days')} in total, the most in ${formatMonth(busiest.month)} with ${plural(busiest.days, 'day', 'days')}.`}
        >
          <ChartContainer config={CHART_CONFIG} className="aspect-auto h-56 w-full">
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
                // Every month on a wide card; every other month on a phone, so the gaps stay even.
                interval={isMobile ? 1 : 0}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
              <ChartTooltip
                cursor={{ fillOpacity: 0.5 }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <MonthTooltip row={payload[0].payload as MonthRow} typeIds={typeIds} />
                  ) : null
                }
              />
              <Bar
                dataKey="days"
                fill="var(--color-days)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                isAnimationActive={!reducedMotion}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </ChartCard>
  )
}

function MonthTooltip({ row, typeIds }: Readonly<{ row: MonthRow; typeIds: readonly string[] }>) {
  return (
    <div
      data-slot="chart-tooltip"
      className="grid min-w-40 gap-1.5 rounded-lg bg-popover px-3 py-2 text-body-sm text-popover-foreground"
    >
      <div className="flex items-baseline justify-between gap-4 font-medium">
        <span>{formatMonth(row.month)}</span>
        <span className="tabular-nums">{plural(row.days, 'day', 'days')}</span>
      </div>
      {row.byType.map((type) => (
        <div key={type.leaveTypeId} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                'size-2 rounded-full',
                swatchClass(typeSlot(type.leaveTypeId, typeIds)),
              )}
            />
            {type.name}
          </span>
          <span className="tabular-nums">{type.days}</span>
        </div>
      ))}
    </div>
  )
}
