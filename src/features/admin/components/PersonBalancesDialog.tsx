import { useState } from 'react'
import { AppSelect, ErrorState, FormGroup } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/components/ui'
import { ROLE_LABELS } from '@/constants/constant'
import { AdjustBalanceDialog } from '@/features/admin/components/AdjustBalanceDialog'
import type { AdminUser } from '@/features/admin/types/adminTypes'
import type { Balance } from '@/features/balances/types/balanceTypes'
import { useUserBalances } from '@/features/balances/hooks/useUserBalances'
import { isoYear, todayLocalIso } from '@/lib/dates'

const THIS_YEAR = isoYear(todayLocalIso())
const YEAR_OPTIONS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1].map((year) => ({
  value: String(year),
  label: String(year),
}))

interface PersonBalancesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Kept after the dialog closes, so it does not flicker while it fades out.
  user: AdminUser | null
}

function BalanceRow({
  balance,
  onAdjust,
}: Readonly<{ balance: Balance; onAdjust: (balance: Balance) => void }>) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium">{balance.name}</p>
        <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-caption text-muted-foreground tabular-nums">
          <div className="flex gap-1">
            <dt>Allowance</dt>
            <dd className="text-foreground">{balance.allowance}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Used</dt>
            <dd className="text-foreground">{balance.used}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Pending</dt>
            <dd className="text-foreground">{balance.pendingDays}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Left</dt>
            <dd className="text-foreground">{balance.remaining}</dd>
          </div>
        </dl>
      </div>
      <Button
        variant="outline"
        size="sm"
        aria-label={`Adjust ${balance.name} ${balance.year}`}
        onClick={() => onAdjust(balance)}
      >
        Adjust
      </Button>
    </li>
  )
}

// Mounted only while the dialog is open: the year, and the balance being adjusted, start fresh.
function PersonBalances({ user }: Readonly<{ user: AdminUser }>) {
  const [year, setYear] = useState(THIS_YEAR)
  // The balance being adjusted, by type: the dialog reads the live row from the list below, so a
  // refetch after a change shows the new numbers.
  const [adjustTypeId, setAdjustTypeId] = useState<string | null>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useUserBalances(user.id, year)

  const adjusting = data?.find((balance) => balance.leaveTypeId === adjustTypeId)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{user.name}, balances</DialogTitle>
        <DialogDescription>
          {ROLE_LABELS[user.role]}, {user.email}
        </DialogDescription>
      </DialogHeader>
      <div className="w-40">
        <FormGroup label="Year">
          {(controlProps) => (
            <AppSelect
              {...controlProps}
              options={YEAR_OPTIONS}
              value={String(year)}
              onValueChange={(value) => setYear(Number(value))}
            />
          )}
        </FormGroup>
      </div>
      {isError ? (
        <ErrorState message="We could not load these balances." onRetry={refetch} />
      ) : isLoading ? (
        <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : data && data.length > 0 ? (
        <ul aria-label={`Balances for ${year}`} className="divide-y divide-border">
          {data.map((balance) => (
            <BalanceRow
              key={balance.leaveTypeId}
              balance={balance}
              onAdjust={(selected) => {
                setAdjustTypeId(selected.leaveTypeId)
                setAdjustOpen(true)
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-body-sm text-muted-foreground">
          {user.isActive
            ? `No balances for ${year}. Run Allocate a year first.`
            : `${user.name} is inactive and has no balances for ${year}.`}
        </p>
      )}
      {adjusting && (
        <AdjustBalanceDialog
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          user={user}
          balance={adjusting}
        />
      )}
    </>
  )
}

export function PersonBalancesDialog({
  open,
  onOpenChange,
  user,
}: Readonly<PersonBalancesDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {user && <PersonBalances user={user} />}
      </DialogContent>
    </Dialog>
  )
}
