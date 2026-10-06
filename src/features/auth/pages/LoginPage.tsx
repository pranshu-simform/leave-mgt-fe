import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck2Icon, EyeIcon, EyeOffIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { FormGroup, PageLoader, ThemeToggle } from '@/components/shared'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import { TONE_CLASSES } from '@/components/shared'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchema'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { isApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

const FIELDS: readonly (keyof LoginFormData)[] = ['email', 'password']

function isField(name: string): name is keyof LoginFormData {
  return (FIELDS as readonly string[]).includes(name)
}

// One message per kind of failure. Wrong credentials never say which of the two was wrong.
function failureMessage(error: unknown): string {
  if (!isApiError(error)) return 'Something went wrong. Try again.'
  if (error.status === 0) return 'Unable to reach the server. Check your connection and try again.'
  if (error.status === 429) return 'Too many sign-in attempts. Wait a few minutes, then try again.'
  if (error.status === 401) return 'Incorrect email or password.'
  return error.message
}

function returnPath(state: unknown): string {
  const from = (state as { from?: { pathname?: string; search?: string } } | null)?.from
  return from?.pathname ? `${from.pathname}${from.search ?? ''}` : '/'
}

export default function LoginPage() {
  usePageTitle('Sign in')
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const login = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })
  const { errors, isValid } = form.formState

  if (isLoading) return <PageLoader label="Restoring your session" />
  if (user) return <Navigate to={returnPath(location.state)} replace />

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess: () => void navigate(returnPath(location.state), { replace: true }),
      onError: (error) => {
        const details = isApiError(error) ? error.details : undefined
        const fieldDetails = details?.filter((detail) => isField(detail.field))
        if (fieldDetails?.length) {
          for (const detail of fieldDetails) {
            if (isField(detail.field)) form.setError(detail.field, { message: detail.message })
          }
          return
        }
        setFormError(failureMessage(error))
      },
    })
  })

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
            <CardTitle className="text-h3">Sign in</CardTitle>
            <CardDescription>Use your work email and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
              {formError && (
                <Alert role="alert" className={cn(TONE_CLASSES.danger)}>
                  <TriangleAlertIcon aria-hidden="true" />
                  <AlertTitle>Could not sign in</AlertTitle>
                  <AlertDescription className="text-current">{formError}</AlertDescription>
                </Alert>
              )}

              <FormGroup label="Email" error={errors.email?.message}>
                {(controlProps) => (
                  <Input
                    {...controlProps}
                    type="email"
                    autoComplete="username"
                    autoFocus
                    {...form.register('email')}
                  />
                )}
              </FormGroup>

              <FormGroup label="Password" error={errors.password?.message}>
                {(controlProps) => (
                  <div className="relative">
                    <Input
                      {...controlProps}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pr-10"
                      {...form.register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1 -translate-y-1/2"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOffIcon aria-hidden="true" />
                      ) : (
                        <EyeIcon aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                )}
              </FormGroup>

              <Button type="submit" size="lg" disabled={!isValid || login.isPending}>
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
