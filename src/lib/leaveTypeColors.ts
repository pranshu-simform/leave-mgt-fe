// Leave types take a color slot (cat-1 to cat-8) by their position in the id-sorted list of types.
// Ids are time-ordered, so that is creation order: a type keeps its color in every session and on
// every screen, a rename never changes it, and a new type is added at the end. The class names are
// written out in full so Tailwind sees them.
const SWATCH = [
  'bg-cat-1',
  'bg-cat-2',
  'bg-cat-3',
  'bg-cat-4',
  'bg-cat-5',
  'bg-cat-6',
  'bg-cat-7',
  'bg-cat-8',
] as const

export const LEAVE_TYPE_SLOTS = SWATCH.length

export function typeSlot(typeId: string, allTypeIds: readonly string[]): number {
  const sorted = [...new Set(allTypeIds)].sort()
  const index = sorted.indexOf(typeId)
  return (index < 0 ? 0 : index) % LEAVE_TYPE_SLOTS
}

export const swatchClass = (slot: number): string => SWATCH[slot] ?? SWATCH[0]
