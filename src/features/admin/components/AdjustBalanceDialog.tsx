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
  Textarea,
} from '@/components/ui'
import { useAdjustBalance } from '@/features/admin/hooks/useBalanceMutations'
import {
  ADJUST_NOTE_MAX_LENGTH,
  buildAdjustBalanceSchema,
  type AdjustBalanceFormData,
} from '@/features/admin/schemas/adjustBalanceSchema'
import type { AdminUser } from '@/features/admin/types/adminTypes'
import { formatDays } from '@/features/admin/utils/formatDays'
import { toNumber } from '@/features/admin/utils/formNumbers'
import type { Balance } from '@/features/balances/types/balanceTypes'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

const ACTION_OPTIONS = [
  { value: 'add', label: 'Add days' },
  { value: 'remove', label: 'Remove days' },
]

const EMPTY_VALUES: Partial<AdjustBalanceFormData> = { action: 'add', note: '' }

interface AdjustBalanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser
  // The live balance row, so the numbers stay current if it changes while the dialog is open.
  balance: Balance
}

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  user,
  balance,
}: Readonly<AdjustBalanceDialogProps>) {
  const adjust = useAdjustBalance()
  // Days that can still be taken away: what is left, since `used` can never go above the allowance.
  const removable = balance.allowance - balance.used
  const schema = useMemo(() => buildAdjustBalanceSchema(removable), [removable])
  const form = useForm<AdjustBalanceFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: EMPTY_VALUES,
  })
  const { errors, isValid, isDirty } = form.formState
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const submitting = useRef(false)

  useEffect(() => {
    if (open) form.reset(EMPTY_VALUES)
  }, [open, form])

  // The balance moved while the form was open: check the days against the new numbers.
  useEffect(() => {
    if (open && form.getFieldState('days').isTouched) void form.trigger('days')
  }, [open, removable, form])

  const [action, days] = useWatch({ control: form.control, name: ['action', 'days'] })
  const validDays = Number.isInteger(days) && days >= 1
  // The result line is shown only for a change the form accepts, never a negative balance.
  const showResult = validDays && (action === 'add' || days <= removable)
  const delta = validDays ? (action === 'add' ? days : -days) : 0

  const handleOpenChange = (next: boolean) => {
    if (adjust.isPending) return
    if (!next && isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(next)
  }

  const save = (values: AdjustBalanceFormData) => {
    if (submitting.current) return
    submitting.current = true
    adjust.mutate(
      {
        userId: user.id,
        leaveTypeId: balance.leaveTypeId,
        year: balance.year,
        delta: values.action === 'add' ? values.days : -values.days,
        note: values.note,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          if (!isApiError(error)) {
            showError(handleApiError(error, 'Could not adjust the balance'), 'adjust-failed')
            return
          }
          // The balance moved since the form was checked: show the server's reason under Days.
          if (error.code === 'INSUFFICIENT_BALANCE') {
            form.setError('days', { message: error.message })
            return
          }
          if (error.code === 'VERSION_CONFLICT') {
            showError('The balance just changed. Check the numbers and try again.', 'adjust-failed')
            return
          }
          showError(error.message, 'adjust-failed')
          onOpenChange(false)
        },
        onSettled: () => {
          submitting.current = false
        },
      },
    )
  }

  const blockedReason = isValid ? null : 'Enter the number of days and say why.'
  const submitLabel = validDays
    ? `${action === 'add' ? 'Add' : 'Remove'} ${formatDays(days)}`
    : 'Adjust balance'

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
              <DialogTitle>
                Adjust {balance.name} {balance.year}
              </DialogTitle>
              <DialogDescription>
                {user.name} has {formatDays(balance.allowance)} allowed, {balance.used} used and{' '}
                {formatDays(balance.remaining)} left. The change is written to the ledger with your
                name and the note.
              </DialogDescription>
            </DialogHeader>
            <FormGroup label="Change">
              {(controlProps) => (
                <AppSelect
                  {...controlProps}
                  options={ACTION_OPTIONS}
                  value={action}
                  onValueChange={(value) => {
                    form.setValue('action', value === 'remove' ? 'remove' : 'add', {
                      shouldDirty: true,
                    })
                    // The days rule depends on the action, so its message follows the switch.
                    if (form.getValues('days') !== undefined) void form.trigger('days')
                  }}
                />
              )}
            </FormGroup>
            <FormGroup label="Days" required error={errors.days?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('days', { setValueAs: toNumber })}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  autoComplete="off"
                />
              )}
            </FormGroup>
            <p aria-live="polite" className="text-body-sm text-muted-foreground tabular-nums">
              {showResult
                ? `Allowance ${balance.allowance} to ${balance.allowance + delta}, left ${balance.remaining} to ${balance.remaining + delta}`
                : `Allowance ${balance.allowance}, left ${balance.remaining}`}
            </p>
            <FormGroup
              label="Note"
              required
              description={`Why the balance changes, at most ${ADJUST_NOTE_MAX_LENGTH} characters. It is kept with the ledger entry.`}
              error={errors.note?.message}
            >
              {(controlProps) => (
                <Textarea
                  {...controlProps}
                  {...form.register('note')}
                  rows={3}
                  placeholder="Carry-over agreed with finance"
                />
              )}
            </FormGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={adjust.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <WithTooltip
                content={blockedReason}
                when={blockedReason !== null && !adjust.isPending}
              >
                <Button type="submit" disabled={blockedReason !== null || adjust.isPending}>
                  {adjust.isPending ? 'Saving...' : submitLabel}
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
    </>
  )
}
