import { SearchXIcon, UsersIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { AllocateDialog } from '@/features/admin/components/AllocateDialog'
import { PersonBalancesDialog } from '@/features/admin/components/PersonBalancesDialog'
import { buildUserColumns } from '@/features/admin/components/userColumns'
import { UserFilterBar } from '@/features/admin/components/UserFilterBar'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { useUserFilters } from '@/features/admin/hooks/useUserFilters'
import type { AdminUser } from '@/features/admin/types/adminTypes'

export default function BalancesPage() {
  const {
    filters,
    page,
    pageSize,
    setFilter,
    setPage,
    setPageSize,
    isFiltered,
    text,
    setText,
    params,
    clearFilters,
  } = useUserFilters()
  const { data, isLoading, isFetching, isError, refetch } = useAdminUsers(params)

  const [person, setPerson] = useState<AdminUser | null>(null)
  const [personOpen, setPersonOpen] = useState(false)
  const [allocateOpen, setAllocateOpen] = useState(false)

  const columns = useMemo(
    () =>
      buildUserColumns((user) => {
        setPerson(user)
        setPersonOpen(true)
      }),
    [],
  )

  const totalPages = data?.pagination.totalPages ?? 0
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  return (
    <>
      <PageHeader
        title="Balances"
        description="Find a person to see and adjust their balances. Allocating creates the balances that are missing."
        actions={<Button onClick={() => setAllocateOpen(true)}>Allocate a year</Button>}
      />
      <div className="flex flex-col gap-4">
        <UserFilterBar
          text={text}
          onTextChange={setText}
          role={filters.role}
          active={filters.active}
          onFilterChange={setFilter}
          isFiltered={isFiltered}
          onClear={clearFilters}
        />
        <DataTable
          caption="People and their balances"
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(user) => user.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={refetch}
          emptyState={
            isFiltered ? (
              <EmptyState
                icon={SearchXIcon}
                title="No one matches these filters"
                description="Try a different name, role or status."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState icon={UsersIcon} title="No people yet" />
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
      <PersonBalancesDialog open={personOpen} onOpenChange={setPersonOpen} user={person} />
      <AllocateDialog open={allocateOpen} onOpenChange={setAllocateOpen} />
    </>
  )
}
