import { useTheme } from '@/hooks/useTheme'
import { useMemo } from 'react'
import { Badge } from '@/components/ui'
import { contrastRatio, tokenValue } from '@/features/design-system/lib/contrast'
import { cn } from '@/lib/utils'

interface SwatchProps {
  token: string
  // Text token drawn on the swatch, with its measured contrast.
  text?: string
  // Layers under the swatch, bottom first (the page background is always the base).
  under?: string[]
  className?: string
}

export function Swatch({ token, text, under = [], className }: Readonly<SwatchProps>) {
  const { resolvedTheme } = useTheme()
  // Re-measure when the theme changes.
  const measured = useMemo(() => {
    if (!resolvedTheme) return null
    return {
      value: tokenValue(token),
      ratio: text ? contrastRatio(text, [...under, token]) : null,
    }
  }, [resolvedTheme, token, text, under])

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className="flex h-16 items-end justify-between rounded-lg border border-border p-2"
        style={{ backgroundColor: `var(--${token})`, color: text ? `var(--${text})` : undefined }}
      >
        {text && <span className="text-label font-semibold">Aa</span>}
        {measured?.ratio != null && (
          <Badge variant="outline" className="border-current bg-transparent text-current">
            {measured.ratio.toFixed(1)}:1
          </Badge>
        )}
      </div>
      <p className="text-caption font-medium">--{token}</p>
      <p className="truncate text-caption text-muted-foreground" title={measured?.value}>
        {measured?.value}
      </p>
    </div>
  )
}
