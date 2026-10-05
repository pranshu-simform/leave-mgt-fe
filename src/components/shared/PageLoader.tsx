import { Loader2Icon } from 'lucide-react'

export function PageLoader({ label = 'Loading' }: Readonly<{ label?: string }>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"
    >
      <Loader2Icon aria-hidden="true" className="size-5 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
