import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { FormGroup, WithTooltip } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui'
import { useRejectRequest } from '@/features/approvals/hooks/useRejectRequest'
import {
  REASON_MAX_LENGTH,
  rejectSchema,
  type RejectFormData,
} from '@/features/approvals/schemas/rejectSchema'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  employeeName: string
  // Called after a successful rejection, to close the review too.
  onRejected: () => void
  // Called when the request is gone or out of scope, to close the review too.
  onGone: () => void
}

export function RejectDialog({
  open,
  onOpenChange,
  requestId,
  employeeName,
  onRejected,
  onGone,
}: Readonly<RejectDialogProps>) {
  const reject = useRejectRequest(requestId)
  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    mode: 'onChange',
    defaultValues: { reason: '' },
  })
  const { errors, isValid } = form.formState
  const reasonLength = useWatch({ control: form.control, name: 'reason' }).length
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const submitting = useRef(false)

  const handleOpenChange = (next: boolean) => {
    if (reject.isPending) return
    if (!next) form.reset()
    onOpenChange(next)
  }

  const save = (values: RejectFormData) => {
    if (submitting.current) return
    submitting.current = true
    reject.mutate(values.reason, {
      onSuccess: () => {
        form.reset()
        onRejected()
      },
      onError: (error) => {
        const reasonDetail = isApiError(error)
          ? error.details?.find((detail) => detail.field === 'reason')
          : undefined
        if (reasonDetail) {
          form.setError('reason', { message: reasonDetail.message })
          return
        }
        showError(handleApiError(error, 'Could not reject the request'), 'decision-failed')
        onOpenChange(false)
        if (isApiError(error) && error.status === 404) onGone()
      },
      onSettled: () => {
        submitting.current = false
      },
    })
  }

  let blockedReason: string | null = null
  if (!isValid) blockedReason = errors.reason?.message ?? 'Write the reason first.'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form
          noValidate
          onSubmit={(event) => void form.handleSubmit(save)(event)}
          className="contents"
        >
          <DialogHeader>
            <DialogTitle>Reject this request?</DialogTitle>
            <DialogDescription>
              {employeeName} will see your reason in the request history.
            </DialogDescription>
          </DialogHeader>
          <FormGroup
            label="Reason"
            required
            description={`${reasonLength} / ${REASON_MAX_LENGTH}`}
            error={errors.reason?.message}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                {...form.register('reason')}
                rows={4}
                placeholder="For example: the team is short that week"
              />
            )}
          </FormGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={reject.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Keep request
            </Button>
            <WithTooltip content={blockedReason} when={blockedReason !== null && !reject.isPending}>
              <Button
                type="submit"
                variant="destructive"
                disabled={blockedReason !== null || reject.isPending}
              >
                Reject request
              </Button>
            </WithTooltip>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
