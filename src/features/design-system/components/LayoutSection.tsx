import { CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Section, Subsection } from './Section'

const SPACING = [1, 2, 3, 4, 6, 8, 12, 16] as const
const RADII = ['sm', 'md', 'lg', 'xl', '2xl', '4xl'] as const
const SPACING_CLASSES: Record<(typeof SPACING)[number], string> = {
  1: 'w-1',
  2: 'w-2',
  3: 'w-3',
  4: 'w-4',
  6: 'w-6',
  8: 'w-8',
  12: 'w-12',
  16: 'w-16',
}
const RADIUS_CLASSES: Record<(typeof RADII)[number], string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '4xl': 'rounded-4xl',
}

export function LayoutSection() {
  const [runs, setRuns] = useState(0)
  return (
    <Section
      id="layout"
      title="Spacing, shape, motion and icons"
      description="A 4px spacing scale, one radius token, one easing curve and three durations. Everything animated respects reduced motion."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Subsection title="Spacing (4px scale)">
          <div className="flex flex-col gap-2 rounded-xl p-4 glass">
            {SPACING.map((step) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-16 text-caption text-muted-foreground">
                  {step} · {step * 4}px
                </span>
                <span className={`h-3 rounded-sm bg-brand ${SPACING_CLASSES[step]}`} />
              </div>
            ))}
          </div>
        </Subsection>
        <Subsection title="Radius (--radius 0.75rem)">
          <div className="grid grid-cols-3 gap-3 rounded-xl p-4 glass">
            {RADII.map((r) => (
              <div
                key={r}
                className={`flex h-14 items-center justify-center border border-border bg-muted text-caption ${RADIUS_CLASSES[r]}`}
              >
                rounded-{r}
              </div>
            ))}
          </div>
        </Subsection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Subsection title="Layout tokens">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-xl p-4 text-body-sm glass">
            <dt className="text-muted-foreground">header height</dt>
            <dd>h-header (3.5rem)</dd>
            <dt className="text-muted-foreground">content width</dt>
            <dd>max-w-content (80rem)</dd>
            <dt className="text-muted-foreground">page gutter</dt>
            <dd>px-gutter (1rem to 2rem)</dd>
            <dt className="text-muted-foreground">sidebar</dt>
            <dd>16rem, collapses to icons, sheet below md</dd>
            <dt className="text-muted-foreground">z-index</dt>
            <dd>sticky 20, overlay 50, toast 100</dd>
            <dt className="text-muted-foreground">control height</dt>
            <dd>sm 28, default 32, lg 40</dd>
          </dl>
        </Subsection>
        <Subsection title="Motion (ease-smooth, 150 / 250 / 400 ms)">
          <div className="flex flex-col gap-3 rounded-xl p-4 glass">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setRuns((n) => n + 1)}>
                Replay fade-rise
              </Button>
              <span
                key={runs}
                className="animate-fade-rise rounded-lg bg-brand-soft px-3 py-2 text-label"
              >
                animate-fade-rise
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              Hover and focus transitions use 250 ms. Overlays enter in 400 ms. With reduced motion
              on, all of it is instant.
            </p>
          </div>
        </Subsection>
      </div>

      <Subsection title="Icons (lucide, 16 / 20 / 24)">
        <div className="flex flex-wrap items-center gap-6 rounded-xl p-4 glass">
          {[16, 20, 24].map((px) => (
            <div key={px} className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon aria-hidden="true" style={{ width: px, height: px }} />
              <ClockIcon aria-hidden="true" style={{ width: px, height: px }} />
              <UsersIcon aria-hidden="true" style={{ width: px, height: px }} />
              <span className="text-caption">{px}px</span>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  )
}
