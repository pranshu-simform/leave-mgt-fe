---
paths:
  - 'src/components/**'
---

# Component rules

- `components/ui` holds shadcn primitives (kebab-case files). Add them with the shadcn CLI and do not hand-edit generated files beyond theming.
- `components/shared` holds reusable PascalCase components. Each folder has an `index.ts` barrel. Import from `@/components/ui` and `@/components/shared`, not from individual files.
- Compose shadcn primitives. Do not rebuild a dialog, select or table from scratch.
- Style with theme tokens and `cn()`. No hex colours, no arbitrary values, no `space-*` (use `gap-*`), `size-*` for equal width and height.
- Accessibility: every input has a label (`htmlFor` matching `id`). Dialogs trap and restore focus. Status is never conveyed by colour alone. Interactive elements work by keyboard.
- Disabled buttons use `WithTooltip` to say why.
- Props are `Readonly<Props>`. No `any`.
