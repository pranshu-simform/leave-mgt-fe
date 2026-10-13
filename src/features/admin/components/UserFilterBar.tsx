import { AppSelect, FormGroup } from '@/components/shared'
import { Button, Input } from '@/components/ui'
import { ROLE_LABELS, USER_ROLES } from '@/constants/constant'

const SEARCH_MAX_LENGTH = 100
const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...Object.values(USER_ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] })),
]
const ACTIVE_OPTIONS = [
  { value: '', label: 'Active and inactive' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

interface UserFilterBarProps {
  text: string
  onTextChange: (text: string) => void
  role: string
  active: string
  onFilterChange: (key: 'role' | 'active', value: string) => void
  isFiltered: boolean
  onClear: () => void
}

// Search, role and status for a people list (the Users and Balances tabs).
export function UserFilterBar({
  text,
  onTextChange,
  role,
  active,
  onFilterChange,
  isFiltered,
  onClear,
}: Readonly<UserFilterBarProps>) {
  return (
    <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,20rem)_repeat(2,minmax(0,12rem))_auto]">
      <FormGroup label="Search people">
        {(controlProps) => (
          <Input
            {...controlProps}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
            autoComplete="off"
            placeholder="Name or email"
          />
        )}
      </FormGroup>
      <FormGroup label="Role">
        {(controlProps) => (
          <AppSelect
            {...controlProps}
            options={ROLE_OPTIONS}
            value={role}
            onValueChange={(value) => onFilterChange('role', value)}
          />
        )}
      </FormGroup>
      <FormGroup label="Status">
        {(controlProps) => (
          <AppSelect
            {...controlProps}
            options={ACTIVE_OPTIONS}
            value={active}
            onValueChange={(value) => onFilterChange('active', value)}
          />
        )}
      </FormGroup>
      {isFiltered && (
        <Button variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
