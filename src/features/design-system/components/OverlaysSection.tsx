import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog, WithTooltip } from '@/components/shared'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { Section } from './Section'

export function OverlaysSection() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <Section
      id="overlays"
      title="Overlays and feedback"
      description="Dialogs, sheets, menus and popovers use the strongest glass. Each traps focus where it should and gives it back on close."
    >
      <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject request</DialogTitle>
              <DialogDescription>Tell Elliot why, so they can plan another time.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Confirm dialog
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Cancel this request?"
          description="Your balance is refunded and your manager is not notified."
          confirmLabel="Cancel request"
          destructive
          onConfirm={() => {
            setConfirmOpen(false)
            toast.success('Request cancelled')
          }}
        />

        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Request details</SheetTitle>
              <SheetDescription>Opens from the side for detail and quick actions.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Overlap</PopoverTitle>
              <PopoverDescription>Two teammates are off on these dates.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Cancel request</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>Tooltip</TooltipTrigger>
          <TooltipContent>Short and plain</TooltipContent>
        </Tooltip>
        <WithTooltip content="Only the owner can edit this request.">
          <Button disabled>Why is this disabled?</Button>
        </WithTooltip>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
        <Button variant="secondary" onClick={() => toast.success('Request submitted')}>
          Success toast
        </Button>
        <Button variant="secondary" onClick={() => toast.info('Balances reset on 1 January')}>
          Info toast
        </Button>
        <Button variant="secondary" onClick={() => toast.warning('Two teammates are already off')}>
          Warning toast
        </Button>
        <Button variant="secondary" onClick={() => toast.error('Not enough balance')}>
          Error toast
        </Button>
      </div>
    </Section>
  )
}
