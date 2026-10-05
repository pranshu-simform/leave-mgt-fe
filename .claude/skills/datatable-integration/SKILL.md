---
name: datatable-integration
description: Build a server-side paginated, filterable table with DataTable and useTableFilters, using cursor pagination. Use when asked to add a list, table, queue or history view.
---

# Tables and lists

All lists are server-side and bounded. Never fetch everything and filter in the browser. The backend paginates by keyset cursor (`meta.nextCursor`), so this project adapts coco-fe's page-number `useTableFilters` to carry a cursor.

## Wiring

```tsx
const { filters, debouncedFilters, setFilter, isFiltered, resetFilters, cursor, nextPage, prevPage, hasPrev } =
  useTableFilters<ApprovalFilters>({ initialFilters: { status: "PENDING", search: "" }, searchKey: "search" });

const params = useMemo(
  () => ({ limit: 25, cursor, status: debouncedFilters.status, ...(debouncedFilters.search ? { search: debouncedFilters.search } : {}) }),
  [cursor, debouncedFilters],
);
const { data, isLoading, isError, refetch } = useApprovals(params);

<PageHeader title="Approvals" description="Pending requests from your direct reports" />
<DataTable
  columns={approvalColumns}
  data={data?.data ?? []}
  isLoading={isLoading}
  isError={isError}
  onRetry={refetch}
  hasNext={!!data?.meta.nextCursor}
  hasPrev={hasPrev}
  onNext={() => nextPage(data?.meta.nextCursor)}
  onPrev={prevPage}
/>
```

## Rules

- `useTableFilters` debounces the search key (400 ms) and resets the cursor when a filter changes. Keep filters in the URL search params so views are shareable.
- Query keys include `params`, so each page and filter combination caches separately (`QUERY_KEYS.X.LIST(params)`).
- Page size options come from `PAGE_SIZE_OPTIONS`. The server caps the limit at 100.
- Define columns with the shared column builder (status badge, date, actions). Dates render from `YYYY-MM-DD` strings via `lib/dates.ts`.
- Row actions: a disabled action has a tooltip with the reason. Mutation buttons are disabled while pending.
- Always render loading, error (with retry) and empty states.
- Calendar and timeline views are not tables: paginate people (rows), window the days, and use `/calendar/summary` for company-wide counts.

## Checklist

- [ ] Server-side filtering, sorting and pagination only.
- [ ] Cursor, not page number, goes to the API.
- [ ] Filters debounced, cursor reset on change.
- [ ] Loading, error and empty states present.
