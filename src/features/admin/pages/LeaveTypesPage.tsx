import { ListChecksIcon, PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable, EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { buildLeaveTypeColumns } from '@/features/admin/components/leaveTypeColumns'
import { LeaveTypeDialog } from '@/features/admin/components/LeaveTypeDialog'
import { useAdminLeaveTypes } from '@/features/admin/hooks/useAdminLeaveTypes'
import type { AdminLeaveType } from '@/features/admin/types/adminTypes'

export default function LeaveTypesPage() {
  const { data, isLoading, isFetching, isError, refetch } = useAdminLeaveTypes()
  const [dialogOpen, setDialogOpen] = useState(false)
  // The type the dialog edits; null means a new one. Kept when it closes, so it does not flicker.
  const [target, setTarget] = useState<AdminLeaveType | null>(null)

  const columns = useMemo(
    () =>
      buildLeaveTypeColumns((leaveType) => {
        setTarget(leaveType)
        setDialogOpen(true)
      }),
    [],
  )

  return (
    <>
      <PageHeader
        title="Leave types"
        description="The rules for each kind of leave. A new type that draws from a balance is allocated to everyone at once; other edits apply to new requests only."
        actions={
          <Button
            onClick={() => {
              setTarget(null)
              setDialogOpen(true)
            }}
          >
            <PlusIcon aria-hidden="true" />
            New leave type
          </Button>
        }
      />
      <DataTable
        caption="Leave types and their rules"
        columns={columns}
        rows={data ?? []}
        getRowId={(leaveType) => leaveType.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={refetch}
        emptyState={
          <EmptyState
            icon={ListChecksIcon}
            title="No leave types yet"
            description="Create the first one to let people request leave."
          />
        }
      />
      <LeaveTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} leaveType={target} />
    </>
  )
}
