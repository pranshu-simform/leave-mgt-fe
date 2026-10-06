import { CalendarXIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import {
  AppSelect,
  CardSkeleton,
  type Column,
  DataTable,
  EmptyState,
  ErrorState,
  FormGroup,
  PageHeader,
  PageLoader,
  StatusBadge,
  TableSkeleton,
} from '@/components/shared'
import { Button, Input } from '@/components/ui'
import type { LeaveStatus } from '@/constants/leaveStatus'
import { Section, Subsection } from './Section'

interface DemoRow {
  id: string
  type: string
  dates: string
  status: LeaveStatus
}

const DEMO_ROWS: DemoRow[] = [
  { id: '1', type: 'Annual leave', dates: '5 to 6 Jan 2027', status: 'APPROVED' },
  { id: '2', type: 'Sick leave', dates: '5 Oct 2026', status: 'APPROVED' },
  { id: '3', type: 'Annual leave', dates: '12 to 14 Oct 2026', status: 'PENDING' },
  { id: '4', type: 'Parental leave', dates: '7 to 10 Dec 2026', status: 'REJECTED' },
]

const DEMO_COLUMNS: readonly Column<DemoRow>[] = [
  {
    id: 'type',
    header: 'Type',
    mobile: 'title',
    cell: (row) => row.type,
    className: 'font-medium',
  },
  { id: 'dates', header: 'Dates', cell: (row) => row.dates },
  {
    id: 'status',
    header: 'Status',
    mobile: 'status',
    cell: (row) => <StatusBadge status={row.status} />,
  },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING', label: 'Pending' },
]

export function PatternsSection() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  return (
    <Section
      id="patterns"
      title="Shared patterns"
      description="The pieces every screen reuses. Each list and page handles loading, empty and error states with these."
    >
      <Subsection title="PageHeader">
        <div className="rounded-xl p-5 glass">
          <PageHeader
            title="My leave requests"
            description="Everything you have asked for, newest first."
            breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Requests' }]}
            actions={
              <Button>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                New request
              </Button>
            }
          />
        </div>
      </Subsection>

      <div className="grid gap-6 lg:grid-cols-2">
        <Subsection title="EmptyState">
          <EmptyState
            icon={CalendarXIcon}
            title="No requests yet"
            description="When you ask for time off, it shows up here."
            action={<Button variant="outline">Request leave</Button>}
          />
        </Subsection>
        <Subsection title="ErrorState">
          <ErrorState
            message="We could not load your requests. Check your connection."
            onRetry={() => undefined}
          />
        </Subsection>
        <Subsection title="TableSkeleton">
          <div className="rounded-xl p-4 glass">
            <TableSkeleton rows={4} columns={4} />
          </div>
        </Subsection>
        <Subsection title="CardSkeleton and PageLoader">
          <div className="flex flex-col gap-4">
            <CardSkeleton />
            <PageLoader label="Loading requests" />
          </div>
        </Subsection>
      </div>

      <Subsection title="DataTable with AppSelect filter and pagination">
        <div className="flex flex-col gap-4">
          <div className="max-w-xs">
            <FormGroup label="Status">
              {(controlProps) => (
                <AppSelect
                  {...controlProps}
                  options={STATUS_OPTIONS}
                  value={status}
                  onValueChange={setStatus}
                />
              )}
            </FormGroup>
          </div>
          <DataTable
            caption="Example leave requests"
            columns={DEMO_COLUMNS}
            rows={DEMO_ROWS.filter((row) => !status || row.status === status)}
            getRowId={(row) => row.id}
            isLoading={false}
            isError={false}
            onRetry={() => undefined}
            emptyState={<EmptyState icon={CalendarXIcon} title="No requests match" />}
            page={page}
            pageSize={pageSize}
            totalRows={120}
            totalPages={Math.ceil(120 / pageSize)}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      </Subsection>

      <Subsection title="FormGroup with a server error">
        <div className="max-w-sm rounded-xl p-5 glass">
          <FormGroup label="Email" error="Enter a valid email address." required>
            {(controlProps) => <Input {...controlProps} defaultValue="elliot@" />}
          </FormGroup>
        </div>
      </Subsection>
    </Section>
  )
}
