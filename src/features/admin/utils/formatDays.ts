export function formatDays(count: number): string {
  return `${count} ${count === 1 ? 'day' : 'days'}`
}
