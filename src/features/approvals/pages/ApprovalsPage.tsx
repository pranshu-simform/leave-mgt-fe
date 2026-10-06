import { CircleCheckBigIcon, InboxIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DataTable, EmptyState, PageHeader } from '@/components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { LEAVE_STATUS_CONFIG, LEAVE_STATUSES, type LeaveStatus } from '@/constants/leaveStatus'
import { buildApprovalColumns } from '@/features/approvals/components/approvalColumns'
import { ReviewSheet } from '@/features/approvals/components/ReviewSheet'
import { useApprovals } from '@/features/approvals/hooks/useApprovals'
import { useTableFilters } from '@/hooks/useTableFilters'

const FILTER_DEFAULTS = { status: 'PENDING' }
const FILTER_VALIDATORS = {
  status: (value: string) => (LEAVE_STATUSES as readonly string[]).includes(value),
}
const REVIEW_PARAM = 'request'

export default function ApprovalsPage() {
  const { filters, page, pageSize, setFilter, setPage, setPageSize } = useTableFilters({
    defaults: FILTER_DEFAULTS,
    validate: FILTER_VALIDATORS,
  })
  const status = filters.status as LeaveStatus

  // The review sheet lives in the URL, so a link to a review works and Back closes it.
  const [searchParams, setSearchParams] = useSearchParams()
  const reviewId = searchParams.get(REVIEW_PARAM)
  const openReview = useCallback(
    (id: string) =>
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        next.set(REVIEW_PARAM, id)
        return next
      }),
    [setSearchParams],
  )
  const closeReview = useCallback(
    () =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete(REVIEW_PARAM)
          return next
        },
        { replace: true },
      ),
    [setSearchParams],
  )

  const params = useMemo(() => ({ page, limit: pageSize, status }), [page, pageSize, status])
  const { data, isLoading, isFetching, isError, refetch } = useApprovals(params)
  const columns = useMemo(() => buildApprovalColumns(openReview), [openReview])

  // A decision can empty the last page: go back to the last page that still exists.
  const totalPages = data?.pagination.totalPages ?? 0
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const statusLabel = LEAVE_STATUS_CONFIG[status].label.toLowerCase()

  return (
    <>
      <PageHeader title="Approvals" description="Leave requests from your team, oldest first" />
      <Tabs value={status} onValueChange={(value) => setFilter('status', String(value))}>
        <TabsList>
          {LEAVE_STATUSES.map((value) => (
            <TabsTrigger key={value} value={value}>
              {LEAVE_STATUS_CONFIG[value].label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status} className="mt-4">
          <DataTable
            caption={`${LEAVE_STATUS_CONFIG[status].label} leave requests from your team`}
            columns={columns}
            rows={data?.items ?? []}
            getRowId={(request) => request.id}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onRetry={refetch}
            emptyState={
              status === 'PENDING' ? (
                <EmptyState
                  icon={CircleCheckBigIcon}
                  title="You are all caught up"
                  description="No requests are waiting for your decision."
                />
              ) : (
                <EmptyState
                  icon={InboxIcon}
                  title={`No ${statusLabel} requests`}
                  description="Requests show up here once they reach this status."
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
        </TabsContent>
      </Tabs>
      <ReviewSheet requestId={reviewId} onClose={closeReview} />
    </>
  )
}
