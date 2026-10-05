import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui'
import type { Balance } from '@/features/balances/types/balanceTypes'

export function BalanceCard({ balance }: Readonly<{ balance: Balance }>) {
  const { name, allowance, used, remaining, pendingDays } = balance
  // The bar shows how much of the allowance is already used.
  const usedPercent = allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body-sm text-muted-foreground">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="flex items-baseline gap-1.5">
          <span className="text-display tabular-nums">{remaining}</span>
          <span className="text-muted-foreground">
            {remaining === 1 ? 'day left' : 'days left'}
          </span>
        </p>
        <Progress value={usedPercent} aria-label={`${name}: ${used} of ${allowance} days used`} />
        <dl className="grid grid-cols-3 gap-2 text-body-sm">
          <div>
            <dt className="text-muted-foreground">Used</dt>
            <dd className="font-medium tabular-nums">{used}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pending</dt>
            <dd className="font-medium tabular-nums">{pendingDays}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Allowance</dt>
            <dd className="font-medium tabular-nums">{allowance}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
