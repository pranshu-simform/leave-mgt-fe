import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

export interface SelectOption {
  value: string
  label: string
}

interface AppSelectProps {
  options: readonly SelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'default'
  className?: string
  // The wiring FormGroup hands to its control, or an `aria-label` when there is no visible label.
  id?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// A select over a plain options list: the shadcn Select needs the items twice (for the label of the
// current value and for the popup), and this keeps that in one place.
export function AppSelect({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  size,
  className,
  ...controlProps
}: Readonly<AppSelectProps>) {
  return (
    <Select
      items={options as SelectOption[]}
      value={value}
      onValueChange={(next) => onValueChange(next ?? '')}
      disabled={disabled}
    >
      <SelectTrigger size={size} className={className ?? 'w-full'} {...controlProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
