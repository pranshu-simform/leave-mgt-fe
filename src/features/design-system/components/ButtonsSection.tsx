import { ArrowRightIcon, Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { WithTooltip } from '@/components/shared'
import { Section, Subsection } from './Section'

const VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const SIZES = ['xs', 'sm', 'default', 'lg'] as const

export function ButtonsSection() {
  return (
    <Section
      id="buttons"
      title="Buttons"
      description="One gradient primary action per view. Everything else is secondary, outline or ghost. Destructive is a tinted button, never the loudest thing on the page."
    >
      <Subsection title="Variants">
        <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </Subsection>

      <Subsection title="Sizes and icons">
        <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button>
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            New request
          </Button>
          <Button variant="outline">
            Continue
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Delete">
            <TrashIcon aria-hidden="true" />
          </Button>
        </div>
      </Subsection>

      <Subsection title="States">
        <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
          <Button disabled>
            <Loader2Icon aria-hidden="true" className="animate-spin" data-icon="inline-start" />
            Submitting
          </Button>
          <WithTooltip content="Choose a leave type first.">
            <Button disabled>Disabled, with a reason</Button>
          </WithTooltip>
          <Button variant="outline">Tab here to see focus</Button>
        </div>
        <p className="text-caption text-muted-foreground">
          Disabled buttons always say why (hover or focus the second one). While a request is in
          flight the button is disabled and shows a spinner, which also stops a double click.
        </p>
      </Subsection>
    </Section>
  )
}
