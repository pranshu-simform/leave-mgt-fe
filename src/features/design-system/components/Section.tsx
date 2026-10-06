import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export function Section({ id, title, description, children }: Readonly<SectionProps>) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-32 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-h2">
          {title}
        </h2>
        {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function Subsection({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-label tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </div>
  )
}
