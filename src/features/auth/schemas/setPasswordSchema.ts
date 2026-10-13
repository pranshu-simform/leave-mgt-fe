import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8
// bcrypt only reads the first 72 bytes, so the server stops there.
export const PASSWORD_MAX_LENGTH = 72

// Mirrors the server's rules for a useful message before the request. The server stays the authority.
export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Type the password again'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match',
  })

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>
