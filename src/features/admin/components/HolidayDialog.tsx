import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
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
} from '@/components/ui'
import { useAddHoliday } from '@/features/admin/hooks/useHolidayMutations'
import {
  HOLIDAY_NAME_MAX_LENGTH,
  holidaySchema,
  type HolidayFormData,
} from '@/features/admin/schemas/holidaySchema'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

interface HolidayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Called with the date after a holiday was added, so the list can show its year.
  onAdded: (date: string) => void
}

const FORM_FIELDS = ['date', 'name'] as const
type FormField = (typeof FORM_FIELDS)[number]

function isFormField(field: string): field is FormField {
  return (FORM_FIELDS as readonly string[]).includes(field)
}

const EMPTY_VALUES: HolidayFormData = { date: '', name: '' }

export function HolidayDialog({ open, onOpenChange, onAdded }: Readonly<HolidayDialogProps>) {
  const add = useAddHoliday()
  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
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

  const handleOpenChange = (next: boolean) => {
    if (add.isPending) return
    if (!next && isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(next)
  }

  const save = (values: HolidayFormData) => {
    if (submitting.current) return
    submitting.current = true
    add.mutate(values, {
      onSuccess: (created) => {
        onOpenChange(false)
        onAdded(created.date)
      },
      onError: (error) => {
        if (!isApiError(error)) {
          showError(handleApiError(error, 'Could not add the holiday'), 'holiday-failed')
          return
        }
        // A date that already has a holiday is a problem with the date field.
        if (error.code === 'ALREADY_EXISTS') {
          form.setError('date', { message: error.message })
          return
        }
        const mapped = (error.details ?? []).filter((detail) => isFormField(detail.field))
        if (mapped.length > 0) {
          for (const detail of mapped) {
            form.setError(detail.field as FormField, { message: detail.message })
          }
          return
        }
        showError(error.message, 'holiday-failed')
        onOpenChange(false)
      },
      onSettled: () => {
        submitting.current = false
      },
    })
  }

  const blockedReason = isValid ? null : 'Pick a date and give the holiday a name.'

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form
            noValidate
            onSubmit={(event) => void form.handleSubmit(save)(event)}
            className="contents"
          >
            <DialogHeader>
              <DialogTitle>Add a public holiday</DialogTitle>
              <DialogDescription>
                It stops counting as a working day for new previews and requests.
              </DialogDescription>
            </DialogHeader>
            <FormGroup label="Date" required error={errors.date?.message}>
              {(controlProps) => <Input {...controlProps} {...form.register('date')} type="date" />}
            </FormGroup>
            <FormGroup
              label="Name"
              required
              description={`At most ${HOLIDAY_NAME_MAX_LENGTH} characters.`}
              error={errors.name?.message}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  {...form.register('name')}
                  autoComplete="off"
                  placeholder="Founders' Day"
                />
              )}
            </FormGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={add.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <WithTooltip content={blockedReason} when={blockedReason !== null && !add.isPending}>
                <Button type="submit" disabled={blockedReason !== null || add.isPending}>
                  Add holiday
                </Button>
              </WithTooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this holiday?"
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
