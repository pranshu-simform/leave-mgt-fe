---
name: api-integration
description: Connect a backend endpoint to the UI in six steps (API route, query key, API module, types, hooks, UI). Use when asked to integrate an endpoint, call an API, or add a query or mutation hook.
---

# API integration

Contract reference: `PHASES.md` Part C (routes) and Part A12 (error codes).

## 1. Route constant: `constants/apiRoutes.ts`

```ts
LEAVE_REQUESTS: {
  LIST: "/leave-requests",
  GET: "/leave-requests/:id",
  APPROVE: "/leave-requests/:id/approve",
},
```

Paths are relative to the `/api` base URL. Dynamic segments use `:id`, replaced with `.replace(":id", id)`.

## 2. Query key: `constants/queryKeys.ts`

```ts
LEAVE_REQUESTS: {
  ALL: ["leave-requests"] as const,
  LIST: (params?: object) => ["leave-requests", "list", ...(params ? [params] : [])] as const,
  DETAIL: (id: string) => ["leave-requests", "detail", id] as const,
},
```

## 3. Types: `features/<f>/types/<f>Types.ts`

Mirror the backend response. Dates are `string` (`YYYY-MM-DD`). Paginated lists carry `meta: { nextCursor: string | null }`.

## 4. API module: `features/<f>/api/<f>Api.ts`

```ts
export const approvalApi = {
  approve: (id: string) =>
    apiClient.post<ApiResponse<LeaveRequest>>(API_ROUTES.LEAVE_REQUESTS.APPROVE.replace(':id', id)),
}
```

`apiClient` already returns `response.data`. Cookies and `X-Requested-With` are handled by it.

## 5. Hooks: one per file

Query:

```ts
export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS.DETAIL(id),
    queryFn: () => leaveRequestApi.getById(id),
    enabled: !!id,
  })
}
```

Mutation (state change: invalidate, no optimistic update):

```ts
export function useApproveRequest({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approvalApi.approve(id),
    onSuccess: (_data, id) => {
      showSuccess('Request approved')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS.ALL })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVE_REQUESTS.DETAIL(id) })
      onSuccess?.()
    },
    onError: (error) => showError(handleApiError(error, 'Unable to approve the request')),
  })
}
```

## 6. UI

- Disable the trigger while `isPending`, which also guards a double-click.
- Map error codes to messages: `ALREADY_DECIDED` and `INSUFFICIENT_BALANCE` should refresh the row and explain what happened.
- For forms, follow `form-validation`. For lists, follow `datatable-integration`.

## Checklist

- [ ] Route and key come from the constants files.
- [ ] Detail queries have `enabled: !!id`.
- [ ] Mutations invalidate `ALL` and the relevant `DETAIL(id)`, plus any related balance keys.
- [ ] Errors go through `handleApiError(error, fallback)`.
- [ ] No token handling and no manual headers.
