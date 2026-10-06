export interface Holiday {
  date: string
  name: string
}

export interface Team {
  managerId: string
  managerName: string
  teamSize: number
}

// How many of a team are away on one weekday.
export interface SummaryDay {
  date: string
  managerId: string
  managerName: string
  teamSize: number
  pending: number
  approved: number
}
