export interface Balance {
  leaveTypeId: string
  code: string
  name: string
  year: number
  allowance: number
  used: number
  remaining: number
  // Days in requests that are still waiting for a decision. They are not deducted yet.
  pendingDays: number
}
