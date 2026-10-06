import { SparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { AccessibilitySection } from '@/features/design-system/components/AccessibilitySection'
import { CalendarGridSection } from '@/features/design-system/components/CalendarGridSection'
import { ButtonsSection } from '@/features/design-system/components/ButtonsSection'
import { ColorsSection } from '@/features/design-system/components/ColorsSection'
import { DataDisplaySection } from '@/features/design-system/components/DataDisplaySection'
import { FormsSection } from '@/features/design-system/components/FormsSection'
import { LayoutSection } from '@/features/design-system/components/LayoutSection'
import { OverlaysSection } from '@/features/design-system/components/OverlaysSection'
import { PatternsSection } from '@/features/design-system/components/PatternsSection'
import { SurfacesSection } from '@/features/design-system/components/SurfacesSection'
import { TypographySection } from '@/features/design-system/components/TypographySection'

const SECTIONS = [
  ['surfaces', 'Glass and gradients'],
  ['colors', 'Color'],
  ['typography', 'Typography'],
  ['layout', 'Spacing and motion'],
  ['buttons', 'Buttons'],
  ['forms', 'Forms'],
  ['data', 'Data display'],
  ['overlays', 'Overlays'],
  ['patterns', 'Patterns'],
  ['calendar-grid', 'Calendar grid'],
  ['accessibility', 'Accessibility'],
] as const

// Dev-only. Sets data-glass="off" on <html> to preview the opaque fallback.
function useGlassSwitch() {
  const [glass, setGlass] = useState(true)
  useEffect(() => {
    const root = document.documentElement
    if (glass) delete root.dataset.glass
    else root.dataset.glass = 'off'
    return () => {
      delete root.dataset.glass
    }
  }, [glass])
  return [glass, setGlass] as const
}

export default function DesignSystemPage() {
  const [glass, setGlass] = useGlassSwitch()
  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Design system"
        description="Tokens, glass, components and patterns, in the theme you are viewing. Switch theme from the header."
        actions={
          <Button
            variant="outline"
            aria-pressed={glass}
            onClick={() => setGlass((value) => !value)}
          >
            <SparklesIcon aria-hidden="true" data-icon="inline-start" />
            Glass {glass ? 'on' : 'off'}
          </Button>
        }
      />
      <nav aria-label="On this page" className="sticky top-header z-10 -mt-6 -mb-6 py-2">
        <ul className="flex gap-1 overflow-x-auto rounded-xl p-1 glass">
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="block rounded-lg px-3 py-1.5 text-label whitespace-nowrap hover:bg-accent hover:text-accent-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <SurfacesSection />
      <ColorsSection />
      <TypographySection />
      <LayoutSection />
      <ButtonsSection />
      <FormsSection />
      <DataDisplaySection />
      <OverlaysSection />
      <PatternsSection />
      <CalendarGridSection />
      <AccessibilitySection />
    </div>
  )
}
