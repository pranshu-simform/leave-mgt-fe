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
import { cn } from '@/lib/utils'
import { ErrorState } from './ErrorState'
import { PaginationBar } from './PaginationBar'
import { TableSkeleton } from './Skeletons'

export interface Column<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'start' | 'end'
  className?: string
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

// A server-side table: the rows are one page the API returned, and the page, the page size and the
// filters live in the caller (see useTableFilters). It sits on one glass card with plain rows.
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
  if (isLoading) return <TableSkeleton columns={columns.length} />
  if (isError && rows.length === 0) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (rows.length === 0 && totalRows === 0) return <>{emptyState}</>

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div aria-busy={isFetching} className={cn('transition-opacity', isFetching && 'opacity-60')}>
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
