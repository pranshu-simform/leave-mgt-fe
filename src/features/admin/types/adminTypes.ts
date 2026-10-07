import type { LeaveType } from '@/features/leave-types/types/leaveTypeTypes'

export interface AdminLeaveType extends LeaveType {
  requiresApproval: boolean
  isActive: boolean
}

export interface CreateLeaveTypePayload {
  code: string
  name: string
  drawsFromBalance: boolean
  defaultAllowanceDays: number
  allowRetroactive: boolean
  minNoticeDays: number
  maxConsecutiveDays: number | null
  requiresNote: boolean
  requiresApproval: boolean
}

// `code` and `drawsFromBalance` are fixed after creation (the server rejects them).
export type UpdateLeaveTypePayload = Partial<
  Omit<CreateLeaveTypePayload, 'code' | 'drawsFromBalance'> & { isActive: boolean }
>

export interface AdminHoliday {
  id: string
  date: string
  name: string
}

export interface CreateHolidayPayload {
  date: string
  name: string
}

export interface AdminHolidayParams {
  year: number
  page: number
  limit: number
}
