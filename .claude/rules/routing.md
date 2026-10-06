---
paths:
  - 'src/routes/**'
  - 'src/constants/**'
---

# Routing and constants rules

- Each route is an entry in `PATH_ROUTES` with `PATH`, `ALLOWED_ROLES` and a lazy `COMPONENT`. `routes/index.tsx` derives the private routes from it. Do not hand-register private routes.
- Roles are `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, defined once in `USER_ROLES`. An empty `ALLOWED_ROLES` means any authenticated user. Denied access redirects to the role's default route.
- Public routes (`/login`) are listed explicitly in `routes/index.tsx`. Everything else sits under `PrivateLayout`, which redirects to `/login` when unauthenticated.
- `API_ROUTES` and `QUERY_KEYS` are the only places paths and keys are written. Group by feature in UPPER_SNAKE: `API_ROUTES.LEAVE_REQUESTS.LIST`, `QUERY_KEYS.LEAVE_REQUESTS.DETAIL(id)`.
- Query keys start with a kebab namespace and always expose `ALL`, `LIST(params?)` and `DETAIL(id)` where relevant.
- State that should be shareable (calendar month, team, table filters) lives in the URL search params.
