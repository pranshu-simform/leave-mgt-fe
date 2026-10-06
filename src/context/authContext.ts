import { createContext } from 'react'
import type { AuthUser } from '@/features/auth/types/authTypes'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  // True only while the session is first being restored.
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
