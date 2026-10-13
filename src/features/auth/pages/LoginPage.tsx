import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { FormGroup, PageLoader, TONE_CLASSES } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle, Button, Input } from '@/components/ui'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
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
    <AuthShell title="Sign in" description="Use your work email and password.">
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
            <PasswordInput
              {...controlProps}
              autoComplete="current-password"
              {...form.register('password')}
            />
          )}
        </FormGroup>

        <Button type="submit" size="lg" disabled={!isValid || login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
