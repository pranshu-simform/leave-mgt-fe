import { CalendarOffIcon, PlusIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  AppSelect,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FormGroup,
  PageHeader,
} from '@/components/shared'
import { Button } from '@/components/ui'
import { buildHolidayColumns } from '@/features/admin/components/holidayColumns'
import { HolidayDialog } from '@/features/admin/components/HolidayDialog'
import { useAdminHolidays } from '@/features/admin/hooks/useAdminHolidays'
import { useDeleteHoliday } from '@/features/admin/hooks/useHolidayMutations'
import type { AdminHoliday } from '@/features/admin/types/adminTypes'
import { useTableFilters } from '@/hooks/useTableFilters'
import { handleApiError } from '@/lib/apiClient'
import { formatWeekdayDate, isoYear, todayLocalIso } from '@/lib/dates'
import { showError } from '@/lib/toast'

const YEAR_MIN = 2000
const YEAR_MAX = 2100
const THIS_YEAR = isoYear(todayLocalIso())
const FILTER_DEFAULTS = { year: String(THIS_YEAR) }
const FILTER_VALIDATORS = {
  year: (value: string) =>
    /^\d{4}$/.test(value) && Number(value) >= YEAR_MIN && Number(value) <= YEAR_MAX,
}

function yearOptions(selected: number) {
  const years = new Set([THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2, selected])
  return [...years]
    .sort((a, b) => a - b)
    .map((year) => ({ value: String(year), label: String(year) }))
}

export default function HolidaysPage() {
  const { filters, page, pageSize, setFilter, setPage, setPageSize } = useTableFilters({
    defaults: FILTER_DEFAULTS,
    validate: FILTER_VALIDATORS,
  })
  const year = Number(filters.year)
  const params = useMemo(() => ({ year, page, limit: pageSize }), [year, page, pageSize])
  const { data, isLoading, isFetching, isError, refetch } = useAdminHolidays(params)
  const remove = useDeleteHoliday()

  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<AdminHoliday | null>(null)
  const columns = useMemo(() => buildHolidayColumns(setToDelete), [])

  // Deleting the last row of the last page: go back to the last page that still exists.
  const totalPages = data?.pagination.totalPages ?? 0
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, {
      onSuccess: () => setToDelete(null),
      onError: (error) => {
        setToDelete(null)
        showError(handleApiError(error, 'Could not delete the holiday'), 'holiday-failed')
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Holidays"
        description="Public holidays do not count as working days. A change applies to new previews and requests; requests already submitted keep the working days they were counted with."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon aria-hidden="true" />
            Add holiday
          </Button>
        }
      />
      <div className="w-full pb-4 sm:w-40">
        <FormGroup label="Year">
          {(controlProps) => (
            <AppSelect
              {...controlProps}
              options={yearOptions(year)}
              value={String(year)}
              onValueChange={(value) => setFilter('year', value)}
            />
          )}
        </FormGroup>
      </div>
      <DataTable
        caption={`Public holidays in ${year}`}
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(holiday) => holiday.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={refetch}
        emptyState={
          <EmptyState
            icon={CalendarOffIcon}
            title={`No holidays in ${year}`}
            description="Add one and it stops counting as a working day."
          />
        }
        page={page}
        pageSize={pageSize}
        totalRows={data?.pagination.total ?? 0}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <HolidayDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={(date) => setFilter('year', String(isoYear(date)))}
      />
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(next) => {
          if (!next && !remove.isPending) setToDelete(null)
        }}
        title={toDelete ? `Delete ${toDelete.name}?` : 'Delete this holiday?'}
        description={
          toDelete
            ? `${formatWeekdayDate(toDelete.date)} counts as a working day again for new requests. Requests already submitted are not changed.`
            : ''
        }
        confirmLabel="Delete holiday"
        cancelLabel="Keep it"
        destructive
        isPending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}
