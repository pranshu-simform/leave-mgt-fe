---
paths:
  - 'src/features/**'
  - 'src/hooks/**'
---

# Feature rules

- A feature owns its `api/`, `hooks/`, `components/`, `pages/`, `schemas/`, `types/`. Do not import another feature's internals; promote shared code to `components/shared`, `hooks` or `lib`.
- API modules are plain objects of async functions. Routes come from `API_ROUTES`. Responses are typed `ApiResponse<T>`.
- One hook per file, `use<Action>.ts`. Query keys come from `QUERY_KEYS`. Detail queries use `enabled: !!id`.
- Mutations invalidate the related `ALL` and `DETAIL(id)` keys and use `handleApiError(error, fallback)` for messages. No optimistic updates on leave state.
- Forms use react-hook-form + `zodResolver`, `mode: "onChange"`, `noValidate`, `defaultValues` for every field. Map server `issues` with `setError`.
- Date-only values stay `YYYY-MM-DD` strings. Use `lib/dates.ts`.
- Handle loading, empty and error states. Disabled buttons need a tooltip with the reason.
- Pages are default exports. Everything else is a named export. Props are `Readonly<Props>`.
