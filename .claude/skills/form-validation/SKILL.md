---
name: form-validation
description: Build a form with react-hook-form, Zod and server-error mapping. Use when asked to add or change a form, field validation, or a dialog with inputs.
---

# Forms

## Schema: `features/<f>/schemas/<f>Schema.ts`

```ts
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')

export const submitLeaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Select a leave type'),
    startDate: isoDate,
    endDate: isoDate,
    note: z.string().max(500, 'Keep the note under 500 characters').optional(),
  })
  .refine((v) => v.startDate <= v.endDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date',
  })

export type SubmitLeaveRequestFormData = z.infer<typeof submitLeaveRequestSchema>
```

ISO date strings compare correctly as strings. Never build `Date` objects from them. The server is the authority, and the client schema is for UX.

## Form component (the real one: `features/leave-requests/components/RequestForm.tsx`)

```tsx
const form = useForm<LeaveRequestFormData>({
  resolver: zodResolver(leaveRequestSchema),
  mode: 'onChange',
  defaultValues, // every field; a prefill from the URL goes through parsePrefill()
})
const [leaveTypeId, startDate, endDate, note] = useWatch({ control: form.control, name: [...] })

// A custom control that owns two fields (a date range) writes both with setValue.
<FormGroup label="Dates" required error={errors.startDate?.message ?? errors.endDate?.message ?? problemFor('startDate', 'endDate')}>
  {(controlProps) => (
    <DateRangePicker
      {...controlProps}
      value={{ start: startDate, end: endDate }}
      onChange={({ start, end }) => {
        form.setValue('startDate', start, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        form.setValue('endDate', end, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      }}
    />
  )}
</FormGroup>

// Call handleSubmit inside the event handler, not during render (the refs lint rule).
<form noValidate onSubmit={(event) => void form.handleSubmit(save)(event)}>
```

- **Problems the server reports before submit** (the preview endpoint's `violations`, each with a `field`) are shown under that field, next to the form's own errors, so they are announced and linked with `aria-describedby`. The form's error wins over a preview problem for the same field.
- **Server errors at submit** go through `applyServerError`: `details[{ field, message }]` map onto fields with `setError` (a field the form does not have becomes a toast), a constraint error without details (the overlap rule) goes under the field it concerns, anything else is a toast. A page can handle codes itself first (`onSubmitError`, for example edit's `VERSION_CONFLICT`).
- **Submit** is disabled with a tooltip (`WithTooltip`) saying why: invalid, a problem from the server, still checking, nothing changed (edit). The handler takes a synchronous lock (a ref) so two clicks in one tick send one request.
- **Unsaved changes:** `useBlocker` (the app uses a data router) with a `ConfirmDialog` when the form is dirty. After a save, store the result in state and navigate from an effect, so the blocker sees the saved state and lets it through.
- **Editing something versioned:** keep a snapshot of the record when the form opens and send its `version`, not the live query's, or a change made elsewhere is overwritten silently. Remount the form (a `key`) to reload.

## Rules

- `useForm<T>` is typed, uses `zodResolver`, `mode: "onChange"` and has `defaultValues` for every field.
- `<form noValidate>`. `register` for plain inputs, `Controller` for `AppSelect`, `DateRangePicker` and other custom inputs.
- One `FormGroup` per field. Its child is a function that receives `{ id, 'aria-invalid', 'aria-describedby' }`: spread them onto the control so the label, the error and the screen reader stay wired. For a plain input also spread `form.register('name')`. A working example is `features/auth/pages/LoginPage.tsx`.
- Submit is disabled while `isSubmitting || isPending`. A disabled submit button explains why (`WithTooltip`).
- **Server errors:** a 400 `VALIDATION_ERROR` carries `details[{ field, message }]` (on the `ApiError`), mapped onto fields with `setError`. Other codes (`INSUFFICIENT_BALANCE`, `OVERLAPPING_REQUEST`, `NOTICE_TOO_SHORT`) show as a form-level alert or toast via `handleApiError`.
- A reject form requires a non-empty reason, and the schema says so, as the server also enforces it.
- Guard dirty forms with a discard confirmation before navigating away or closing a dialog (see above).

## Checklist

- [ ] Schema in the feature's `schemas/` folder, with the inferred type exported.
- [ ] Every field has a label, an error message and a default value.
- [ ] Server `details` are mapped to fields.
- [ ] Checked in the browser: invalid input blocks submit, and a server issue lands on the right field.
