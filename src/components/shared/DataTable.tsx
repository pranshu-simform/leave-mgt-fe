import type { ReactNode } from 'react'
import {
  Card,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { ErrorState } from './ErrorState'
import { PaginationBar } from './PaginationBar'
import { CardListSkeleton, TableSkeleton } from './Skeletons'

// On a phone each row becomes a card. `title` is the card's heading, `status` sits beside it,
// `action` is the button row at the bottom and `hidden` leaves the column out. A column with none of
// these is a detail line labeled with its header.
export type MobileRole = 'title' | 'status' | 'action' | 'hidden'

export interface Column<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'start' | 'end'
  className?: string
  mobile?: MobileRole
}

interface DataTableProps<T> {
  // The table's accessible name, announced by screen readers (not shown).
  caption: string
  columns: readonly Column<T>[]
  rows: readonly T[]
  getRowId: (row: T) => string
  isLoading: boolean
  // True while a new page or filter loads and the previous rows are still on screen.
  isFetching?: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  emptyState: ReactNode
  page: number
  pageSize: number
  totalRows: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

interface RowCardsProps<T> {
  caption: string
  columns: readonly Column<T>[]
  rows: readonly T[]
  getRowId: (row: T) => string
}

function RowCards<T>({ caption, columns, rows, getRowId }: Readonly<RowCardsProps<T>>) {
  const title = columns.find((column) => column.mobile === 'title')
  const status = columns.find((column) => column.mobile === 'status')
  const action = columns.find((column) => column.mobile === 'action')
  const details = columns.filter((column) => !column.mobile)

  return (
    <ul aria-label={caption} className="divide-y divide-border">
      {rows.map((row) => (
        <li key={getRowId(row)} className="flex flex-col gap-2 px-4 py-3">
          {(title || status) && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-medium">{title?.cell(row)}</div>
              {status && <div className="shrink-0">{status.cell(row)}</div>}
            </div>
          )}
          {details.length > 0 && (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-caption">
              {details.map((column) => (
                <div key={column.id} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-muted-foreground">{column.header}</dt>
                  <dd className={cn('text-right', column.className)}>{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          )}
          {action && <div className="flex justify-end">{action.cell(row)}</div>}
        </li>
      ))}
    </ul>
  )
}

// A server-side table: the rows are one page the API returned, and the page, the page size and the
// filters live in the caller (see useTableFilters). It sits on one glass card with plain rows. Under
// 768 px (the sidebar's breakpoint) the same columns render as a list of cards instead, so only one
// of the two is ever in the page.
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  isLoading,
  isFetching = false,
  isError,
  errorMessage = 'We could not load this list. Check your connection and try again.',
  onRetry,
  emptyState,
  page,
  pageSize,
  totalRows,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Readonly<DataTableProps<T>>) {
  const isMobile = useIsMobile()

  if (isLoading) return isMobile ? <CardListSkeleton /> : <TableSkeleton columns={columns.length} />
  if (isError && rows.length === 0) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (rows.length === 0 && totalRows === 0) return <>{emptyState}</>

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div aria-busy={isFetching} className={cn('transition-opacity', isFetching && 'opacity-60')}>
        {isMobile ? (
          <RowCards caption={caption} columns={columns} rows={rows} getRowId={getRowId} />
        ) : (
          <Table>
            <TableCaption className="sr-only">{caption}</TableCaption>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    scope="col"
                    className={cn(column.align === 'end' && 'text-right', column.className)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(column.align === 'end' && 'text-right', column.className)}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
  )
}
