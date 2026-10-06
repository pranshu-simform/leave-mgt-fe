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

export interface RequestPayload {
  leaveTypeId: string
  startDate: string
  endDate: string
  note?: string
}

export interface UpdatePayload {
  startDate: string
  endDate: string
  note?: string
  // The version the user last saw; the server refuses the edit if the request has changed since.
  version: number
}

export type ViolationCode =
  | 'CROSS_YEAR_RANGE'
  | 'NO_WORKING_DAYS'
  | 'RETROACTIVE_NOT_ALLOWED'
  | 'NOTICE_TOO_SHORT'
  | 'MAX_DAYS_EXCEEDED'
  | 'NOTE_REQUIRED'
  | 'INSUFFICIENT_BALANCE'

export interface RequestViolation {
  code: ViolationCode
  // The form field the problem belongs to: startDate, endDate or note.
  field: string
  message: string
}

export interface AbsenceItem {
  requestId: string
  userId: string
  name: string
  leaveType: { code: string; name: string }
  startDate: string
  endDate: string
  status: 'PENDING' | 'APPROVED'
}

// Who else on the team is off during a request, and how crowded the busiest day gets.
export interface OverlapSummary {
  overlapping: AbsenceItem[]
  peakConcurrent: number
  teamSize: number
}

export interface RequestPreview {
  days: number
  violations: RequestViolation[]
  balance: { allowance: number; used: number; remaining: number; remainingAfter: number } | null
  // Null when there are no working days to compare.
  overlaps: OverlapSummary | null
}
