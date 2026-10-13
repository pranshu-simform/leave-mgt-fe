import { useRef, useState } from 'react'
import { AppSelect, FormGroup } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useAllocateBalances } from '@/features/admin/hooks/useBalanceMutations'
import { handleApiError } from '@/lib/apiClient'
import { isoYear, todayLocalIso } from '@/lib/dates'
import { showError } from '@/lib/toast'

const THIS_YEAR = isoYear(todayLocalIso())
// The server accepts only this year and next year.
const YEAR_OPTIONS = [THIS_YEAR, THIS_YEAR + 1].map((year) => ({
  value: String(year),
  label: String(year),
}))

interface AllocateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mounted only while the dialog is open, so the year starts at this year every time.
function AllocateForm({ onOpenChange }: Readonly<{ onOpenChange: (open: boolean) => void }>) {
  const allocate = useAllocateBalances()
  const [year, setYear] = useState(String(THIS_YEAR))
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const submitting = useRef(false)

  const confirm = () => {
    if (submitting.current) return
    submitting.current = true
    allocate.mutate(Number(year), {
      onSuccess: () => onOpenChange(false),
      onError: (error) => {
        showError(handleApiError(error, 'Could not allocate the balances'), 'allocate-failed')
        onOpenChange(false)
      },
      onSettled: () => {
        submitting.current = false
      },
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Allocate a year</DialogTitle>
        <DialogDescription>
          Creates the balances that are missing for every active person, from each leave type's
          default allowance. Balances that already exist are not changed, so it is safe to run
          again. Use it for a new year, or after adding a person.
        </DialogDescription>
      </DialogHeader>
      <FormGroup label="Year">
        {(controlProps) => (
          <AppSelect
            {...controlProps}
            options={YEAR_OPTIONS}
            value={year}
            onValueChange={setYear}
            disabled={allocate.isPending}
          />
        )}
      </FormGroup>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={allocate.isPending}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="button" disabled={allocate.isPending} onClick={confirm}>
          {allocate.isPending ? 'Allocating...' : `Allocate ${year}`}
        </Button>
      </DialogFooter>
    </>
  )
}

export function AllocateDialog({ open, onOpenChange }: Readonly<AllocateDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AllocateForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}
