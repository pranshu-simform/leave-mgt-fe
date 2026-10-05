import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'

interface WithTooltipProps {
  content: ReactNode
  // Wrap only when there is something to explain, usually "this action is disabled because...".
  when?: boolean
  children: ReactNode
}

// A disabled button fires no pointer or focus events, so the tooltip hangs on a focusable wrapper.
export function WithTooltip({ content, when = true, children }: Readonly<WithTooltipProps>) {
  if (!when) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" tabIndex={0} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  )
}
