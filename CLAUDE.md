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
- **API:** `features/<f>/api/<f>Api.ts` is a plain object of async functions. Routes come from `constants/apiRoutes.ts`, with `:id` placeholders replaced via `.replace(":id", id)`. Every response is typed `ApiResponse<T> = { data: T; meta?: … }`.
- **Query keys:** only from `constants/queryKeys.ts`. Never inline strings. Detail queries use `enabled: !!id`.
- **Hooks:** one hook per file, `use<Action>.ts`. Mutations invalidate `QUERY_KEYS.<X>.ALL` and `DETAIL(id)`. Errors go through `handleApiError(error, fallback)`, toasts through `showSuccess` / `showError`.
- **Forms:** react-hook-form + `zodResolver`, `mode: "onChange"`, `<form noValidate>`, a `FormGroup` per field, `defaultValues` for every field, submit disabled while `isSubmitting || isPending`. Server `issues` map to fields with `setError`. Schemas live in `features/<f>/schemas/<f>Schema.ts`.
- **Tables:** server-side `DataTable` with `useTableFilters`. Pagination is cursor-based ("load more" or next/prev cursors).
- **Routing:** path, `ALLOWED_ROLES` and the lazy component are co-located in `PATH_ROUTES`. Roles are `EMPLOYEE`, `MANAGER`, `HR_ADMIN`. Wrap private routes in `RoleRoute`.
- **Pages** are default exports (lazy loading needs it). Everything else is a named export. Props are `Readonly<Props>`.
- **No optimistic updates** on leave state changes. Invalidate queries after the mutation settles.

## API client and auth

- `lib/apiClient.ts` is an axios singleton with `withCredentials: true` and `X-Requested-With` on every request. **No token handling.** Both tokens are httpOnly cookies.
- On 401 it queues concurrent requests and runs one `POST /auth/refresh`, then retries. A failed refresh dispatches `FORCE_LOGOUT`.
- `baseURL` is `/api`. In dev, Vite proxies `/api` to the backend, so cookies stay same-origin.
- Errors are normalised to `ApiError { message, status, code, details }`.
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
- Check in the browser: one refresh call when several requests hit an expired cookie, the reject dialog blocking an empty reason, role guards redirecting, and server `issues` landing on the right form fields.

## Naming and style

- Folders kebab-case. Components PascalCase `.tsx`. Hooks `useXxx.ts`. Other files camelCase: `<feature>Api.ts`, `<feature>Types.ts`, `<feature>Schema.ts`, `<feature>Constants.ts`. shadcn files in `components/ui` stay kebab-case.
- `QUERY_KEYS.UPPER_SNAKE` and `API_ROUTES.NAMESPACE.ACTION`.
- No `any`. No `console.log`.
