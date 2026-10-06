---
name: add-shared-component
description: Add a reusable component to components/shared (or a variant to a shadcn primitive) in the design system, with its states shown on the /design-system page. Use when a second feature needs the same UI, or when a pattern from docs/DESIGN-SYSTEM.md is missing.
---

# Add a shared component

Read `docs/DESIGN-SYSTEM.md` first. Shared code is added only when a second feature needs it (or when a pattern the design system names is missing).

## Steps

1. **Compose, do not rebuild.** Start from the shadcn primitives in `components/ui` (add a missing one with `pnpm exec shadcn add <name> -y`; answer or pass `-o` only if it asks to overwrite a file you have not themed). Never hand-write a dialog, select, table or tooltip.
2. **File:** `components/shared/<PascalName>.tsx`, a named export, props typed as `Readonly<Props>`, no `any`. Add it to `components/shared/index.ts`.
3. **Style with tokens only:** semantic colors (`bg-card`, `text-muted-foreground`, `bg-success-subtle`), role type classes (`text-h3`, `text-body-sm`), `gap-*`, `size-*`. No hex, no `oklch()`, no `teal-500`, no arbitrary values. Tones (success, warning, danger, info, neutral) come from `components/shared/tones.ts`.
4. **Glass:** do not add blur. If it is a card or overlay it is already glass through its `data-slot`. A custom surface may use `glass`, `glass-raised` or `glass-overlay`; never on repeated elements, never more than two overlapping blurred layers, never a hand-written `-webkit-backdrop-filter`.
5. **States:** handle loading, empty and error where the component shows data. Disabled actions get `WithTooltip` with a reason. Status uses `StatusBadge`, never color alone.
6. **Accessibility:** a label for every input (use `FormGroup`), keyboard reachable, a visible focus ring (the primitives already have it, do not remove it), `aria-hidden="true"` on decorative icons, `role="status"` or `role="alert"` where content appears dynamically.
7. **Show it in the style guide:** add the component, with all its variants and states, to the matching section in `features/design-system/components/` (`PatternsSection`, `DataDisplaySection`, ...). If it adds a token, also add a swatch to `ColorsSection`.
8. **Check:** `pnpm build`, `pnpm lint`, `pnpm format:check`. Open `/design-system` in light and dark and at a narrow width, tab through the new component, and try the glass-off switch. If it adds or changes a text or edge color, re-run the contrast check described in `docs/DESIGN-SYSTEM.md`.
9. **Docs:** update the component table in `docs/DESIGN-SYSTEM.md` and `docs/FRONTEND-STRUCTURE.md` in the same change.

## A new token

Add it to `:root` and `.dark` in `src/styles/tokens.css`, map it in `src/styles/theme.css` (`--color-<name>: var(--<name>)`), and measure its contrast in both themes.
