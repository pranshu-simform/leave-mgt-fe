import { z } from 'zod'
import { USER_ROLES } from '@/constants/constant'

export const USER_NAME_MAX_LENGTH = 100
export const USER_EMAIL_MAX_LENGTH = 254

// Mirrors the server's rules for a useful message before the request. The server stays the authority.
export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name')
    .max(USER_NAME_MAX_LENGTH, `At most ${USER_NAME_MAX_LENGTH} characters`),
  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address')
    .max(USER_EMAIL_MAX_LENGTH, `At most ${USER_EMAIL_MAX_LENGTH} characters`)
    .pipe(z.email('Enter a valid email address')),
  role: z.enum(Object.values(USER_ROLES), 'Choose a role'),
  // An empty string means no manager.
  managerId: z.string(),
})

export type UserFormData = z.infer<typeof userSchema>
