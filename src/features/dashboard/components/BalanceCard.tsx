import { Cell, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { Balance } from '@/features/balances/types/balanceTypes'
import { useReducedMotion } from '@/features/dashboard/hooks/useReducedMotion'
import { swatchClass } from '@/lib/leaveTypeColors'
import { cn } from '@/lib/utils'

// One hue for the meter: used is the brand color, pending (booked, not deducted yet) the status color
// pending uses everywhere, and what is still free is a faint track of the brand color.
const RING_CONFIG = {
  used: { label: 'Used', color: 'var(--primary)' },
  pending: { label: 'Pending', color: 'var(--warning)' },
  free: { label: 'Free', color: 'var(--primary)' },
} satisfies ChartConfig

interface BalanceCardProps {
  balance: Balance
  slot: number
}

export function BalanceCard({ balance, slot }: Readonly<BalanceCardProps>) {
  const { name, allowance, used, remaining, pendingDays } = balance
  const reducedMotion = useReducedMotion()
  const pending = Math.min(pendingDays, Math.max(remaining, 0))
  const free = Math.max(remaining - pending, 0)
  const segments = [
    { key: 'used', value: used },
    { key: 'pending', value: pending },
    { key: 'free', value: free },
  ].filter((segment) => segment.value > 0)
  // A balance with nothing in it still draws its empty track.
  const ring = segments.length > 0 ? segments : [{ key: 'free', value: 1 }]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-body-sm text-muted-foreground">
          <span aria-hidden="true" className={cn('size-2.5 rounded-full', swatchClass(slot))} />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <div
          role="img"
          aria-label={`${name}: ${used} of ${allowance} days used, ${pendingDays} pending, ${remaining} left`}
          className="relative size-28 shrink-0"
        >
          <ChartContainer config={RING_CONFIG} className="aspect-square size-full">
            {/* The wrapper is the accessible image (its label says it all), so the chart itself takes
                no keyboard focus. */}
            <PieChart accessibilityLayer={false}>
              <Pie
                rootTabIndex={-1}
                data={ring}
                dataKey="value"
                nameKey="key"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={ring.length > 1 ? 3 : 0}
                cornerRadius={4}
                stroke="none"
                isAnimationActive={!reducedMotion}
              >
                {ring.map((segment) => (
                  <Cell
                    key={segment.key}
                    fill={`var(--color-${segment.key})`}
                    fillOpacity={segment.key === 'free' ? 0.14 : 1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-h1 tabular-nums">{remaining}</span>
            <span className="text-caption text-muted-foreground">
              {remaining === 1 ? 'day left' : 'days left'}
            </span>
          </div>
        </div>
        <dl className="flex min-w-0 flex-1 flex-col gap-2 text-body-sm">
          <LegendRow swatch="bg-primary" label="Used" value={used} />
          <LegendRow swatch="bg-warning" label="Pending" value={pendingDays} />
          <LegendRow swatch="bg-primary/15" label="Allowance" value={allowance} />
        </dl>
      </CardContent>
    </Card>
  )
}

interface LegendRowProps {
  swatch: string
  label: string
  value: number
}

function LegendRow({ swatch, label, value }: Readonly<LegendRowProps>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-sm', swatch)} />
        {label}
      </dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
