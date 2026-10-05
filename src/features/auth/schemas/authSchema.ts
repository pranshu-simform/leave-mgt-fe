import { z } from 'zod'

// Mirrors the server's rules for a useful message before the request. The server stays the authority.
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
})

export type LoginFormData = z.infer<typeof loginSchema>
