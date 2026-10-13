import { ArrowUpRightIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Card, Skeleton } from '@/components/ui'
import type { Tone } from '@/constants/leaveStatus'
import { cn } from '@/lib/utils'
import { TONE_CLASSES } from './tones'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  // A short line under the value, for example the unit or what the number counts.
  hint?: string
  // Colors the icon chip only. The label still says what the number is, so color is never alone.
  tone?: Tone
  // Makes the whole tile a link (for example a count that opens its list).
  to?: string
  isLoading?: boolean
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  to,
  isLoading = false,
  className,
}: Readonly<StatCardProps>) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1 text-body-sm text-muted-foreground">
          <span className="truncate">{label}</span>
          {to && (
            <ArrowUpRightIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 transition-transform group-hover/stat:translate-x-0.5 group-hover/stat:-translate-y-0.5"
            />
          )}
        </span>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg border',
            tone ? TONE_CLASSES[tone] : 'border-transparent bg-brand-soft text-accent-foreground',
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <span className="text-h1 tabular-nums">{value}</span>
        )}
        {hint && <span className="truncate text-caption text-muted-foreground">{hint}</span>}
      </div>
    </>
  )

  return (
    <Card className={cn('group/stat h-full gap-2 px-4', to && 'lift', className)}>
      {to ? (
        <Link
          to={to}
          className="-m-1 flex flex-col gap-2 rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  )
}
