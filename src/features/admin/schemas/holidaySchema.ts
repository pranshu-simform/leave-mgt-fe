import { z } from 'zod'
import { isValidIsoDate } from '@/lib/dates'

export const HOLIDAY_NAME_MAX_LENGTH = 80

export const holidaySchema = z.object({
  date: z.string().refine(isValidIsoDate, 'Pick a date'),
  name: z
    .string()
    .trim()
    .min(1, 'Give the holiday a name')
    .max(HOLIDAY_NAME_MAX_LENGTH, `At most ${HOLIDAY_NAME_MAX_LENGTH} characters`),
})

export type HolidayFormData = z.infer<typeof holidaySchema>
