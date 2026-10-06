import { CalendarOffIcon, SearchXIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { AppSelect, DataTable, EmptyState, FormGroup, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { LEAVE_STATUS_CONFIG, LEAVE_STATUSES } from '@/constants/leaveStatus'
import { NEW_REQUEST_PATH } from '@/constants/pathRoutes'
import { requestColumns } from '@/features/leave-requests/components/requestColumns'
import { useMyRequests } from '@/features/leave-requests/hooks/useMyRequests'
import { useLeaveTypes } from '@/features/leave-types/hooks/useLeaveTypes'
import { useTableFilters } from '@/hooks/useTableFilters'
import { isoYear, todayLocalIso } from '@/lib/dates'

const FILTER_DEFAULTS = { status: '', year: '', leaveTypeId: '' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FILTER_VALIDATORS = {
  status: (value: string) => (LEAVE_STATUSES as readonly string[]).includes(value),
  year: (value: string) => /^\d{4}$/.test(value),
  leaveTypeId: (value: string) => UUID.test(value),
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...LEAVE_STATUSES.map((status) => ({ value: status, label: LEAVE_STATUS_CONFIG[status].label })),
]

export default function MyRequestsPage() {
  const { filters, page, pageSize, setFilter, setPage, setPageSize, reset, isFiltered } =
    useTableFilters({ defaults: FILTER_DEFAULTS, validate: FILTER_VALIDATORS })

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(filters.status ? { status: filters.status as (typeof LEAVE_STATUSES)[number] } : {}),
      ...(filters.year ? { year: Number(filters.year) } : {}),
      ...(filters.leaveTypeId ? { leaveTypeId: filters.leaveTypeId } : {}),
    }),
    [page, pageSize, filters],
  )

  const { data, isLoading, isFetching, isError, refetch } = useMyRequests(params)
  const { data: leaveTypes } = useLeaveTypes()

  // A filter or a deletion can leave the current page past the end: go to the last page.
  const totalPages = data?.pagination.totalPages ?? 0
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const typeOptions = useMemo(
    () => [
      { value: '', label: 'All types' },
      ...(leaveTypes ?? []).map((type) => ({ value: type.id, label: type.name })),
    ],
    [leaveTypes],
  )

  const yearOptions = useMemo(() => {
    const current = isoYear(todayLocalIso())
    // Next year (leave can be booked ahead) back to three years ago.
    const years = new Set([current + 1, current, current - 1, current - 2, current - 3])
    // A year from the URL stays selectable even when it is outside the usual range.
    if (filters.year) years.add(Number(filters.year))
    return [
      { value: '', label: 'All years' },
      ...[...years]
        .sort((a, b) => b - a)
        .map((year) => ({ value: String(year), label: String(year) })),
    ]
  }, [filters.year])

  const requestLeave = (
    <Button render={<Link to={NEW_REQUEST_PATH} />} nativeButton={false}>
      Request leave
    </Button>
  )

  return (
    <>
      <PageHeader
        title="My requests"
        description="Every leave request you have made, newest first"
        actions={requestLeave}
      />
      <div className="flex flex-col gap-4">
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,14rem))_auto]">
          <FormGroup label="Status">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={STATUS_OPTIONS}
                value={filters.status}
                onValueChange={(value) => setFilter('status', value)}
              />
            )}
          </FormGroup>
          <FormGroup label="Year">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={yearOptions}
                value={filters.year}
                onValueChange={(value) => setFilter('year', value)}
              />
            )}
          </FormGroup>
          <FormGroup label="Leave type">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={typeOptions}
                value={filters.leaveTypeId}
                onValueChange={(value) => setFilter('leaveTypeId', value)}
              />
            )}
          </FormGroup>
          {isFiltered && (
            <Button variant="ghost" onClick={reset}>
              Clear filters
            </Button>
          )}
        </div>
        <DataTable
          caption="Your leave requests"
          columns={requestColumns}
          rows={data?.items ?? []}
          getRowId={(request) => request.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={refetch}
          emptyState={
            isFiltered ? (
              <EmptyState
                icon={SearchXIcon}
                title="No requests match these filters"
                description="Try a different status, year or leave type."
                action={
                  <Button variant="outline" onClick={reset}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={CalendarOffIcon}
                title="No leave requests yet"
                description="When you request leave it will show up here, with its status."
                action={requestLeave}
              />
            )
          }
          page={page}
          pageSize={pageSize}
          totalRows={data?.pagination.total ?? 0}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  )
}
