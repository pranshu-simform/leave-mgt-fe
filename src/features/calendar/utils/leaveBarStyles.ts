// Bar fills for a leave type's color slot (see `typeSlot` in lib/leaveTypeColors.ts). The class names
// are written out in full so Tailwind sees them.
const SOLID = [
  'bg-cat-1 text-cat-foreground',
  'bg-cat-2 text-cat-foreground',
  'bg-cat-3 text-cat-foreground',
  'bg-cat-4 text-cat-foreground',
  'bg-cat-5 text-cat-foreground',
  'bg-cat-6 text-cat-foreground',
  'bg-cat-7 text-cat-foreground',
  'bg-cat-8 text-cat-foreground',
] as const

const PENDING = [
  'bg-cat-1/25 border-cat-1 text-foreground',
  'bg-cat-2/25 border-cat-2 text-foreground',
  'bg-cat-3/25 border-cat-3 text-foreground',
  'bg-cat-4/25 border-cat-4 text-foreground',
  'bg-cat-5/25 border-cat-5 text-foreground',
  'bg-cat-6/25 border-cat-6 text-foreground',
  'bg-cat-7/25 border-cat-7 text-foreground',
  'bg-cat-8/25 border-cat-8 text-foreground',
] as const

export const barClasses = (slot: number, pending: boolean): string =>
  pending ? `${PENDING[slot]} leave-bar-pending border` : (SOLID[slot] ?? SOLID[0])
