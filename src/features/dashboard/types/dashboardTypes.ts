// Approved working days of the signed-in user in one month and leave type ('YYYY-MM').
export interface MonthlyDays {
  month: string
  leaveTypeId: string
  name: string
  days: number
}

// People away on one working day: approved, and pending (not decided yet).
export interface TeamDay {
  date: string
  approved: number
  pending: number
}

export interface TeamStats {
  teamSize: number
  awayToday: number
  days: TeamDay[]
}

export interface DashboardStats {
  year: number
  monthly: MonthlyDays[]
  // A manager's direct reports, or everyone for HR. Null for an employee.
  team: TeamStats | null
}
