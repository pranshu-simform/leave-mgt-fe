import { useTheme } from '@/hooks/useTheme'
import { useMemo } from 'react'
import { Badge } from '@/components/ui'
import { contrastRatio } from '@/features/design-system/lib/contrast'
import { Section } from './Section'

interface Pair {
  label: string
  fg: string
  under: string[]
  min: number
}

const PAIRS: Pair[] = [
  { label: 'Body text on a card', fg: 'foreground', under: ['card'], min: 4.5 },
  { label: 'Secondary text on a card', fg: 'muted-foreground', under: ['card'], min: 4.5 },
  { label: 'Text on a dialog or menu', fg: 'popover-foreground', under: ['popover'], min: 4.5 },
  { label: 'Link or brand text on a card', fg: 'primary', under: ['card'], min: 4.5 },
  { label: 'Primary button text', fg: 'primary-foreground', under: ['primary'], min: 4.5 },
  { label: 'Error text on a card', fg: 'danger', under: ['card'], min: 4.5 },
  {
    label: 'Pending badge text',
    fg: 'warning-subtle-foreground',
    under: ['card', 'warning-subtle'],
    min: 4.5,
  },
  {
    label: 'Approved badge text',
    fg: 'success-subtle-foreground',
    under: ['card', 'success-subtle'],
    min: 4.5,
  },
  {
    label: 'Rejected badge text',
    fg: 'danger-subtle-foreground',
    under: ['card', 'danger-subtle'],
    min: 4.5,
  },
  {
    label: 'Cancelled badge text',
    fg: 'neutral-subtle-foreground',
    under: ['card', 'neutral-subtle'],
    min: 4.5,
  },
  { label: 'Input border against a card', fg: 'input', under: ['card'], min: 3 },
  { label: 'Focus ring against a card', fg: 'ring', under: ['card'], min: 3 },
]

const RULES = [
  'Text keeps 4.5:1 and interface edges and the focus ring keep 3:1, in both themes and over the whole aurora.',
  'Status is never color alone: every status has an icon and a label.',
  'Every interactive element is reachable by keyboard and shows a visible focus ring.',
  'Every input has a label tied to it; errors are announced and linked with aria-describedby.',
  'Disabled actions explain why. Dialogs trap focus and give it back.',
  'Reduced motion removes animation. Reduced transparency (or the switch above) swaps glass for solid surfaces.',
]

export function AccessibilitySection() {
  const { resolvedTheme } = useTheme()
  // Re-measure when the theme changes.
  const rows = useMemo(
    () =>
      resolvedTheme
        ? PAIRS.map((pair) => ({ ...pair, ratio: contrastRatio(pair.fg, pair.under) }))
        : [],
    [resolvedTheme],
  )

  return (
    <Section
      id="accessibility"
      title="Accessibility"
      description="Measured in your current theme, over the page background. The documented table in docs/DESIGN-SYSTEM.md also covers the brightest and darkest parts of the aurora."
    >
      <ul className="flex list-disc flex-col gap-1.5 rounded-xl p-5 pl-9 glass">
        {RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <div className="grid gap-2 rounded-xl p-4 glass sm:grid-cols-2">
        {rows.map(({ label, ratio, min }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-1">
            <span>{label}</span>
            <Badge variant="outline" className="tabular-nums">
              {ratio.toFixed(1)}:1 {ratio >= min ? 'passes' : 'FAILS'} {min}:1
            </Badge>
          </div>
        ))}
      </div>
    </Section>
  )
}
