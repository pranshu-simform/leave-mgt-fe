# Frontend

Vite 8, React 19, TypeScript, TanStack Query v5, react-router 8, react-hook-form + Zod 4, axios, Tailwind CSS 4, shadcn (`base-nova`, base-ui), pnpm. Read the root [CLAUDE.md](../CLAUDE.md) invariants first. Structure details are in [docs/FRONTEND-STRUCTURE.md](../docs/FRONTEND-STRUCTURE.md). The layout follows the `coco-fe` reference app.

Path alias: `@/` → `src/`. Relative `../../` imports into `src/` are forbidden.

## Commands

- `pnpm dev`, `pnpm build` (`tsc -b && vite build`), `pnpm preview`
- `pnpm lint` (oxlint), `pnpm format` / `pnpm format:check` (oxfmt)
- Planned: `pnpm typecheck`

## Target structure

```
src/
  main.tsx  App.tsx  index.css
  routes/index.tsx        # routes built from PATH_ROUTES, lazy-loaded
  constants/              # apiRoutes.ts, queryKeys.ts, pathRoutes.ts, constant.ts
  context/AuthContext.tsx
  lib/                    # apiClient.ts, queryClient.ts, dates.ts, utils.ts (cn)
  hooks/                  # shared hooks + index.ts barrel
  components/ui/          # shadcn primitives (kebab-case files) + index.ts
  components/shared/      # PageHeader, DataTable, FormGroup, AppSelect, DateRangePicker, … + index.ts
  features/<kebab-name>/{api,components,hooks,pages,schemas,types,constants,utils}
  types/
```

Features: auth, dashboard, leave-requests, approvals, calendar, admin. Use the `add-feature` skill to create one.

## Feature rules

- Everything for a feature lives in `features/<name>/`. Shared code goes to `components/shared`, `hooks`, or `lib` only when a second feature needs it.
- **API:** `features/<f>/api/<f>Api.ts` is a plain object of async functions. Routes come from `constants/apiRoutes.ts`, with `:id` placeholders replaced via `.replace(":id", id)`. Responses are typed with `ApiResponse<T>` and `PaginatedApiResponse<T>` (see `docs/API-RESPONSES.md`), and the module **returns the envelope's data**: `response.data` for one item, `{ items, pagination }` (`PaginatedResult<T>`) for a list. Hooks and pages never see `success`.
- **Query keys:** only from `constants/queryKeys.ts`. Never inline strings. Detail queries use `enabled: !!id`.
- **Hooks:** one hook per file, `use<Action>.ts`. Mutations invalidate `QUERY_KEYS.<X>.ALL` and `DETAIL(id)`. Errors go through `handleApiError(error, fallback)`, toasts through `showSuccess` / `showError`.
- **Forms:** react-hook-form + `zodResolver`, `mode: "onChange"`, `<form noValidate>`, a `FormGroup` per field, `defaultValues` for every field, submit disabled while `isSubmitting || isPending`. Server `details` (`{ field, message }`) map to fields with `setError`. Schemas live in `features/<f>/schemas/<f>Schema.ts`.
- **Tables:** server-side `DataTable` with `useTableFilters`. Pagination is page-based with totals: send `page` (1-based) and `limit` (`PAGE_SIZE_OPTIONS`, default `DEFAULT_PAGE_SIZE`); read `pagination.total` and `totalPages`.
- **Routing:** path and the lazy component are co-located in `PATH_ROUTES` (`ALLOWED_ROLES` and `RoleRoute` arrive in Phase 8). Roles will be `EMPLOYEE`, `MANAGER`, `HR_ADMIN`.
- **Pages** are default exports (lazy loading needs it). Everything else is a named export. Props are `Readonly<Props>`.
- **No optimistic updates** on leave state changes. Invalidate queries after the mutation settles.

## API client and auth

- `lib/apiClient.ts` is a `class ApiClient` singleton (coco-fe style) over axios, with `withCredentials: true`. Its verbs (`get`, `post`, `put`, `patch`, `delete`) resolve to the response body, and every failure is thrown as an `ApiError { status, code, message, details }` (`createApiError` reads the API's `{ error: { code, message } }`; no response at all is status 0, code `NETWORK_ERROR`). **No token handling.** Both tokens will be httpOnly cookies. The API rejects foreign origins itself (CORS), so the client sends no extra header.
- On 401 it queues concurrent requests and runs one `POST /auth/refresh`, then retries. A failed refresh dispatches `FORCE_LOGOUT`.
- The browser calls the API directly at `VITE_API_BASE_URL` (`http://localhost:4000` in dev, with no `/api`; `API_CONFIG.BASE_URL` in `constants/constant.ts` appends `/api`). That is cross-origin, so the API's CORS middleware must allow this app's URL (`FRONTEND_ORIGIN`), and Vite is pinned to port 5173 (`strictPort`). Business routes are written `${API_V1}/…` in `constants/apiRoutes.ts` (`API_V1 = '/v1'`); health routes are unversioned.
- `lib/queryClient.ts` uses `REACT_QUERY_CONFIG` from `constants/constant.ts`: 2-minute stale time, up to 3 retries with exponential backoff, and never a retry on a 4xx.
- Errors are normalized to `ApiError { message, status, code, details }`.
- `AuthContext` reads `useQuery(QUERY_KEYS.AUTH.ME)` with `staleTime: Infinity`. Read the user from context; do not refetch it.

## Dates

Date-only values are `YYYY-MM-DD` strings. Use the helpers in `lib/dates.ts`. Never build a `Date` from a date-only string, and never format through UTC.

## UI rules

- Use shadcn components and the `cn()` helper from `lib/utils`. Use theme tokens, not hex values or arbitrary values. Use `gap-*` rather than `space-*`, and `size-*`.
- **Disabled actions carry a tooltip** explaining why (`WithTooltip`). Never leave a disabled button unexplained.
- Do not convey status by colour alone. Pair it with text or an icon.
- Dialogs trap focus and restore it. Date pickers work from the keyboard.
- Handle loading, empty and error states on every list and page.

## Verification (no automated tests)

- By decision there is no test library and no test files. Do not add them.
- Check in the browser: one refresh call when several requests hit an expired cookie, the reject dialog blocking an empty reason, role guards redirecting, and server `details` landing on the right form fields.

## Naming and style

- Folders kebab-case. Components PascalCase `.tsx`. Hooks `useXxx.ts`. Other files camelCase: `<feature>Api.ts`, `<feature>Types.ts`, `<feature>Schema.ts`, `<feature>Constants.ts`. shadcn files in `components/ui` stay kebab-case.
- `QUERY_KEYS.UPPER_SNAKE` and `API_ROUTES.NAMESPACE.ACTION`.
- No `any`. No `console.log`.
