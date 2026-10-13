import { CalendarCheck2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
}

// The signed-out screens (sign in, set password): the brand over one glass card.
export function AuthShell({ title, description, children }: Readonly<AuthShellProps>) {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-gutter py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm animate-fade-rise flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
            <CalendarCheck2Icon aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-h1 text-gradient">Leave &amp; Attendance</h1>
        </div>

        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="text-h3">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  )
}
