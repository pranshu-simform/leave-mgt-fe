import { z } from 'zod'

export const REASON_MAX_LENGTH = 500

// Mirrors the server: a rejection needs a reason, because the employee sees it in their history.
export const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Give a reason, the employee will see it')
    .max(REASON_MAX_LENGTH, `Keep the reason under ${REASON_MAX_LENGTH} characters`),
})

export type RejectFormData = z.infer<typeof rejectSchema>
