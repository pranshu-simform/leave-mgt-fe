---
name: datatable-integration
description: Build a server-side paginated, filterable table with DataTable and useTableFilters, using page-number pagination with totals. Use when asked to add a list, table, queue or history view.
---

# Tables and lists

All lists are server-side and bounded. Never fetch everything and filter in the browser. The backend paginates by `page` and `limit` and answers with a `pagination` object (`total`, `totalPages`, `hasNextPage`, …). See `docs/API-RESPONSES.md`. This matches coco-fe's `useTableFilters` and `DataTable`, which already work with page numbers and totals.

## Wiring

```tsx
const { debouncedFilters, setFilter, paginationProps, isFiltered, resetFilters } =
  useTableFilters<ApprovalFilters>({
    initialFilters: { status: 'PENDING', search: '' },
    searchKey: 'search',
    defaultPageSize: DEFAULT_PAGE_SIZE,
  })

const params = useMemo(
  () => ({
    page: debouncedFilters.pageIndex + 1, // the API is 1-based
    limit: debouncedFilters.pageSize,
    status: debouncedFilters.status,
    ...(debouncedFilters.search ? { search: debouncedFilters.search } : {}),
  }),
  [debouncedFilters],
)
const { data, isLoading, isError, refetch } = useApprovals(params) // PaginatedResult<Approval>

<PageHeader title="Approvals" description="Pending requests from your direct reports" />
<DataTable
  columns={approvalColumns}
  data={data?.items ?? []}
  isLoading={isLoading}
  isError={isError}
  onRetry={refetch}
  {...paginationProps}
  pageCount={data?.pagination.totalPages ?? 0}
  totalRows={data?.pagination.total ?? 0}
/>
```

## Rules

- The API module returns `PaginatedResult<T>` (`{ items, pagination }`), never the raw envelope.
- `useTableFilters` debounces the search key (400 ms) and goes back to page 1 when a filter changes. Keep filters in the URL search params so views are shareable.
- Query keys include `params`, so each page and filter combination caches separately (`QUERY_KEYS.X.LIST(params)`).
- Page size options come from `PAGE_SIZE_OPTIONS` (25, 50, 75, 100) and the default from `DEFAULT_PAGE_SIZE`. The server caps `limit` at 100.
- When `totalPages` shrinks (a filter or a deletion) and the current page no longer exists, go back to the last page.
- Define columns with the shared column builder (status badge, date, actions). Dates render from `YYYY-MM-DD` strings via `lib/dates.ts`.
- Row actions: a disabled action has a tooltip with the reason. Mutation buttons are disabled while pending.
- Always render loading, error (with retry) and empty states.
- Calendar and timeline views are not tables: page the people (rows), window the days, and use `/calendar/summary` for company-wide counts.

## Checklist

- [ ] Server-side filtering, sorting and pagination only.
- [ ] `page` (1-based) and `limit` go to the API; `total` and `totalPages` come back.
- [ ] Filters debounced, page reset on change.
- [ ] Loading, error and empty states present.
