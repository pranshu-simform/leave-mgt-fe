import type { UserRole } from '@/constants/constant'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
