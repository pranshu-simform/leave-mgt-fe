import { z } from 'zod'
import { isValidIsoDate } from '@/lib/dates'

export const NOTE_MAX_LENGTH = 500

const isoDate = z.string().min(1, 'Choose your dates').refine(isValidIsoDate, 'Choose a valid date')

// Mirrors the server's rules for a useful message before the request. The server stays the
// authority, and the preview endpoint reports the rules that depend on the leave type.
export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Choose a leave type'),
    startDate: isoDate,
    endDate: isoDate,
    note: z.string().max(NOTE_MAX_LENGTH, `Keep the note under ${NOTE_MAX_LENGTH} characters`),
  })
  .refine((value) => value.startDate <= value.endDate, {
    path: ['endDate'],
    message: 'The end date must be on or after the start date',
    // Only when both dates are valid; ISO strings compare correctly as strings.
    when: (payload) => payload.issues.length === 0,
  })

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// "Cancel and resubmit" opens the form with the old values in the URL. The URL is user input, so
// each value is checked on its own and an invalid one is dropped rather than trusted.
export function parsePrefill(params: URLSearchParams): Partial<LeaveRequestFormData> {
  const prefill: Partial<LeaveRequestFormData> = {}

  const leaveTypeId = params.get('leaveTypeId')
  if (leaveTypeId && UUID.test(leaveTypeId)) prefill.leaveTypeId = leaveTypeId

  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  if (
    startDate &&
    endDate &&
    isValidIsoDate(startDate) &&
    isValidIsoDate(endDate) &&
    startDate <= endDate
  ) {
    prefill.startDate = startDate
    prefill.endDate = endDate
  }

  const note = params.get('note')
  if (note && note.length <= NOTE_MAX_LENGTH) prefill.note = note

  return prefill
}

export function prefillSearch(
  values: Pick<LeaveRequestFormData, 'leaveTypeId' | 'startDate' | 'endDate'> & {
    note: string | null
  },
): string {
  const params = new URLSearchParams({
    leaveTypeId: values.leaveTypeId,
    startDate: values.startDate,
    endDate: values.endDate,
  })
  if (values.note) params.set('note', values.note)
  return params.toString()
}
