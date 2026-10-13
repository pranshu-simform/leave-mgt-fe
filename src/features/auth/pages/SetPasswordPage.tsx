import { zodResolver } from '@hookform/resolvers/zod'
import { LinkIcon, TriangleAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErrorState, FormGroup, PageLoader, TONE_CLASSES } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle, Button } from '@/components/ui'
import { LOGIN_PATH } from '@/constants/pathRoutes'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { useSetPassword, useSetPasswordLink } from '@/features/auth/hooks/useSetPassword'
import {
  PASSWORD_MIN_LENGTH,
  setPasswordSchema,
  type SetPasswordFormData,
} from '@/features/auth/schemas/setPasswordSchema'
import { usePageTitle } from '@/hooks/usePageTitle'
import { isApiError } from '@/lib/apiClient'
import { showSuccess } from '@/lib/toast'
import { cn } from '@/lib/utils'

const TOKEN_PARAM = 'token'
const FIELDS: readonly (keyof SetPasswordFormData)[] = ['password', 'confirmPassword']

function isField(name: string): name is keyof SetPasswordFormData {
  return (FIELDS as readonly string[]).includes(name)
}

// One message per kind of failure, in words a person who never saw the server can act on.
function failureMessage(error: unknown): string {
  if (!isApiError(error)) return 'Something went wrong. Try again.'
  if (error.status === 0) return 'Unable to reach the server. Check your connection and try again.'
  if (error.status === 429) return 'Too many attempts. Wait a few minutes, then try again.'
  return error.message
}

function isDeadLink(error: unknown): boolean {
  return isApiError(error) && error.code === 'INVALID_LINK'
}

function DeadLink() {
  return (
    <div className="flex flex-col gap-4">
      <Alert role="alert" className={cn(TONE_CLASSES.warning)}>
        <LinkIcon aria-hidden="true" />
        <AlertTitle>This link no longer works</AlertTitle>
        <AlertDescription className="text-current">
          It has expired (links work for 24 hours), it was already used, or it is not the latest
          link you were sent. Ask HR to send you a new one.
        </AlertDescription>
      </Alert>
      <Button variant="outline" render={<Link to={LOGIN_PATH} />} nativeButton={false}>
        Go to sign in
      </Button>
    </div>
  )
}

interface PasswordFormProps {
  token: string
  name: string
  email: string
  onDeadLink: () => void
}

function PasswordForm({ token, name, email, onDeadLink }: Readonly<PasswordFormProps>) {
  const navigate = useNavigate()
  const setPassword = useSetPassword()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  })
  const { errors, isValid } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    setPassword.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          showSuccess('Password set. Sign in with your new password.', 'password-set')
          void navigate(LOGIN_PATH, { replace: true })
        },
        onError: (error) => {
          if (isDeadLink(error)) {
            onDeadLink()
            return
          }
          const fieldDetails = (isApiError(error) ? error.details : undefined)?.filter((detail) =>
            isField(detail.field),
          )
          if (fieldDetails?.length) {
            for (const detail of fieldDetails) {
              if (isField(detail.field)) form.setError(detail.field, { message: detail.message })
            }
            return
          }
          setFormError(failureMessage(error))
        },
      },
    )
  })

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* The account name for a password manager, so it saves the password under the right login. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <p className="text-body-sm text-muted-foreground">
        For <span className="font-medium text-foreground">{name}</span>
        <span className="block break-all">{email}</span>
      </p>

      {formError && (
        <Alert role="alert" className={cn(TONE_CLASSES.danger)}>
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>Could not set the password</AlertTitle>
          <AlertDescription className="text-current">{formError}</AlertDescription>
        </Alert>
      )}

      <FormGroup
        label="New password"
        required
        description={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        error={errors.password?.message}
      >
        {(controlProps) => (
          <PasswordInput
            {...controlProps}
            autoComplete="new-password"
            autoFocus
            {...form.register('password', {
              // The confirmation depends on this field, so it is checked again when this one changes.
              onChange: () => {
                if (form.getFieldState('confirmPassword').isTouched) {
                  void form.trigger('confirmPassword')
                }
              },
            })}
          />
        )}
      </FormGroup>

      <FormGroup label="Confirm password" required error={errors.confirmPassword?.message}>
        {(controlProps) => (
          <PasswordInput
            {...controlProps}
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
        )}
      </FormGroup>

      <Button type="submit" size="lg" disabled={!isValid || setPassword.isPending}>
        {setPassword.isPending ? 'Saving…' : 'Set password'}
      </Button>
    </form>
  )
}

export default function SetPasswordPage() {
  usePageTitle('Set your password')
  const location = useLocation()
  const navigate = useNavigate()
  // Read once, then removed from the address bar so it is not in the history, a screenshot or a
  // copied URL. It stays in this component for the check and for the save.
  const [token] = useState(() => new URLSearchParams(location.search).get(TOKEN_PARAM))
  useEffect(() => {
    if (location.search) void navigate(location.pathname, { replace: true })
  }, [location.search, location.pathname, navigate])

  const link = useSetPasswordLink(token)
  const [linkDied, setLinkDied] = useState(false)

  let body
  if (!token || linkDied || (link.isError && isDeadLink(link.error))) {
    body = <DeadLink />
  } else if (link.isError) {
    body = (
      <ErrorState
        title="Could not check the link"
        message={failureMessage(link.error)}
        onRetry={() => void link.refetch()}
      />
    )
  } else if (link.isLoading || !link.data) {
    body = <PageLoader label="Checking your link" />
  } else {
    body = (
      <PasswordForm
        token={token}
        name={link.data.name}
        email={link.data.email}
        onDeadLink={() => setLinkDied(true)}
      />
    )
  }

  return (
    <AuthShell title="Set your password" description="Choose a password to finish your account.">
      {body}
    </AuthShell>
  )
}
