import type { UserRole } from '@/constants/constant'
import type { LeaveStatus } from '@/constants/leaveStatus'
import type { LeaveType } from '@/features/leave-types/types/leaveTypeTypes'

export interface AdminLeaveType extends LeaveType {
  requiresApproval: boolean
  isActive: boolean
}

export interface CreateLeaveTypePayload {
  name: string
  drawsFromBalance: boolean
  defaultAllowanceDays: number
  allowRetroactive: boolean
  minNoticeDays: number
  maxConsecutiveDays: number | null
  requiresNote: boolean
  requiresApproval: boolean
}

// `drawsFromBalance` is fixed after creation (the server rejects it).
export type UpdateLeaveTypePayload = Partial<
  Omit<CreateLeaveTypePayload, 'drawsFromBalance'> & { isActive: boolean }
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

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  manager: { id: string; name: string } | null
}

export interface AdminUserParams {
  page: number
  limit: number
  search?: string
  role?: UserRole
  isActive?: boolean
}

export interface AdminRequestParams {
  page: number
  limit: number
  year: number
  status?: LeaveStatus
  leaveTypeId?: string
  userId?: string
}

// `delta` is signed: positive adds allowance days, negative removes them.
export interface AdjustBalancePayload {
  userId: string
  leaveTypeId: string
  year: number
  delta: number
  note: string
}

export interface AllocationResult {
  year: number
  created: number
}

// One balance whose stored numbers disagree with what its ledger adds up to.
export interface BalanceDrift {
  balanceId: string
  user: { id: string; name: string }
  leaveType: { id: string; name: string }
  allowance: number
  expectedAllowance: number
  used: number
  expectedUsed: number
}

export interface ReconcileReport {
  year: number
  checked: number
  // The real number of mismatches; `drifts` holds at most the first 100.
  driftCount: number
  drifts: BalanceDrift[]
}
