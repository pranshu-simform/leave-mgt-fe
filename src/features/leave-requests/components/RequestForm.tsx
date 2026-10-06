import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useBlocker } from 'react-router'
import {
  AppSelect,
  ConfirmDialog,
  DateRangePicker,
  ErrorState,
  FormGroup,
  WithTooltip,
} from '@/components/shared'
import { Button, Input, Textarea } from '@/components/ui'
import { PreviewPanel } from '@/features/leave-requests/components/PreviewPanel'
import { usePreviewRequest } from '@/features/leave-requests/hooks/usePreviewRequest'
import {
  NOTE_MAX_LENGTH,
  leaveRequestSchema,
  type LeaveRequestFormData,
} from '@/features/leave-requests/schemas/leaveRequestSchema'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { useLeaveTypes } from '@/features/leave-types/hooks/useLeaveTypes'
import { useDebounce } from '@/hooks/useDebounce'
import { isApiError, type ApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

interface RequestFormProps {
  mode: 'create' | 'edit'
  defaultValues: LeaveRequestFormData
  // Edit: the type of a request cannot change, so it is shown and not chosen.
  lockedTypeName?: string
  // Resolves with the saved request, or rejects with the ApiError.
  onSubmit: (values: LeaveRequestFormData) => Promise<LeaveRequest>
  onDone: (request: LeaveRequest) => void
  // Return true when the page handled the error itself (an edit conflict).
  onSubmitError?: (error: ApiError) => boolean
  cancelTo: string
  // Shown above the form, for example the "changed elsewhere" alert.
  notice?: ReactNode
}

const FORM_FIELDS = ['leaveTypeId', 'startDate', 'endDate', 'note'] as const
type FormField = (typeof FORM_FIELDS)[number]

function isFormField(field: string): field is FormField {
  return (FORM_FIELDS as readonly string[]).includes(field)
}

export function RequestForm({
  mode,
  defaultValues,
  lockedTypeName,
  onSubmit,
  onDone,
  onSubmitError,
  cancelTo,
  notice,
}: Readonly<RequestFormProps>) {
  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    mode: 'onChange',
    defaultValues,
  })
  const { errors, isValid, isDirty, isSubmitting } = form.formState
  const { data: leaveTypes, isError: typesFailed, refetch: refetchTypes } = useLeaveTypes()

  const [leaveTypeId, startDate, endDate, note] = useWatch({
    control: form.control,
    name: ['leaveTypeId', 'startDate', 'endDate', 'note'],
  })
  const current = useMemo(
    () => ({ leaveTypeId, startDate, endDate, note: note.trim() || undefined }),
    [leaveTypeId, startDate, endDate, note],
  )
  const debounced = useDebounce(current)
  const preview = usePreviewRequest(debounced)

  const waitingForDebounce =
    debounced.leaveTypeId !== current.leaveTypeId ||
    debounced.startDate !== current.startDate ||
    debounced.endDate !== current.endDate ||
    debounced.note !== current.note
  const isChecking = waitingForDebounce || preview.isFetching
  // A 400 from the preview (for example an unknown leave type) names its field like any other.
  const previewProblems =
    isApiError(preview.error) && preview.error.status === 400 ? (preview.error.details ?? []) : []
  const problems = [...(preview.data?.violations ?? []), ...previewProblems]
  const checkFailed = preview.isError && previewProblems.length === 0

  const problemFor = (...fields: string[]) =>
    problems.find((p) => fields.includes(p.field))?.message
  const selectedType = leaveTypes?.find((type) => type.id === leaveTypeId)

  // The submit button explains itself when it cannot be used.
  let blockedReason: string | null = null
  if (!isValid) {
    blockedReason = Object.values(errors)[0]?.message ?? 'Choose a leave type and your dates first.'
  } else if (problems[0]) blockedReason = problems[0].message
  else if (checkFailed) blockedReason = 'The dates could not be checked yet. Try the check again.'
  else if (isChecking) blockedReason = 'Checking your request...'
  else if (mode === 'edit' && !isDirty) blockedReason = 'Change the dates or the note to save.'

  // Takes the lock before any re-render, so a fast second click cannot send a second request.
  const submitting = useRef(false)
  const [saved, setSaved] = useState<LeaveRequest | null>(null)

  const applyServerError = (error: ApiError) => {
    const mapped = (error.details ?? []).filter((detail) => isFormField(detail.field))
    if (error.code === 'OVERLAPPING_REQUEST') {
      form.setError('endDate', { message: error.message })
    } else if (mapped.length > 0) {
      for (const detail of mapped) {
        form.setError(detail.field as FormField, { message: detail.message })
      }
    } else {
      showError(error.message)
    }
  }

  const save = async (values: LeaveRequestFormData) => {
    if (submitting.current) return
    submitting.current = true
    try {
      const request = await onSubmit(values)
      setSaved(request)
    } catch (error) {
      if (!isApiError(error)) showError('Could not save the request. Try again.')
      else if (!onSubmitError?.(error)) applyServerError(error)
    } finally {
      submitting.current = false
    }
  }

  // Leaving a form with unsaved changes asks first. A saved form leaves without asking.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !saved && currentLocation.pathname !== nextLocation.pathname,
  )
  // Leave only after the saved state has rendered, so the blocker above lets the navigation through.
  useEffect(() => {
    if (saved) onDone(saved)
  }, [saved, onDone])

  const typeOptions = (leaveTypes ?? []).map((type) => ({ value: type.id, label: type.name }))
  const noteLength = note.length

  if (typesFailed) {
    return (
      <ErrorState
        message="We could not load the leave types."
        onRetry={() => void refetchTypes()}
      />
    )
  }

  return (
    <>
      {notice}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form
          noValidate
          onSubmit={(event) => void form.handleSubmit(save)(event)}
          className="flex flex-col gap-5"
        >
          {mode === 'edit' ? (
            <FormGroup
              label="Leave type"
              description="The type cannot be changed. Cancel this request and submit a new one to switch."
            >
              {(controlProps) => (
                <Input {...controlProps} value={lockedTypeName ?? ''} readOnly disabled />
              )}
            </FormGroup>
          ) : (
            <FormGroup
              label="Leave type"
              required
              error={errors.leaveTypeId?.message ?? problemFor('leaveTypeId')}
            >
              {(controlProps) => (
                <Controller
                  name="leaveTypeId"
                  control={form.control}
                  render={({ field }) => (
                    <AppSelect
                      {...controlProps}
                      options={typeOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={leaveTypes ? 'Choose a type' : 'Loading...'}
                      disabled={!leaveTypes}
                    />
                  )}
                />
              )}
            </FormGroup>
          )}
          <FormGroup
            label="Dates"
            required
            error={
              errors.startDate?.message ??
              errors.endDate?.message ??
              problemFor('startDate', 'endDate')
            }
          >
            {(controlProps) => (
              <DateRangePicker
                {...controlProps}
                value={{ start: startDate, end: endDate }}
                onChange={({ start, end }) => {
                  const options = { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                  form.setValue('startDate', start, options)
                  form.setValue('endDate', end, options)
                }}
              />
            )}
          </FormGroup>
          <FormGroup
            label="Note"
            required={selectedType?.requiresNote}
            description={`${noteLength} / ${NOTE_MAX_LENGTH}. Your manager sees this.`}
            error={errors.note?.message ?? problemFor('note')}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                {...form.register('note')}
                rows={4}
                placeholder="Optional context for your manager"
              />
            )}
          </FormGroup>
          <div className="flex flex-wrap items-center gap-3">
            <WithTooltip content={blockedReason} when={blockedReason !== null && !isSubmitting}>
              <Button type="submit" disabled={blockedReason !== null || isSubmitting}>
                {mode === 'edit' ? 'Save changes' : 'Submit request'}
              </Button>
            </WithTooltip>
            <Button variant="ghost" render={<Link to={cancelTo} />} nativeButton={false}>
              Cancel
            </Button>
          </div>
        </form>
        <aside aria-label="Preview of this request" className="lg:sticky lg:top-4">
          <PreviewPanel
            preview={preview.data}
            isChecking={isChecking}
            failed={checkFailed}
            onRetry={() => void preview.refetch()}
          />
        </aside>
      </div>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') blocker.reset()
        }}
        title="Discard this request?"
        description="You have changes that are not saved. If you leave now they are lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
      />
    </>
  )
}
