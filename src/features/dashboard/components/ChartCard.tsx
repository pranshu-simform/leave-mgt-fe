import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: Readonly<ChartCardProps>) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-h3">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">{children}</CardContent>
    </Card>
  )
}
