# Frontend

Vite 8, React 19, TypeScript, TanStack Query v5, react-router 8, react-hook-form + Zod 4, axios, Tailwind CSS 4, shadcn (`base-nova`, base-ui), pnpm. Read the root [CLAUDE.md](../CLAUDE.md) invariants first. Structure details are in [docs/FRONTEND-STRUCTURE.md](../docs/FRONTEND-STRUCTURE.md). The layout follows the `coco-fe` reference app.

Path alias: `@/` → `src/`. Relative `../../` imports into `src/` are forbidden.

## Docker

`frontend/Dockerfile` builds the app and serves `dist/` with nginx (`nginx.conf`: single-page fallback, immutable caching of `/assets/`, no caching of `index.html`). `VITE_API_BASE_URL` is a **build argument**, compiled into the bundle (the root compose file derives it from `PUBLIC_HOST` and `API_PORT`), not a runtime setting. The browser still calls the API directly; there is no proxy.

## Commands

- `pnpm dev`, `pnpm build` (`tsc -b && vite build`), `pnpm preview`
- `pnpm lint` (oxlint), `pnpm format` / `pnpm format:check` (oxfmt)
- `pnpm build` runs `tsc -b` and is the type check (there is no separate `typecheck` script)
- `pnpm dev -- --port 5174` when the old Docker `frontend` container holds 5173

## Target structure

```
src/
  main.tsx  App.tsx  index.css (imports only)
  styles/                 # tokens.css, theme.css, base.css, glass.css
  routes/index.tsx        # routes built from PATH_ROUTES, lazy-loaded
  constants/              # apiRoutes.ts, queryKeys.ts, pathRoutes.ts, constant.ts
  context/                # ThemeContext, AuthContext (+ authContext.ts, with hooks/useAuth.ts)
  lib/                    # apiClient.ts, queryClient.ts, dates.ts, utils.ts (cn)
  hooks/                  # shared hooks + index.ts barrel
  components/ui/          # shadcn primitives (kebab-case files) + index.ts
  components/shared/      # PageHeader, DataTable, FormGroup, AppSelect, DateRangePicker, … + index.ts
  features/<kebab-name>/{api,components,hooks,pages,schemas,types,constants,utils}
  types/
```

Features: auth (sign-in and the set-password page), dashboard, leave-requests, approvals, calendar, admin (plus the dev-only `design-system`). Use the `add-feature` skill to create one.

**Design system first.** The look (teal brand, "aurora glass", light and dark) is defined in [docs/DESIGN-SYSTEM.md](../docs/DESIGN-SYSTEM.md) and shown live at `/design-system` in dev. Read it before building any screen. Tokens are in `src/styles/`; shared patterns are in `components/shared`.

## Feature rules

- Everything for a feature lives in `features/<name>/`. Shared code goes to `components/shared`, `hooks`, or `lib` only when a second feature needs it.
- **API:** `features/<f>/api/<f>Api.ts` is a plain object of async functions. Routes come from `constants/apiRoutes.ts`, with `:id` placeholders replaced via `.replace(":id", id)`. Responses are typed with `ApiResponse<T>` and `PaginatedApiResponse<T>` (see `docs/API-RESPONSES.md`), and the module **returns the envelope's data**: `response.data` for one item, `{ items, pagination }` (`PaginatedResult<T>`) for a list. Hooks and pages never see `success`.
- **Query keys:** only from `constants/queryKeys.ts`. Never inline strings. Detail queries use `enabled: !!id`.
- **Hooks:** one hook per file, `use<Action>.ts`. Mutations invalidate `QUERY_KEYS.<X>.ALL` and `DETAIL(id)`. Errors go through `handleApiError(error, fallback)`, toasts through `showSuccess` / `showError`.
- **Number fields** register with `setValueAs` (`''` becomes `undefined`, or `null` for an optional one) next to `type="number"`, so the Zod schema sees a number or a clear "enter a number" error. Use `readOnly`, not `disabled`, for a value that must still be submitted (react-hook-form drops disabled fields). Yes/no rules are `Switch` (a focusable `role="switch"`, named by its `Label` through `aria-labelledby`), one row per rule with its hint under the label.
- **Admin (HR only):** five pages, each its own `PATH_ROUTES` entry and its own sidebar item (no group, no tabs): Leave types `/admin/leave-types`, Holidays `/admin/holidays`, Users `/admin/users`, Balances `/admin/balances`, All requests `/admin/requests`. `/admin` itself is not a page. Each page is a `PageHeader` (its description and its action buttons) over a table (Leave types has no pagination: the list is short and comes whole) with filters kept in that page's own URL, so moving between pages starts each one clean. A dialog with unsaved changes asks "Discard your changes?" before closing (Escape and the overlay included); a save that is hard to undo (deactivating a type, deleting a holiday) goes through `ConfirmDialog`. Every admin mutation invalidates what a change can touch (see `features/admin/hooks/invalidateAdminQueries.ts`), so the rest of the app is current without a reload. The Users page (`UsersPage`) lists people (search, role and status share `useUserFilters` and `UserFilterBar` with the Balances page), shows "Invited" for someone with no password yet and adds a person in `AddUserDialog` (name, email, role, optional manager from active managers and HR, loaded in one request with `role: [MANAGER, HR_ADMIN]`; a taken email shows under Email); "Resend link" sends a new set-password link; it is on every row and disabled, with a tooltip saying why, unless the person is active and has no password. The Balances page picks a person from a paginated table (no combobox), shows that person's balances in a dialog and adjusts one in a second dialog as "Add days" or "Remove days" with a positive number (the form turns it into the signed `delta` the API takes) and a required note; removing more than is left is refused in the form, and the server's 422 shows under Days if the balance moved meanwhile. A person's requests are reached from the table (`adminRequestsPath(userId)` opens All requests narrowed to them; the chip takes its name from the first row). The request detail page already shows Edit and Cancel only to the owner, so HR opening someone else's request sees neither; its breadcrumb goes back to All requests.
- **Previews before submit:** a read that shows what a write would do (the leave request preview) is a `useQuery` keyed by the debounced form values (`useDebounce`) with `placeholderData: keepPreviousData`, so a slow older answer can never replace a newer one. Its violations are shown under the fields they name; the server still decides at submit.
- **Forms:** react-hook-form + `zodResolver`, `mode: "onChange"`, `<form noValidate>`, a `FormGroup` per field, `defaultValues` for every field, submit disabled while `isSubmitting || isPending`. Server `details` (`{ field, message }`) map to fields with `setError`. Schemas live in `features/<f>/schemas/<f>Schema.ts`.
- **Tables:** server-side `DataTable` with `useTableFilters` (filters, page and page size live in the URL search params). Pagination is page-based with totals: send `page` (1-based) and `limit` (`PAGE_SIZE_OPTIONS`, default `DEFAULT_PAGE_SIZE`); read `pagination.total` and `totalPages`. See the `datatable-integration` skill. A list that is short by nature and comes whole (Leave types) passes no `page`, `pageSize`, `totalRows`, `totalPages` or change handlers, and `DataTable` then shows no pagination bar. Under 768 px it renders cards from the same columns, using each column's `mobile` role (`title`, `status`, `action`, `hidden`).
- **Routing:** a private screen is one entry in `PATH_ROUTES` (`PATH`, lazy `COMPONENT`, `ALLOWED_ROLES`, optional `NAV { LABEL, ICON }`). The route, the `RoleRoute` guard and the sidebar entry (`lib/navigation.ts`) all derive from it, so never hand-register a route or a nav item. Everything private renders inside `routes/PrivateLayout.tsx`. The two public screens are in `routes/index.tsx` beside it: `/login` and `/set-password` (the link in the email a new user gets; `features/auth/pages/SetPasswordPage.tsx` reads `?token=`, removes it from the address bar at once, checks the link with `POST /auth/set-password/check`, and on success goes to `/login`; both screens use `features/auth/components/{AuthShell,PasswordInput}`). Roles are `EMPLOYEE`, `MANAGER`, `HR_ADMIN` (`USER_ROLES`). The guard is a convenience; the API is the authority.
- **Pages** are default exports (lazy loading needs it). Everything else is a named export. Props are `Readonly<Props>`.
- **No optimistic updates** on leave state changes. Invalidate queries after the mutation settles.

## API client and auth

- `lib/apiClient.ts` is a `class ApiClient` singleton (coco-fe style) over axios, with `withCredentials: true`. Its verbs (`get`, `post`, `put`, `patch`, `delete`) resolve to the response body, and every failure is thrown as an `ApiError { status, code, message, details }` (`createApiError` reads the API's `{ error: { code, message } }`; no response at all is status 0, code `NETWORK_ERROR`). **No token handling.** Both tokens will be httpOnly cookies. The API rejects foreign origins itself (CORS), so the client sends no extra header.
- On any 401 (except from login and refresh themselves) it runs one `POST /auth/refresh` and retries the request once. `lib/sessionRefresh.ts` makes the refresh single-flight in a tab and serializes it across tabs with a Web Lock, because the refresh token rotates and replaying one revokes the session. A failed refresh, or a 401 right after a refresh, dispatches `FORCE_LOGOUT`; `AuthContext` then clears the session first and the cached data after (`clearUserData()` in `lib/queryClient.ts`; the other order makes mounted screens refetch) and shows "Your session expired". Do not add token handling: the cookies are httpOnly.
- The browser calls the API directly at `VITE_API_BASE_URL` (`http://localhost:4000` in dev, with no `/api`; `API_CONFIG.BASE_URL` in `constants/constant.ts` appends `/api`). That is cross-origin, so the API's CORS middleware must allow this app's URL (`FRONTEND_ORIGIN`), and Vite is pinned to port 5173 (`strictPort`). Business routes are written `${API_V1}/…` in `constants/apiRoutes.ts` (`API_V1 = '/v1'`); health routes are unversioned.
- `lib/queryClient.ts` uses `REACT_QUERY_CONFIG` from `constants/constant.ts`: 2-minute stale time, up to 3 retries with exponential backoff, and never a retry on a 4xx.
- Errors are normalized to `ApiError { message, status, code, details }`.
- `AuthContext` reads `useQuery(QUERY_KEYS.AUTH.ME)` with `staleTime: Infinity`; a 401 there means "signed out" (the data is `null`), not an error. Read the user with `useAuth()`; do not refetch it. Sign-in and sign-out both go through `clearUserData()` so one user's data never reaches the next. Sign-out only completes when the server call succeeds, because only the server can clear httpOnly cookies.

## Dates

Date-only values are `YYYY-MM-DD` strings. Use the helpers in `lib/dates.ts` (`parseIsoDate`, `toIsoDate`, `formatDate`, `formatDateRange`, `formatDateTime`, `todayLocalIso`). They parse and format with local calendar parts, so no timezone can move a date. Never build a `Date` from a date-only string (`new Date('2026-03-01')` is UTC midnight and shows the previous day west of UTC), and never format through UTC. Timestamps from the API (`createdAt`) are instants and are shown in local time with `formatInstantDate` / `formatDateTime`.

**"Today" in the browser** (`todayLocalIso()`) is only for display, for example what counts as upcoming. The server decides every rule with its own UTC date, which can differ by a day. Never check a rule (retroactive, notice, cancel) in the browser: disable nothing based on it that the server also decides, and show the server's message when they disagree.

## UI rules

- Use shadcn components and the `cn()` helper from `lib/utils`. Use **semantic tokens** (`bg-card`, `text-muted-foreground`, `bg-success-subtle`), never hex, `oklch()`, raw palette steps (`teal-500`) or arbitrary values. Use `gap-*` rather than `space-*`, and `size-*`.
- **Type by role:** `text-display`, `text-h1` to `text-h3`, `text-body`, `text-body-sm`, `text-label`, `text-caption`. Not `text-2xl`.
- **Glass:** cards and overlays are glass automatically (`data-slot` mapping in `styles/glass.css`). Use `glass`, `glass-raised` or `glass-overlay` only for a custom surface. No blur on table rows or list items, at most two overlapping blurred layers, and never write `-webkit-backdrop-filter` (the build adds it).
- **Status** is a `StatusBadge` (icon + label + tone from `constants/leaveStatus.ts`). Brand gradients are never used for status. One gradient primary button per view.
- Use the shared patterns instead of rebuilding them: `AppShell`, `PageHeader`, `EmptyState`, `ErrorState`, `TableSkeleton`, `CardSkeleton`, `PageLoader`, `FormGroup`, `AppSelect`, `DataTable`, `WithTooltip`, `ConfirmDialog`.
- **A mutation button guards against a double click itself:** the pending state re-renders after the second click can arrive, so take a synchronous lock (a ref) in the handler. The server still answers the second with a 409, which would show an error beside the success (see `CancelAction`).
- **Disabled actions carry a tooltip** explaining why (`WithTooltip`). Never leave a disabled button unexplained.
- Do not convey status by colour alone. Pair it with text or an icon.
- Dialogs trap focus and restore it. Date pickers work from the keyboard (arrows move the focus, which needs the day button's `ref`). Every page has one `main`, a skip link, a title (`PageHeader` sets it) and an `errorElement` (`RouteErrorPage`).
- Handle loading, empty and error states on every list and page.

## Verification (no automated tests)

- By decision there is no test library and no test files. Do not add them.
- Check in the browser: one refresh call when several requests hit an expired cookie, the reject dialog blocking an empty reason, role guards redirecting, and server `details` landing on the right form fields.

## Naming and style

- Folders kebab-case. Components PascalCase `.tsx`. Hooks `useXxx.ts`. Other files camelCase: `<feature>Api.ts`, `<feature>Types.ts`, `<feature>Schema.ts`, `<feature>Constants.ts`. shadcn files in `components/ui` stay kebab-case.
- `QUERY_KEYS.UPPER_SNAKE` and `API_ROUTES.NAMESPACE.ACTION`.
- No `any`. No `console.log`.
