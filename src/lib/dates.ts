import { format, getYear, isSameMonth, isSameYear, isValid, parse } from 'date-fns'

// A calendar date is a `YYYY-MM-DD` string everywhere: in the API, in state and in the URL. It is
// turned into a Date only to be shown or picked, always as local midnight built from its parts, so
// no timezone can move it to another day. Never use `new Date('2026-03-01')`: that is UTC midnight.
const ISO_FORMAT = 'yyyy-MM-dd'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isValidIsoDate(iso: string): boolean {
  if (!ISO_DATE.test(iso)) return false
  const date = parse(iso, ISO_FORMAT, new Date())
  // The round trip rejects overflow such as 2026-02-31.
  return isValid(date) && format(date, ISO_FORMAT) === iso
}

export function parseIsoDate(iso: string): Date {
  if (!isValidIsoDate(iso)) throw new Error(`Invalid ISO date: ${iso}`)
  return parse(iso, ISO_FORMAT, new Date())
}

export function toIsoDate(date: Date): string {
  return format(date, ISO_FORMAT)
}

// The user's local calendar date. It is for display only: the server decides with its own UTC date,
// so the two can differ by a day, and a rule is never checked against this value in the browser.
export function todayLocalIso(): string {
  return toIsoDate(new Date())
}

export function isoYear(iso: string): number {
  return getYear(parseIsoDate(iso))
}

export function formatDate(iso: string): string {
  return format(parseIsoDate(iso), 'd MMM yyyy')
}

// "1 Mar 2026", "1 to 5 Mar 2026", "28 Feb to 3 Mar 2026" or "30 Dec 2026 to 2 Jan 2027".
export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseIsoDate(startIso)
  const end = parseIsoDate(endIso)
  if (startIso === endIso) return format(start, 'd MMM yyyy')
  if (isSameMonth(start, end)) return `${format(start, 'd')} to ${format(end, 'd MMM yyyy')}`
  if (isSameYear(start, end)) return `${format(start, 'd MMM')} to ${format(end, 'd MMM yyyy')}`
  return `${format(start, 'd MMM yyyy')} to ${format(end, 'd MMM yyyy')}`
}

// An instant from the API (an ISO timestamp, such as createdAt), shown in the user's local time.
export function formatInstantDate(instant: string): string {
  return format(new Date(instant), 'd MMM yyyy')
}

export function formatDateTime(instant: string): string {
  return format(new Date(instant), 'd MMM yyyy, HH:mm')
}
