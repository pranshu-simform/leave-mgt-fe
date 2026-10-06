import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Section, Subsection } from './Section'

// Full class names, so Tailwind can see them.
const ELEVATIONS = [
  { name: 'xs', className: 'shadow-xs' },
  { name: 'sm', className: 'shadow-sm' },
  { name: 'md', className: 'shadow-md' },
  { name: 'lg', className: 'shadow-lg' },
  { name: 'glass', className: 'shadow-glass' },
  { name: 'glow', className: 'shadow-glow' },
] as const

export function SurfacesSection() {
  return (
    <Section
      id="surfaces"
      title="Backdrop, glass and gradients"
      description="A fixed aurora sits behind the app. Surfaces are translucent and blurred over it. Three glass levels: cards, raised chrome (shell, header) and overlays (dialogs, menus)."
    >
      <div className="rounded-2xl bg-aurora p-6 ring-1 ring-border">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-xl p-4 glass">
            <p className="text-h3">glass</p>
            <p className="text-muted-foreground">Cards and panels. Light blur.</p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-4 glass-raised">
            <p className="text-h3">glass-raised</p>
            <p className="text-muted-foreground">Shell, sidebar, sticky bars. Medium blur.</p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-4 glass-overlay">
            <p className="text-h3">glass-overlay</p>
            <p className="text-muted-foreground">Dialogs, sheets, menus. Strongest blur.</p>
          </div>
        </div>
      </div>

      <Subsection title="Gradients (brand and emphasis only, never status)">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex h-24 items-end rounded-xl bg-brand p-3 text-primary-foreground shadow-glow">
            <span className="text-label font-semibold">bg-brand</span>
          </div>
          <div className="flex h-24 items-end rounded-xl bg-brand-soft p-3 ring-1 ring-border">
            <span className="text-label font-semibold">bg-brand-soft</span>
          </div>
          <div className="flex h-24 items-end rounded-xl p-3 glass">
            <span className="text-display text-gradient">Display</span>
          </div>
        </div>
      </Subsection>

      <Subsection title="Emphasis and interaction">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="gradient-border">
            <CardHeader>
              <CardTitle>gradient-border</CardTitle>
              <CardDescription>
                A gradient hairline for one featured panel per screen.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Use sparingly. Emphasis loses meaning when everything has it.
            </CardContent>
          </Card>
          <Card className="lift">
            <CardHeader>
              <CardTitle>lift</CardTitle>
              <CardDescription>Hover this card: a small, smooth rise.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              For cards that are clickable. Not for static content.
            </CardContent>
          </Card>
        </div>
      </Subsection>

      <Subsection title="Elevation">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ELEVATIONS.map(({ name, className }) => (
            <div
              key={name}
              className={`flex h-20 items-center justify-center rounded-xl bg-card text-label ${className}`}
            >
              {className}
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  )
}
