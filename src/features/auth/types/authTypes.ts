import type { UserRole } from '@/constants/constant'

export interface SetPasswordLink {
  name: string
  email: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
