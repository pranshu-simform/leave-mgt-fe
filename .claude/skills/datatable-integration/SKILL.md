---
name: datatable-integration
description: Build a server-side paginated, filterable table with DataTable and useTableFilters, using page-number pagination with totals. Use when asked to add a list, table, queue or history view.
---

# Tables and lists

All lists are server-side and bounded. Never fetch everything and filter in the browser. The backend paginates by `page` and `limit` and answers with a `pagination` object (`total`, `totalPages`, `hasNextPage`, …). See `docs/API-RESPONSES.md`. This matches coco-fe's `useTableFilters` and `DataTable`, which already work with page numbers and totals.

## Wiring (the real API; see `features/leave-requests/pages/MyRequestsPage.tsx`)

```tsx
// Defaults and validators live at module level so the hook's memo stays stable.
const FILTER_DEFAULTS = { status: '', year: '' }
const FILTER_VALIDATORS = { status: (v: string) => STATUSES.includes(v), year: (v: string) => /^\d{4}$/.test(v) }

const { filters, page, pageSize, setFilter, setPage, setPageSize, reset, isFiltered } =
  useTableFilters({ defaults: FILTER_DEFAULTS, validate: FILTER_VALIDATORS })

const params = useMemo(
  () => ({ page, limit: pageSize, ...(filters.status ? { status: filters.status } : {}) }),
  [page, pageSize, filters],
) // page is already 1-based, as the API wants
const { data, isLoading, isFetching, isError, refetch } = useMyRequests(params) // PaginatedResult<T>

<DataTable
  caption="Your leave requests"            // the table's accessible name
  columns={columns}                        // Column<T>[]: { id, header, cell(row), align?, className? }
  rows={data?.items ?? []}
  getRowId={(row) => row.id}
  isLoading={isLoading}
  isFetching={isFetching}                  // dims the old rows while the next page loads
  isError={isError}
  onRetry={refetch}
  emptyState={isFiltered ? <NoMatch onClear={reset} /> : <NothingYet />}
  page={page}
  pageSize={pageSize}
  totalRows={data?.pagination.total ?? 0}
  totalPages={data?.pagination.totalPages ?? 0}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

The query hook uses `placeholderData: keepPreviousData` so the rows stay while the next page or filter loads. Filters are `AppSelect`s inside `FormGroup`s above the table.

## Rules

- The API module returns `PaginatedResult<T>` (`{ items, pagination }`), never the raw envelope.
- `useTableFilters` keeps filters, page and page size in the URL search params (shareable, survives a reload), writes only non-default values, replaces the history entry (so back leaves the page, not the previous filter), falls back to the default for an invalid value, and goes back to page 1 when a filter or the page size changes. It does not debounce: add that with the first free-text filter.
- Query keys include `params`, so each page and filter combination caches separately (`QUERY_KEYS.X.LIST(params)`).
- Page size options come from `PAGE_SIZE_OPTIONS` (25, 50, 75, 100) and the default from `DEFAULT_PAGE_SIZE`. The server caps `limit` at 100.
- When `totalPages` shrinks (a filter or a deletion) and the current page no longer exists, go back to the last page (an effect in the page: `if (totalPages > 0 && page > totalPages) setPage(totalPages)`).
- Define columns as a `Column<T>[]` in the feature (`components/<x>Columns.tsx`): a link in the first cell, `StatusBadge` for status, dates through `lib/dates.ts`. Give each column a `mobile` role for the phone card layout (under 768 px): `title` for the identity column (the link), `status` for the badge, `action` for a row button, `hidden` for what a phone does not need; any other column becomes a labeled detail line. `DataTable` renders either the table or the cards, never both.
- Row actions: a disabled action has a tooltip with the reason. Mutation buttons are disabled while pending.
- Always render loading, error (with retry) and empty states.
- Calendar and timeline views are not tables: page the people (rows), window the days, and use `/calendar/summary` for company-wide counts.

## Checklist

- [ ] Server-side filtering, sorting and pagination only.
- [ ] `page` (1-based) and `limit` go to the API; `total` and `totalPages` come back.
- [ ] Filters debounced, page reset on change.
- [ ] Loading, error and empty states present.
