import { useId, type ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui'

interface ControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormGroupProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  // A function, so the control gets the id and aria wiring it needs.
  children: (controlProps: ControlProps) => ReactNode
}

export function FormGroup({
  label,
  description,
  error,
  required,
  children,
}: Readonly<FormGroupProps>) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger-subtle-foreground">
            *
          </span>
        )}
      </FieldLabel>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {error && (
        <FieldError id={errorId} role="alert">
          {error}
        </FieldError>
      )}
    </Field>
  )
}
