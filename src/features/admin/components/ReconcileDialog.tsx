import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react'
import { useState } from 'react'
import { AppSelect, FormGroup, TONE_CLASSES } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useReconcile } from '@/features/admin/hooks/useReconcile'
import type { BalanceDrift } from '@/features/admin/types/adminTypes'
import { handleApiError } from '@/lib/apiClient'
import { isoYear, todayLocalIso } from '@/lib/dates'
import { cn } from '@/lib/utils'

const THIS_YEAR = isoYear(todayLocalIso())
const YEAR_OPTIONS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1].map((year) => ({
  value: String(year),
  label: String(year),
}))

interface ReconcileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// A stored number next to the one the ledger adds up to. A mismatch is written out, not only colored.
function Figure({
  label,
  stored,
  expected,
}: Readonly<{ label: string; stored: number; expected: number }>) {
  const matches = stored === expected
  return (
    <div className="flex flex-wrap gap-x-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">
        {matches ? (
          stored
        ) : (
          <span className="font-medium text-danger-subtle-foreground">
            {stored}, the ledger says {expected}
          </span>
        )}
      </dd>
    </div>
  )
}

function DriftRow({ drift }: Readonly<{ drift: BalanceDrift }>) {
  return (
    <li className="py-3">
      <p className="font-medium">
        {drift.user.name}, {drift.leaveType.name}
      </p>
      <dl className="mt-1 flex flex-col gap-0.5 text-caption">
        <Figure label="Allowance" stored={drift.allowance} expected={drift.expectedAllowance} />
        <Figure label="Used" stored={drift.used} expected={drift.expectedUsed} />
      </dl>
    </li>
  )
}

// Mounted only while the dialog is open, so the result is dropped when it closes.
function ReconcileContent() {
  const [year, setYear] = useState(THIS_YEAR)
  const { data, isFetching, isError, error, refetch } = useReconcile(year)

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-40">
          <FormGroup label="Year">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={YEAR_OPTIONS}
                value={String(year)}
                onValueChange={(value) => setYear(Number(value))}
                disabled={isFetching}
              />
            )}
          </FormGroup>
        </div>
        <Button disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? 'Checking...' : 'Run check'}
        </Button>
      </div>
      <div aria-live="polite" className="flex flex-col gap-3">
        {isFetching && <p className="text-body-sm text-muted-foreground">Checking {year}...</p>}
        {!isFetching && isError && (
          <div className={cn('flex items-start gap-2 rounded-lg border p-3', TONE_CLASSES.danger)}>
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="text-body-sm">{handleApiError(error, 'The check could not run.')}</p>
          </div>
        )}
        {!isFetching && !isError && !data && (
          <p className="text-body-sm text-muted-foreground">
            Run the check to compare every {year} balance with its ledger. It only reads; nothing is
            changed.
          </p>
        )}
        {!isFetching && data && data.driftCount === 0 && (
          <div className={cn('flex items-start gap-2 rounded-lg border p-3', TONE_CLASSES.success)}>
            <CircleCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="text-body-sm">
              {data.checked === 0
                ? `There are no balances for ${data.year} yet.`
                : `All ${data.checked} ${data.checked === 1 ? 'balance' : 'balances'} for ${data.year} match the ledger.`}
            </p>
          </div>
        )}
        {!isFetching && data && data.driftCount > 0 && (
          <>
            <div
              className={cn('flex items-start gap-2 rounded-lg border p-3', TONE_CLASSES.danger)}
            >
              <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-1 text-body-sm">
                <p className="font-medium">
                  {data.driftCount} of {data.checked} balances for {data.year} do not match the
                  ledger.
                  {data.driftCount > data.drifts.length &&
                    ` Showing the first ${data.drifts.length}.`}
                </p>
                <p>
                  Someone changed a balance outside the app. Correct it with an adjustment so the
                  change is recorded.
                </p>
              </div>
            </div>
            <ul aria-label="Balances that do not match" className="divide-y divide-border">
              {data.drifts.map((drift) => (
                <DriftRow key={drift.balanceId} drift={drift} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}

export function ReconcileDialog({ open, onOpenChange }: Readonly<ReconcileDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Check balances</DialogTitle>
          <DialogDescription>
            Every balance is a running total kept with a ledger of each change. This recomputes the
            totals from the ledger and lists any that disagree.
          </DialogDescription>
        </DialogHeader>
        <ReconcileContent />
      </DialogContent>
    </Dialog>
  )
}
