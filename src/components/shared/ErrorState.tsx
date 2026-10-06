import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { TONE_CLASSES } from './tones'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: Readonly<ErrorStateProps>) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center',
        TONE_CLASSES.danger,
        className,
      )}
    >
      <TriangleAlertIcon aria-hidden="true" className="size-6" />
      <div className="flex flex-col gap-1">
        <p className="text-h3">{title}</p>
        <p className="max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
          Try again
        </Button>
      )}
    </div>
  )
}
