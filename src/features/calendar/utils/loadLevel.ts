const LEVELS = [
  'text-muted-foreground',
  'bg-info-subtle text-info-subtle-foreground',
  'bg-warning-subtle text-warning-subtle-foreground',
  'bg-danger-subtle text-danger-subtle-foreground',
] as const

// How crowded a day is, from none to most of the team. The number is always printed beside it, so
// the intensity is a hint and not the only signal. Used by the grid's load row and the phone agenda.
export function loadLevel(away: number, teamSize: number): (typeof LEVELS)[number] {
  if (away === 0 || teamSize === 0) return LEVELS[0]
  const share = away / teamSize
  if (share < 1 / 3) return LEVELS[1]
  if (share < 2 / 3) return LEVELS[2]
  return LEVELS[3]
}
