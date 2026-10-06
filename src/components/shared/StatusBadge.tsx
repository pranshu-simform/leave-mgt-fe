import { Badge } from '@/components/ui'
import { LEAVE_STATUS_CONFIG, type LeaveStatus } from '@/constants/leaveStatus'
import { cn } from '@/lib/utils'
import { TONE_CLASSES } from './tones'

interface StatusBadgeProps {
  status: LeaveStatus
  className?: string
}

export function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const { label, tone, icon: Icon } = LEAVE_STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], className)}>
      <Icon aria-hidden="true" className="size-3" />
      {label}
    </Badge>
  )
}
