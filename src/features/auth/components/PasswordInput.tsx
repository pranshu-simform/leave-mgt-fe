import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { Button, Input } from '@/components/ui'

// A password field with a show/hide toggle. It takes the props of an Input (FormGroup's wiring,
// react-hook-form's register) and decides only the type.
export function PasswordInput(props: Readonly<Omit<ComponentProps<typeof Input>, 'type'>>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-10" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
      </Button>
    </div>
  )
}
