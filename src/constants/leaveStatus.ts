import { BanIcon, CircleCheckIcon, CircleXIcon, ClockIcon, type LucideIcon } from 'lucide-react'

export const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const
export type LeaveStatus = (typeof LEAVE_STATUSES)[number]

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusConfig {
  label: string
  tone: Tone
  icon: LucideIcon
}

// Status is never shown by color alone: every status has a label and an icon.
export const LEAVE_STATUS_CONFIG: Record<LeaveStatus, StatusConfig> = {
  PENDING: { label: 'Pending', tone: 'warning', icon: ClockIcon },
  APPROVED: { label: 'Approved', tone: 'success', icon: CircleCheckIcon },
  REJECTED: { label: 'Rejected', tone: 'danger', icon: CircleXIcon },
  CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: BanIcon },
}
