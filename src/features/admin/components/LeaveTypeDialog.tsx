import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { ConfirmDialog, FormGroup, WithTooltip } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
} from '@/components/ui'
import { useCreateLeaveType, useUpdateLeaveType } from '@/features/admin/hooks/useSaveLeaveType'
import { leaveTypeSchema, type LeaveTypeFormData } from '@/features/admin/schemas/leaveTypeSchema'
import type { AdminLeaveType } from '@/features/admin/types/adminTypes'
import { formatDays } from '@/features/admin/utils/formatDays'
import { toNumber, toNumberOrNull } from '@/features/admin/utils/formNumbers'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

interface LeaveTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The type being edited, or null to create one.
  leaveType: AdminLeaveType | null
}

const FORM_FIELDS = [
  'code',
  'name',
  'defaultAllowanceDays',
  'minNoticeDays',
  'maxConsecutiveDays',
] as const
type FormField = (typeof FORM_FIELDS)[number]

function isFormField(field: string): field is FormField {
  return (FORM_FIELDS as readonly string[]).includes(field)
}

const EMPTY_VALUES: Partial<LeaveTypeFormData> = {
  code: '',
  name: '',
  drawsFromBalance: true,
  minNoticeDays: 0,
  maxConsecutiveDays: null,
  allowRetroactive: false,
  requiresNote: false,
  requiresApproval: true,
  isActive: true,
}

interface RuleSwitchProps {
  form: UseFormReturn<LeaveTypeFormData>
  name: 'allowRetroactive' | 'requiresNote' | 'requiresApproval' | 'isActive'
  label: string
  description: string
}

// A yes or no rule: the label and what it means on the left, the switch on the right.
function RuleSwitch({ form, name, label, description }: Readonly<RuleSwitchProps>) {
  const id = `leave-type-${name}`
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p id={`${id}-description`} className="text-caption text-muted-foreground">
          {description}
        </p>
      </div>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Switch
            id={id}
            aria-describedby={`${id}-description`}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </div>
  )
}

export function LeaveTypeDialog({ open, onOpenChange, leaveType }: Readonly<LeaveTypeDialogProps>) {
  const editing = leaveType !== null
  const create = useCreateLeaveType()
  const update = useUpdateLeaveType(leaveType?.id ?? '')
  const isPending = create.isPending || update.isPending

  const defaultValues = useMemo<Partial<LeaveTypeFormData>>(
    () => (leaveType ? { ...leaveType } : EMPTY_VALUES),
    [leaveType],
  )
  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    mode: 'onChange',
    defaultValues,
  })
  const { errors, isValid, isDirty } = form.formState
  const drawsFromBalance = useWatch({ control: form.control, name: 'drawsFromBalance' })
  const allowance = useWatch({ control: form.control, name: 'defaultAllowanceDays' })

  // A fresh form every time the dialog opens, for the type it opens on.
  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, defaultValues, form])

  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pendingDeactivate, setPendingDeactivate] = useState<LeaveTypeFormData | null>(null)
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const submitting = useRef(false)

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next && isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(next)
  }

  const showServerError = (error: unknown) => {
    if (!isApiError(error)) {
      showError(handleApiError(error, 'Could not save the leave type'), 'leave-type-failed')
      return
    }
    if (error.code === 'ALREADY_EXISTS') {
      form.setError('code', { message: error.message })
      return
    }
    const mapped = (error.details ?? []).filter((detail) => isFormField(detail.field))
    if (mapped.length > 0) {
      for (const detail of mapped) {
        form.setError(detail.field as FormField, { message: detail.message })
      }
      return
    }
    showError(error.message, 'leave-type-failed')
    if (error.status === 404) onOpenChange(false)
  }

  const commit = (values: LeaveTypeFormData) => {
    if (submitting.current) return
    submitting.current = true
    const callbacks = {
      onSuccess: () => {
        setPendingDeactivate(null)
        onOpenChange(false)
      },
      onError: (error: unknown) => {
        setPendingDeactivate(null)
        showServerError(error)
      },
      onSettled: () => {
        submitting.current = false
      },
    }
    if (leaveType) {
      update.mutate(
        {
          name: values.name,
          defaultAllowanceDays: values.defaultAllowanceDays,
          minNoticeDays: values.minNoticeDays,
          maxConsecutiveDays: values.maxConsecutiveDays,
          allowRetroactive: values.allowRetroactive,
          requiresNote: values.requiresNote,
          requiresApproval: values.requiresApproval,
          isActive: values.isActive,
        },
        callbacks,
      )
    } else {
      create.mutate(
        {
          code: values.code,
          name: values.name,
          drawsFromBalance: values.drawsFromBalance,
          defaultAllowanceDays: values.defaultAllowanceDays,
          minNoticeDays: values.minNoticeDays,
          maxConsecutiveDays: values.maxConsecutiveDays,
          allowRetroactive: values.allowRetroactive,
          requiresNote: values.requiresNote,
          requiresApproval: values.requiresApproval,
        },
        callbacks,
      )
    }
  }

  const save = (values: LeaveTypeFormData) => {
    // Turning an active type off is the one change that asks first.
    if (leaveType?.isActive && !values.isActive) {
      setPendingDeactivate(values)
      return
    }
    commit(values)
  }

  let blockedReason: string | null = null
  if (!isValid) blockedReason = 'Fill in the highlighted fields first.'
  else if (editing && !isDirty) blockedReason = 'Change something to save.'

  const allowanceNumber = typeof allowance === 'number' && !Number.isNaN(allowance) ? allowance : 0
  let allowanceHint = 'Days each person gets per year.'
  if (!drawsFromBalance) allowanceHint = 'This type has no balance, so there is no allowance.'
  else if (!editing && allowanceNumber > 0) {
    allowanceHint = `Every active employee gets this year's balance of ${formatDays(allowanceNumber)}.`
  } else if (editing) {
    allowanceHint = 'Applies to balances created from now on. Existing balances are not changed.'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <form
            noValidate
            onSubmit={(event) => void form.handleSubmit(save)(event)}
            className="contents"
          >
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${leaveType.name}` : 'New leave type'}</DialogTitle>
              <DialogDescription>
                Rules apply to new requests and edits. Requests already made are not changed.
              </DialogDescription>
            </DialogHeader>

            {editing ? (
              <dl className="grid gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Code</dt>
                  <dd className="font-medium">{leaveType.code}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Draws from a balance</dt>
                  <dd className="font-medium">{leaveType.drawsFromBalance ? 'Yes' : 'No'}</dd>
                </div>
                <p className="pt-1 text-caption text-muted-foreground">
                  Fixed after creation, because existing balances and refunds depend on them.
                </p>
              </dl>
            ) : (
              <>
                <FormGroup
                  label="Code"
                  required
                  description="Capital letters, digits or underscores. It cannot be changed later."
                  error={errors.code?.message}
                >
                  {(controlProps) => (
                    <Input
                      {...controlProps}
                      {...form.register('code')}
                      autoComplete="off"
                      placeholder="STUDY"
                    />
                  )}
                </FormGroup>
              </>
            )}

            <FormGroup label="Name" required error={errors.name?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('name')}
                  autoComplete="off"
                  placeholder="Study leave"
                />
              )}
            </FormGroup>

            {!editing && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Label htmlFor="leave-type-draws">Draws from a balance</Label>
                  <p
                    id="leave-type-draws-description"
                    className="text-caption text-muted-foreground"
                  >
                    On means each approved day is taken from the person's yearly balance.
                  </p>
                </div>
                <Controller
                  control={form.control}
                  name="drawsFromBalance"
                  render={({ field }) => (
                    <Switch
                      id="leave-type-draws"
                      aria-describedby="leave-type-draws-description"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (!checked) {
                          form.setValue('defaultAllowanceDays', 0, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      }}
                    />
                  )}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormGroup
                label="Allowance (days a year)"
                required
                description={allowanceHint}
                error={errors.defaultAllowanceDays?.message}
              >
                {(controlProps) => (
                  <Input
                    {...controlProps}
                    {...form.register('defaultAllowanceDays', { setValueAs: toNumber })}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    readOnly={!drawsFromBalance}
                    className={drawsFromBalance ? undefined : 'opacity-60'}
                  />
                )}
              </FormGroup>
              <FormGroup
                label="Notice (days)"
                required
                description="How far ahead a request must start."
                error={errors.minNoticeDays?.message}
              >
                {(controlProps) => (
                  <Input
                    {...controlProps}
                    {...form.register('minNoticeDays', { setValueAs: toNumber })}
                    type="number"
                    inputMode="numeric"
                    min={0}
                  />
                )}
              </FormGroup>
            </div>
            <FormGroup
              label="Longest request (days)"
              description="Working days in one request. Leave empty for no limit."
              error={errors.maxConsecutiveDays?.message}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('maxConsecutiveDays', { setValueAs: toNumberOrNull })}
                  type="number"
                  inputMode="numeric"
                  min={1}
                />
              )}
            </FormGroup>

            <RuleSwitch
              form={form}
              name="allowRetroactive"
              label="Allow past dates"
              description="People can request days that have already started."
            />
            <RuleSwitch
              form={form}
              name="requiresNote"
              label="Note required"
              description="A request needs a note for the approver."
            />
            <RuleSwitch
              form={form}
              name="requiresApproval"
              label="Needs approval"
              description="Off means a request is approved the moment it is submitted."
            />
            {editing && (
              <RuleSwitch
                form={form}
                name="isActive"
                label="Active"
                description="Off hides it from new requests. Existing requests keep working."
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <WithTooltip content={blockedReason} when={blockedReason !== null && !isPending}>
                <Button type="submit" disabled={blockedReason !== null || isPending}>
                  {editing ? 'Save changes' : 'Create leave type'}
                </Button>
              </WithTooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard your changes?"
        description="What you entered is not saved yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false)
          onOpenChange(false)
        }}
      />
      <ConfirmDialog
        open={pendingDeactivate !== null}
        onOpenChange={(next) => {
          if (!next && !isPending) setPendingDeactivate(null)
        }}
        title={`Deactivate ${leaveType?.name ?? 'this type'}?`}
        description="People can no longer pick it for new requests. Existing requests keep working."
        confirmLabel="Deactivate"
        destructive
        isPending={isPending}
        onConfirm={() => pendingDeactivate && commit(pendingDeactivate)}
      />
    </>
  )
}
