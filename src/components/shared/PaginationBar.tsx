import {
  Button,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { PAGE_SIZE_OPTIONS } from '@/constants/constant'
import { AppSelect } from './AppSelect'

interface PaginationBarProps {
  page: number
  pageSize: number
  totalRows: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

type PageToken = number | 'start-gap' | 'end-gap'

// First, last, the current page and its neighbors; gaps become an ellipsis.
function pageTokens(page: number, totalPages: number): PageToken[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1])
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  const tokens: PageToken[] = []
  pages.forEach((n, index) => {
    const previous = pages[index - 1]
    if (previous !== undefined && n - previous > 1) {
      tokens.push(index === 1 ? 'start-gap' : 'end-gap')
    }
    tokens.push(n)
  })
  return tokens
}

const SIZE_OPTIONS = PAGE_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size} per page`,
}))

export function PaginationBar({
  page,
  pageSize,
  totalRows,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Readonly<PaginationBarProps>) {
  const first = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalRows)

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body-sm text-muted-foreground" aria-live="polite">
        {totalRows === 0 ? 'No results' : `Showing ${first} to ${last} of ${totalRows}`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <AppSelect
          size="sm"
          className="w-36"
          aria-label="Rows per page"
          options={SIZE_OPTIONS}
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        />
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Go to previous page"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
              {pageTokens(page, totalPages).map((token) => (
                <PaginationItem key={token}>
                  {typeof token === 'number' ? (
                    <Button
                      variant={token === page ? 'outline' : 'ghost'}
                      size="icon"
                      aria-label={`Page ${token}`}
                      aria-current={token === page ? 'page' : undefined}
                      onClick={() => onPageChange(token)}
                    >
                      {token}
                    </Button>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Go to next page"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
