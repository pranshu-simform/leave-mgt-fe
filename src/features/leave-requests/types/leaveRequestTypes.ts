import type { LeaveStatus } from '@/constants/leaveStatus'

export interface LeaveRequest {
  id: string
  leaveType: { id: string; code: string; name: string }
  startDate: string
  endDate: string
  days: number
  note: string | null
  status: LeaveStatus
  version: number
  requester: { id: string; name: string }
  decidedAt: string | null
  createdAt: string
}

export interface LeaveRequestListParams {
  page: number
  limit: number
  status?: LeaveStatus
  year?: number
  leaveTypeId?: string
  // Requests that end on or after this date, soonest first.
  from?: string
}

export type EventAction =
  | 'SUBMITTED'
  | 'AUTO_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EDITED'
  | 'CANCELLED'

export interface RequestEvent {
  id: string
  action: EventAction
  fromStatus: LeaveStatus | null
  toStatus: LeaveStatus
  reason: string | null
  // An edit stores { from, to } with the dates and note before and after; other events store nothing.
  metadata: unknown
  createdAt: string
  actor: { id: string; name: string }
}
