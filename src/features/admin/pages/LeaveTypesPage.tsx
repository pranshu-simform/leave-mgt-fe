import { ListChecksIcon, PlusIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { buildLeaveTypeColumns } from '@/features/admin/components/leaveTypeColumns'
import { LeaveTypeDialog } from '@/features/admin/components/LeaveTypeDialog'
import { useAdminLeaveTypes } from '@/features/admin/hooks/useAdminLeaveTypes'
import type { AdminLeaveType } from '@/features/admin/types/adminTypes'
import { useTableFilters } from '@/hooks/useTableFilters'

const NO_FILTERS = {}

export default function LeaveTypesPage() {
  const { page, pageSize, setPage, setPageSize } = useTableFilters({ defaults: NO_FILTERS })
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

  // The list is small (at most 100) and comes whole, so the pages are cut here.
  const all = useMemo(() => data ?? [], [data])
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize))
  const rows = all.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

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
        rows={rows}
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
        page={page}
        pageSize={pageSize}
        totalRows={all.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <LeaveTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} leaveType={target} />
    </>
  )
}
