import { ErrorState } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui'
import type { RequestPreview } from '@/features/leave-requests/types/leaveRequestTypes'
import { TeamOverlap } from '@/features/leave-requests/components/TeamOverlap'
import { cn } from '@/lib/utils'

interface PreviewPanelProps {
  preview: RequestPreview | undefined
  // A newer answer is on its way: the numbers below are from earlier input.
  isChecking: boolean
  // The check itself failed (not a rule: the network or the server).
  failed: boolean
  onRetry: () => void
}

function Days({ days }: Readonly<{ days: number }>) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className="text-display tabular-nums">{days}</span>
      <span className="text-muted-foreground">working {days === 1 ? 'day' : 'days'}</span>
    </p>
  )
}

function Balance({ balance }: Readonly<{ balance: NonNullable<RequestPreview['balance']> }>) {
  const { allowance, remaining, remainingAfter } = balance
  const usedAfter = allowance - remainingAfter
  const percent =
    allowance > 0 ? Math.min(100, Math.max(0, Math.round((usedAfter / allowance) * 100))) : 0
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-sm text-muted-foreground">Your balance</p>
      <p>
        <span className="tabular-nums">{remaining}</span> days left now,{' '}
        <span
          className={cn(
            'font-semibold tabular-nums',
            remainingAfter < 0 && 'text-danger-subtle-foreground',
          )}
        >
          {remainingAfter}
        </span>{' '}
        after this request
      </p>
      <Progress
        value={percent}
        aria-label={`${usedAfter} of ${allowance} days used after this request`}
      />
    </div>
  )
}

export function PreviewPanel({
  preview,
  isChecking,
  failed,
  onRetry,
}: Readonly<PreviewPanelProps>) {
  return (
    <Card aria-busy={isChecking}>
      <CardHeader>
        <CardTitle className="text-h3">Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p role="status" className="text-body-sm text-muted-foreground empty:hidden">
          {isChecking ? 'Checking...' : ''}
        </p>
        {failed && (
          <ErrorState
            title="Could not check these dates"
            message="Check your connection and try again."
            onRetry={onRetry}
          />
        )}
        {!preview && !failed && (
          <p className="text-muted-foreground">
            Choose a leave type and your dates to see the working days, your balance and who else is
            off.
          </p>
        )}
        {preview && (
          <div className={cn('flex flex-col gap-5 transition-opacity', isChecking && 'opacity-60')}>
            <Days days={preview.days} />
            {preview.balance && <Balance balance={preview.balance} />}
            {preview.overlaps && <TeamOverlap overlaps={preview.overlaps} />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
