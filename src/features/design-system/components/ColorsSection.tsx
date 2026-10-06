import { Section, Subsection } from './Section'
import { Swatch } from './Swatch'

const STATUS = ['success', 'warning', 'danger', 'info', 'neutral'] as const
const CATEGORICAL = [1, 2, 3, 4, 5, 6, 7, 8] as const
const SCALES = {
  teal: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  slate: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  cyan: ['400', '500', '600', '700'],
  indigo: ['400', '500', '600'],
} as const

export function ColorsSection() {
  return (
    <Section
      id="colors"
      title="Color"
      description="Components use semantic tokens only. The ratio on a swatch is measured live against the page background in the current theme."
    >
      <Subsection title="Surfaces and text">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Swatch token="background" text="foreground" />
          <Swatch token="card" text="card-foreground" />
          <Swatch token="popover" text="popover-foreground" />
          <Swatch token="muted" text="muted-foreground" />
          <Swatch token="surface-sunken" text="foreground" />
        </div>
      </Subsection>

      <Subsection title="Brand and interaction">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Swatch token="primary" text="primary-foreground" />
          <Swatch token="secondary" text="secondary-foreground" />
          <Swatch token="accent" text="accent-foreground" />
          <Swatch token="ring" />
          <Swatch token="input" />
        </div>
      </Subsection>

      <Subsection title="Status (always with an icon and text)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STATUS.map((status) => (
            <div key={status} className="flex flex-col gap-3">
              <Swatch token={status} text={`${status}-foreground`} />
              <Swatch
                token={`${status}-subtle`}
                text={`${status}-subtle-foreground`}
                under={['card']}
              />
              <Swatch token={`${status}-border`} />
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection title="Categorical slots (calendar bars by leave type)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORICAL.map((slot) => (
            <Swatch key={slot} token={`cat-${slot}`} text="cat-foreground" />
          ))}
        </div>
      </Subsection>

      <Subsection title="Primitive scales (never used directly in components)">
        <div className="flex flex-col gap-3">
          {Object.entries(SCALES).map(([name, steps]) => (
            <div key={name} className="flex flex-col gap-1">
              <p className="text-caption font-medium">{name}</p>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {steps.map((step) => (
                  <div
                    key={step}
                    className="h-10 flex-1"
                    style={{ backgroundColor: `var(--${name}-${step})` }}
                    title={`--${name}-${step}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  )
}
