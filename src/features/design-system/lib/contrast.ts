// Live WCAG contrast for the style guide. A 1x1 canvas flattens translucent layers (glass over the
// page background) into one sRGB pixel, so the ratio is what the eye sees in the current theme.

let context: CanvasRenderingContext2D | null = null

function getContext(): CanvasRenderingContext2D {
  if (!context) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    context = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!context) throw new Error('Canvas is not available')
  return context
}

export function tokenValue(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
}

function flatten(layers: string[]): [number, number, number] {
  const ctx = getContext()
  ctx.clearRect(0, 0, 1, 1)
  for (const layer of layers) {
    ctx.fillStyle = layer
    ctx.fillRect(0, 0, 1, 1)
  }
  const { data } = ctx.getImageData(0, 0, 1, 1)
  return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]
}

function luminance([r, g, b]: [number, number, number]): number {
  const linear = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

// Ratio of a foreground token over a stack of background tokens, bottom first. The page background
// is always the base layer.
export function contrastRatio(foreground: string, backgrounds: string[]): number {
  const base = [tokenValue('background'), ...backgrounds.map(tokenValue)]
  const bg = luminance(flatten(base))
  const fg = luminance(flatten([...base, tokenValue(foreground)]))
  const [lighter, darker] = bg > fg ? [bg, fg] : [fg, bg]
  return (lighter + 0.05) / (darker + 0.05)
}
