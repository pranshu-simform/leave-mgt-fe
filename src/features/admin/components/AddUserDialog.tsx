import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { AppSelect, ConfirmDialog, FormGroup, WithTooltip } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui'
import { ROLE_LABELS, USER_ROLES } from '@/constants/constant'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { useCreateUser } from '@/features/admin/hooks/useUserMutations'
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  userSchema,
  type UserFormData,
} from '@/features/admin/schemas/userSchema'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FORM_FIELDS = ['name', 'email', 'role', 'managerId'] as const
type FormField = (typeof FORM_FIELDS)[number]

function isFormField(field: string): field is FormField {
  return (FORM_FIELDS as readonly string[]).includes(field)
}

const EMPTY_VALUES: UserFormData = {
  name: '',
  email: '',
  role: USER_ROLES.EMPLOYEE,
  managerId: '',
}

const ROLE_OPTIONS = Object.values(USER_ROLES).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

// Everyone who can approve is a possible manager: active managers and active HR admins. Each role
// is its own request (the list takes one role), and neither loads until the dialog opens.
const MANAGERS = { page: 1, limit: 100, role: USER_ROLES.MANAGER, isActive: true } as const
const HR_ADMINS = { page: 1, limit: 100, role: USER_ROLES.HR_ADMIN, isActive: true } as const

export function AddUserDialog({ open, onOpenChange }: Readonly<AddUserDialogProps>) {
  const create = useCreateUser()
  const managers = useAdminUsers(MANAGERS, open)
  const hrAdmins = useAdminUsers(HR_ADMINS, open)
  const managerOptions = useMemo(
    () => [
      { value: '', label: 'No manager' },
      ...[...(managers.data?.items ?? []), ...(hrAdmins.data?.items ?? [])]
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((person) => ({
          value: person.id,
          label: `${person.name} (${ROLE_LABELS[person.role]})`,
        })),
    ],
    [managers.data, hrAdmins.data],
  )
  const managersFailed = managers.isError || hrAdmins.isError
  const managersLoading = managers.isLoading || hrAdmins.isLoading

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: EMPTY_VALUES,
  })
  const { errors, isValid, isDirty } = form.formState
  const [role, managerId] = useWatch({ control: form.control, name: ['role', 'managerId'] })
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const submitting = useRef(false)

  useEffect(() => {
    if (open) form.reset(EMPTY_VALUES)
  }, [open, form])

  const handleOpenChange = (next: boolean) => {
    if (create.isPending) return
    if (!next && isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(next)
  }

  const save = (values: UserFormData) => {
    if (submitting.current) return
    submitting.current = true
    create.mutate(
      { ...values, managerId: values.managerId || null },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          if (!isApiError(error)) {
            showError(handleApiError(error, 'Could not add the user'), 'user-failed')
            return
          }
          // An email that is taken is a problem with the email field.
          if (error.code === 'ALREADY_EXISTS') {
            form.setError('email', { message: error.message })
            return
          }
          const mapped = (error.details ?? []).filter((detail) => isFormField(detail.field))
          if (mapped.length > 0) {
            for (const detail of mapped) {
              form.setError(detail.field as FormField, { message: detail.message })
            }
            return
          }
          showError(error.message, 'user-failed')
          onOpenChange(false)
        },
        onSettled: () => {
          submitting.current = false
        },
      },
    )
  }

  const blockedReason = isValid ? null : 'Enter a name and a valid email address.'

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <form
            noValidate
            onSubmit={(event) => void form.handleSubmit(save)(event)}
            className="contents"
          >
            <DialogHeader>
              <DialogTitle>Add a user</DialogTitle>
              <DialogDescription>
                They get an email with a link to choose their password. The link works once and for
                24 hours.
              </DialogDescription>
            </DialogHeader>
            <FormGroup label="Name" required error={errors.name?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('name')}
                  maxLength={USER_NAME_MAX_LENGTH}
                  autoComplete="off"
                />
              )}
            </FormGroup>
            <FormGroup label="Email" required error={errors.email?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('email')}
                  type="email"
                  maxLength={USER_EMAIL_MAX_LENGTH}
                  autoComplete="off"
                />
              )}
            </FormGroup>
            <FormGroup label="Role" required error={errors.role?.message}>
              {(controlProps) => (
                <AppSelect
                  {...controlProps}
                  options={ROLE_OPTIONS}
                  value={role}
                  onValueChange={(value) =>
                    form.setValue('role', value as UserFormData['role'], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              )}
            </FormGroup>
            <FormGroup
              label="Manager"
              description={
                managersFailed
                  ? 'The list of managers could not be loaded. You can add a manager later.'
                  : 'Approves their leave. Someone with no manager is approved by HR.'
              }
              error={errors.managerId?.message}
            >
              {(controlProps) => (
                <AppSelect
                  {...controlProps}
                  options={managerOptions}
                  value={managerId}
                  disabled={managersFailed || managersLoading}
                  onValueChange={(value) =>
                    form.setValue('managerId', value, { shouldDirty: true, shouldValidate: true })
                  }
                />
              )}
            </FormGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <WithTooltip
                content={blockedReason}
                when={blockedReason !== null && !create.isPending}
              >
                <Button type="submit" disabled={blockedReason !== null || create.isPending}>
                  {create.isPending ? 'Adding…' : 'Add user'}
                </Button>
              </WithTooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this user?"
        description="What you entered is not saved yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
