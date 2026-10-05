---
paths:
  - 'src/components/**'
---

# Component rules

- `components/ui` holds shadcn primitives (kebab-case files). Add them with the shadcn CLI and do not hand-edit generated files beyond theming.
- `components/shared` holds reusable PascalCase components. Each folder has an `index.ts` barrel. Import from `@/components/ui` and `@/components/shared`, not from individual files.
- Compose shadcn primitives. Do not rebuild a dialog, select or table from scratch.
- Style with semantic tokens and `cn()`. No hex or `oklch()` colours, no raw palette steps, no arbitrary values, no `space-*` (use `gap-*`), `size-*` for equal width and height. Type uses the role classes (`text-h2`, `text-body`, `text-caption`).
- Glass is applied centrally in `src/styles/glass.css` by `data-slot`. Do not add blur or translucent fills inside `components/ui`, do not blur table rows or list items, and never write `-webkit-backdrop-filter` by hand (the build adds it; a hand-written pair loses the unprefixed property in production).
- Status is shown with `StatusBadge` or the tone classes in `components/shared/tones.ts`: icon, label and tone together, never color alone.
- New shared components follow the `add-shared-component` skill and get a section in the `/design-system` page.
- Accessibility: every input has a label (`htmlFor` matching `id`). Dialogs trap and restore focus. Status is never conveyed by colour alone. Interactive elements work by keyboard.
- Disabled buttons use `WithTooltip` to say why.
- Props are `Readonly<Props>`. No `any`.
