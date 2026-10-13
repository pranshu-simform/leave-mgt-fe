import { PlusIcon, SearchXIcon, UsersIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui'
import { AddUserDialog } from '@/features/admin/components/AddUserDialog'
import { buildUserManagementColumns } from '@/features/admin/components/userColumns'
import { UserFilterBar } from '@/features/admin/components/UserFilterBar'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { useResendInvite } from '@/features/admin/hooks/useUserMutations'
import { useUserFilters } from '@/features/admin/hooks/useUserFilters'
import type { AdminUser } from '@/features/admin/types/adminTypes'
import { handleApiError } from '@/lib/apiClient'
import { showError } from '@/lib/toast'

export default function UsersPage() {
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
  const [addOpen, setAddOpen] = useState(false)

  const resend = useResendInvite()
  const resendingId = resend.isPending ? (resend.variables ?? null) : null
  const columns = useMemo(
    () =>
      buildUserManagementColumns((user: AdminUser) => {
        resend.mutate(user.id, {
          onError: (error) =>
            showError(handleApiError(error, 'Could not send the link'), 'resend-failed'),
        })
      }, resendingId),
    // `resend.mutate` is stable; only the busy row changes the columns.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [resendingId],
  )

  const totalPages = data?.pagination.totalPages ?? 0
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  return (
    <>
      <PageHeader
        title="Users"
        description="A new person gets an email with a link to choose their password. The link works once and for 24 hours; until they use it they show as Invited and you can send it again."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon aria-hidden="true" />
            Add user
          </Button>
        }
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
          caption="People"
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
      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
