import { Section } from './Section'

const SCALE = [
  {
    cls: 'text-display',
    name: 'display',
    use: 'One per page, with text-gradient',
    sample: 'Plan your time away',
  },
  { cls: 'text-h1', name: 'h1', use: 'Page title', sample: 'My leave requests' },
  { cls: 'text-h2', name: 'h2', use: 'Section title', sample: 'Upcoming leave' },
  { cls: 'text-h3', name: 'h3', use: 'Card and dialog title', sample: 'Annual leave' },
  {
    cls: 'text-body',
    name: 'body',
    use: 'Default text, 14px',
    sample: 'Your request was sent to your manager for approval.',
  },
  {
    cls: 'text-body-sm',
    name: 'body-sm',
    use: 'Dense tables and secondary copy',
    sample: 'Submitted on 5 Oct 2026 by Elliot Evans',
  },
  { cls: 'text-label', name: 'label', use: 'Form labels, buttons, nav', sample: 'Start date' },
  {
    cls: 'text-caption',
    name: 'caption',
    use: 'Hints, timestamps, legends',
    sample: 'Balances reset on 1 January',
  },
] as const

export function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      description="Geist Variable. Classes are named by role, and size, line height, weight and tracking are set once in the theme."
    >
      <div className="flex flex-col divide-y divide-border rounded-xl glass">
        {SCALE.map(({ cls, name, use, sample }) => (
          <div
            key={name}
            className="flex flex-col gap-1 p-4 sm:grid sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-6"
          >
            <div className="flex flex-col">
              <span className="text-label">{cls}</span>
              <span className="text-caption text-muted-foreground">{use}</span>
            </div>
            <p className={cls === 'text-display' ? `${cls} text-gradient` : cls}>{sample}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl p-4 glass">
          <p className="text-label">Numbers align (tabular-nums)</p>
          <p className="text-h2 tabular-nums">12 / 20 days</p>
          <p className="text-h2 tabular-nums">8 / 20 days</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl p-4 glass">
          <p className="text-label">Long titles wrap, never clip (text-balance)</p>
          <h3 className="text-h3">
            A very long request title that needs to wrap on narrow screens
          </h3>
        </div>
      </div>
    </Section>
  )
}
