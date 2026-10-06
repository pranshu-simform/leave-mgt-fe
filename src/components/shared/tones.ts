import type { Tone } from '@/constants/leaveStatus'

// Full class names, so Tailwind can see them. Subtle background, its text color and a border.
export const TONE_CLASSES: Record<Tone, string> = {
  success: 'border-success-border bg-success-subtle text-success-subtle-foreground',
  warning: 'border-warning-border bg-warning-subtle text-warning-subtle-foreground',
  danger: 'border-danger-border bg-danger-subtle text-danger-subtle-foreground',
  info: 'border-info-border bg-info-subtle text-info-subtle-foreground',
  neutral: 'border-neutral-border bg-neutral-subtle text-neutral-subtle-foreground',
}
