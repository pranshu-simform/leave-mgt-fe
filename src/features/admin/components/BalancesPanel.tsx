import { ScaleIcon, SearchXIcon, UsersIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AppSelect, DataTable, EmptyState, FormGroup } from '@/components/shared'
import { Button, Input } from '@/components/ui'
import { ROLE_LABELS, USER_ROLES, type UserRole } from '@/constants/constant'
import { AllocateDialog } from '@/features/admin/components/AllocateDialog'
import { PersonBalancesDialog } from '@/features/admin/components/PersonBalancesDialog'
import { ReconcileDialog } from '@/features/admin/components/ReconcileDialog'
import { buildUserColumns } from '@/features/admin/components/userColumns'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import type { AdminUser } from '@/features/admin/types/adminTypes'
import { useDebounce } from '@/hooks/useDebounce'
import { useTableFilters } from '@/hooks/useTableFilters'

const FILTER_DEFAULTS = { search: '', role: '', active: '' }
const FILTER_VALIDATORS = {
  role: (value: string) => Object.values(USER_ROLES).includes(value as UserRole),
  active: (value: string) => value === 'true' || value === 'false',
}

const SEARCH_MAX_LENGTH = 100
const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...Object.values(USER_ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] })),
]
const ACTIVE_OPTIONS = [
  { value: '', label: 'Active and inactive' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export function BalancesPanel() {
  const { filters, page, pageSize, setFilter, setPage, setPageSize, reset, isFiltered } =
    useTableFilters({ defaults: FILTER_DEFAULTS, validate: FILTER_VALIDATORS })

  // The box keeps what is typed; the URL (and the request) follow once typing pauses.
  const [text, setText] = useState(filters.search)
  const debouncedText = useDebounce(text.trim(), 300)
  useEffect(() => {
    if (debouncedText !== filters.search) setFilter('search', debouncedText)
    // Only a pause in typing should write the URL.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText])

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.role ? { role: filters.role as UserRole } : {}),
      ...(filters.active ? { isActive: filters.active === 'true' } : {}),
    }),
    [page, pageSize, filters],
  )
  const { data, isLoading, isFetching, isError, refetch } = useAdminUsers(params)

  const [person, setPerson] = useState<AdminUser | null>(null)
  const [personOpen, setPersonOpen] = useState(false)
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [reconcileOpen, setReconcileOpen] = useState(false)

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

  const clearFilters = () => {
    setText('')
    reset()
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-prose text-body-sm text-muted-foreground">
            Find a person to see and adjust their balances. Allocating creates the balances that are
            missing; checking compares every balance with its ledger.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setReconcileOpen(true)}>
              <ScaleIcon aria-hidden="true" />
              Check balances
            </Button>
            <Button onClick={() => setAllocateOpen(true)}>Allocate a year</Button>
          </div>
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,20rem)_repeat(2,minmax(0,12rem))_auto]">
          <FormGroup label="Search people">
            {(controlProps) => (
              <Input
                {...controlProps}
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={SEARCH_MAX_LENGTH}
                autoComplete="off"
                placeholder="Name or email"
              />
            )}
          </FormGroup>
          <FormGroup label="Role">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={ROLE_OPTIONS}
                value={filters.role}
                onValueChange={(value) => setFilter('role', value)}
              />
            )}
          </FormGroup>
          <FormGroup label="Status">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={ACTIVE_OPTIONS}
                value={filters.active}
                onValueChange={(value) => setFilter('active', value)}
              />
            )}
          </FormGroup>
          {isFiltered && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
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
      <ReconcileDialog open={reconcileOpen} onOpenChange={setReconcileOpen} />
    </>
  )
}
