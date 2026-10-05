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

## Form component

```tsx
const form = useForm<SubmitLeaveRequestFormData>({
  resolver: zodResolver(submitLeaveRequestSchema),
  mode: 'onChange',
  defaultValues: { leaveTypeId: '', startDate: '', endDate: '', note: '' },
})
const { mutate, isPending } = useSubmitLeaveRequest({
  onFieldErrors: (details) =>
    details.forEach((d) => form.setError(d.field as never, { message: d.message })),
})

;<form noValidate onSubmit={form.handleSubmit((v) => mutate(v))}>
  <FormGroup
    label="Leave type"
    htmlFor="leaveTypeId"
    error={form.formState.errors.leaveTypeId?.message}
  >
    <Controller
      name="leaveTypeId"
      control={form.control}
      render={({ field }) => <AppSelect id="leaveTypeId" {...field} options={types} />}
    />
  </FormGroup>
  <Button
    type="submit"
    disabled={!form.formState.isValid || form.formState.isSubmitting || isPending}
  >
    Submit
  </Button>
</form>
```

## Rules

- `useForm<T>` is typed, uses `zodResolver`, `mode: "onChange"` and has `defaultValues` for every field.
- `<form noValidate>`. `register` for plain inputs, `Controller` for `AppSelect`, `DateRangePicker` and other custom inputs.
- One `FormGroup` per field, with `id` matching `htmlFor`.
- Submit is disabled while `isSubmitting || isPending`. A disabled submit button explains why (`WithTooltip`).
- **Server errors:** a 400 `VALIDATION_ERROR` carries `details[{ field, message }]` (on the `ApiError`), mapped onto fields with `setError`. Other codes (`INSUFFICIENT_BALANCE`, `OVERLAPPING_REQUEST`, `NOTICE_TOO_SHORT`) show as a form-level alert or toast via `handleApiError`.
- A reject form requires a non-empty reason, and the schema says so, as the server also enforces it.
- Guard dirty forms with a discard confirmation before navigating away or closing a dialog.

## Checklist

- [ ] Schema in the feature's `schemas/` folder, with the inferred type exported.
- [ ] Every field has a label, an error message and a default value.
- [ ] Server `details` are mapped to fields.
- [ ] Checked in the browser: invalid input blocks submit, and a server issue lands on the right field.
