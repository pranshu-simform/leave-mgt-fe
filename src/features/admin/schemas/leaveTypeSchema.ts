import { z } from 'zod'

// These limits and messages mirror the server (`modules/admin`), so a form error and a server error
// read the same.
export const LEAVE_TYPE_NAME_MAX_LENGTH = 60
export const LEAVE_DAYS_MAX = 365

const days = (label: string) =>
  z
    .number(`${label}: enter a number`)
    .int('Use whole days')
    .min(0, 'Cannot be negative')
    .max(LEAVE_DAYS_MAX, `At most ${LEAVE_DAYS_MAX} days`)

export const leaveTypeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Give the type a name')
      .max(LEAVE_TYPE_NAME_MAX_LENGTH, `At most ${LEAVE_TYPE_NAME_MAX_LENGTH} characters`),
    drawsFromBalance: z.boolean(),
    defaultAllowanceDays: days('Allowance'),
    minNoticeDays: days('Notice'),
    maxConsecutiveDays: z
      .number('Enter a number, or leave empty for no limit')
      .int('Use whole days')
      .min(1, 'At least 1 day')
      .max(LEAVE_DAYS_MAX, `At most ${LEAVE_DAYS_MAX} days`)
      .nullable(),
    allowRetroactive: z.boolean(),
    requiresNote: z.boolean(),
    requiresApproval: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((value) => value.drawsFromBalance || value.defaultAllowanceDays === 0, {
    path: ['defaultAllowanceDays'],
    message: 'A type without a balance has no allowance',
    when: (payload) => payload.issues.length === 0,
  })

export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>
