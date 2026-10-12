import { CalendarOffIcon, SearchXIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { AppSelect, DataTable, EmptyState, FormGroup } from '@/components/shared'
import { Button } from '@/components/ui'
import { LEAVE_STATUS_CONFIG, LEAVE_STATUSES } from '@/constants/leaveStatus'
import { adminRequestColumns } from '@/features/admin/components/adminRequestColumns'
import { useAdminLeaveTypes } from '@/features/admin/hooks/useAdminLeaveTypes'
import { useAdminRequests } from '@/features/admin/hooks/useAdminRequests'
import { useTableFilters } from '@/hooks/useTableFilters'
import { isoYear, todayLocalIso } from '@/lib/dates'

const YEAR_MIN = 2000
const YEAR_MAX = 2100
const THIS_YEAR = isoYear(todayLocalIso())
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const FILTER_DEFAULTS = { year: String(THIS_YEAR), status: '', leaveTypeId: '', userId: '' }
const FILTER_VALIDATORS = {
  year: (value: string) =>
    /^\d{4}$/.test(value) && Number(value) >= YEAR_MIN && Number(value) <= YEAR_MAX,
  status: (value: string) => (LEAVE_STATUSES as readonly string[]).includes(value),
  leaveTypeId: (value: string) => UUID.test(value),
  userId: (value: string) => UUID.test(value),
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...LEAVE_STATUSES.map((status) => ({ value: status, label: LEAVE_STATUS_CONFIG[status].label })),
]

function yearOptions(selected: number) {
  const years = new Set([THIS_YEAR + 1, THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, selected])
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }))
}

export function RequestsPanel() {
  const { filters, page, pageSize, setFilter, setPage, setPageSize, reset } = useTableFilters({
    defaults: FILTER_DEFAULTS,
    validate: FILTER_VALIDATORS,
  })
  const year = Number(filters.year)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      year,
      ...(filters.status ? { status: filters.status as (typeof LEAVE_STATUSES)[number] } : {}),
      ...(filters.leaveTypeId ? { leaveTypeId: filters.leaveTypeId } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
    }),
    [page, pageSize, year, filters],
  )
  const { data, isLoading, isFetching, isError, refetch } = useAdminRequests(params)
  // Every type, inactive ones too: their requests are still in the list.
  const { data: leaveTypes } = useAdminLeaveTypes()

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

  // There is no "get one person" call; a request in the result names its person.
  const personName = data?.items[0]?.requester.name ?? 'this person'
  const isFiltered =
    filters.year !== FILTER_DEFAULTS.year ||
    filters.status !== '' ||
    filters.leaveTypeId !== '' ||
    filters.userId !== ''

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,14rem))_auto]">
        <FormGroup label="Year">
          {(controlProps) => (
            <AppSelect
              {...controlProps}
              options={yearOptions(year)}
              value={filters.year}
              onValueChange={(value) => setFilter('year', value)}
            />
          )}
        </FormGroup>
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
      {filters.userId && (
        <div>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Show everyone's requests again, not only ${personName}'s`}
            onClick={() => setFilter('userId', '')}
          >
            Requests of {personName}
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      )}
      <DataTable
        caption={`Leave requests starting in ${year}`}
        columns={adminRequestColumns}
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
              description="Try a different year, status or leave type."
              action={
                <Button variant="outline" onClick={reset}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={CalendarOffIcon}
              title={`No requests in ${year}`}
              description="Requests that start this year show up here, whoever made them."
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
  )
}
