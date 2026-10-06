import { useState } from 'react'
import { FormGroup } from '@/components/shared'
import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { Section, Subsection } from './Section'

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual leave' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'unpaid', label: 'Unpaid leave' },
]

export function FormsSection() {
  const [type, setType] = useState<string | null>('annual')
  return (
    <Section
      id="forms"
      title="Forms"
      description="Every control sits in a FormGroup, which wires the label, description and error with the right aria attributes. Control edges keep 3:1 contrast, so fields stay visible on glass."
    >
      <div className="grid gap-6 rounded-xl p-5 glass md:grid-cols-2">
        <FormGroup label="Full name" description="As it appears on your contract." required>
          {(controlProps) => <Input {...controlProps} placeholder="Elliot Evans" />}
        </FormGroup>
        <FormGroup label="Leave type">
          {(controlProps) => (
            <Select items={LEAVE_TYPES} value={type} onValueChange={setType}>
              <SelectTrigger {...controlProps} className="w-full">
                <SelectValue placeholder="Choose a type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormGroup>
        <FormGroup label="Start date" error="Start date cannot be in the past." required>
          {(controlProps) => <Input {...controlProps} defaultValue="2026-09-01" />}
        </FormGroup>
        <FormGroup label="Note">
          {(controlProps) => (
            <Textarea {...controlProps} placeholder="Optional context for your manager" />
          )}
        </FormGroup>
        <FormGroup label="Disabled">
          {(controlProps) => <Input {...controlProps} disabled defaultValue="Not editable" />}
        </FormGroup>
        <Subsection title="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="design-system-terms" defaultChecked />
            <Label htmlFor="design-system-terms">I have arranged a handover</Label>
          </div>
        </Subsection>
      </div>
    </Section>
  )
}
