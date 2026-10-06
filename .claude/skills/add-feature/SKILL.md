---
name: add-feature
description: Scaffold a new frontend feature folder (api, hooks, components, pages, schemas, types) and wire its route, API routes and query keys. Use when asked to add a page, screen, feature or flow to the frontend.
---

# Add a frontend feature

Read `frontend/CLAUDE.md` and `docs/FRONTEND-STRUCTURE.md` first. Name the folder in kebab-case (`leave-requests`).

## Steps

1. **Folder:** `src/features/<name>/{api,components,hooks,pages,schemas,types}` (add `constants/` or `utils/` only if needed).
2. **Constants:**
   - Add `API_ROUTES.<NAME>` to `constants/apiRoutes.ts`.
   - Add `QUERY_KEYS.<NAME>` with `ALL`, `LIST(params?)` and `DETAIL(id)` to `constants/queryKeys.ts`.
     Follow the `api-integration` skill for the data layer.
3. **Types:** `types/<name>Types.ts`: the entity, list params and payload types, matching the backend contract in `PHASES.md` Part C.
4. **API module:** `api/<name>Api.ts`, a plain object of async functions using `apiClient` and typed with `ApiResponse<T>`.
5. **Hooks:** one file per operation, `useXxx.ts`, in `hooks/`.
6. **Schema:** `schemas/<name>Schema.ts` for any form (`form-validation` skill).
7. **Components and page:**
   - `pages/<Name>Page.tsx` as a **default export**, using `PageHeader`.
   - Handle loading, empty and error states.
   - For a list, use the `datatable-integration` skill.
8. **Route:** add an entry to `PATH_ROUTES` in `constants/pathRoutes.ts` with `PATH`, `ALLOWED_ROLES` (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`) and a lazy `COMPONENT`. Add a nav link in the layout if it should appear in the sidebar.
9. **Docs:** update the feature list in `docs/FRONTEND-STRUCTURE.md`.

## Checklist

- [ ] No relative `../../` imports into `src/`. Use `@/`.
- [ ] No inline query-key strings or hard-coded API paths.
- [ ] The page is a default export. Props are `Readonly<Props>`.
- [ ] Every list and page handles loading, empty and error.
- [ ] Disabled buttons have a tooltip with the reason.
- [ ] `pnpm lint && pnpm format:check && pnpm build` pass.
