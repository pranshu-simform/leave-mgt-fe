import { z } from 'zod'

// These limits mirror the server (`modules/admin`), so a form error and a server error read the same.
export const ADJUST_DAYS_MAX = 365
export const ADJUST_NOTE_MAX_LENGTH = 200

export const ADJUST_ACTIONS = ['add', 'remove'] as const

// `removable` is how many days the person can lose: what is left, allowance minus used. The server
// enforces the same rule against the live row, and answers 422 if the balance moved meanwhile.
export function buildAdjustBalanceSchema(removable: number) {
  return z
    .object({
      action: z.enum(ADJUST_ACTIONS),
      days: z
        .number('Enter the number of days')
        .int('Use whole days')
        .min(1, 'At least 1 day')
        .max(ADJUST_DAYS_MAX, `At most ${ADJUST_DAYS_MAX} days`),
      note: z
        .string()
        .trim()
        .min(1, 'Say why the balance changes')
        .max(ADJUST_NOTE_MAX_LENGTH, `At most ${ADJUST_NOTE_MAX_LENGTH} characters`),
    })
    .refine((value) => value.action === 'add' || value.days <= removable, {
      path: ['days'],
      message: `At most ${removable} ${removable === 1 ? 'day' : 'days'} can be removed`,
      // Days is checked against the balance as soon as it is a valid number, whatever the note says.
      when: (payload) => !payload.issues.some((issue) => issue.path?.[0] === 'days'),
    })
}

export type AdjustBalanceFormData = z.infer<ReturnType<typeof buildAdjustBalanceSchema>>
