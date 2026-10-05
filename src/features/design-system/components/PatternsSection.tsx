import { CalendarXIcon, PlusIcon } from 'lucide-react'
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
  FormGroup,
  PageHeader,
  PageLoader,
  TableSkeleton,
} from '@/components/shared'
import { Button, Input } from '@/components/ui'
import { Section, Subsection } from './Section'

export function PatternsSection() {
  return (
    <Section
      id="patterns"
      title="Shared patterns"
      description="The pieces every screen reuses. Each list and page handles loading, empty and error states with these."
    >
      <Subsection title="PageHeader">
        <div className="rounded-xl p-5 glass">
          <PageHeader
            title="My leave requests"
            description="Everything you have asked for, newest first."
            breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Requests' }]}
            actions={
              <Button>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                New request
              </Button>
            }
          />
        </div>
      </Subsection>

      <div className="grid gap-6 lg:grid-cols-2">
        <Subsection title="EmptyState">
          <EmptyState
            icon={CalendarXIcon}
            title="No requests yet"
            description="When you ask for time off, it shows up here."
            action={<Button variant="outline">Request leave</Button>}
          />
        </Subsection>
        <Subsection title="ErrorState">
          <ErrorState
            message="We could not load your requests. Check your connection."
            onRetry={() => undefined}
          />
        </Subsection>
        <Subsection title="TableSkeleton">
          <div className="rounded-xl p-4 glass">
            <TableSkeleton rows={4} columns={4} />
          </div>
        </Subsection>
        <Subsection title="CardSkeleton and PageLoader">
          <div className="flex flex-col gap-4">
            <CardSkeleton />
            <PageLoader label="Loading requests" />
          </div>
        </Subsection>
      </div>

      <Subsection title="FormGroup with a server error">
        <div className="max-w-sm rounded-xl p-5 glass">
          <FormGroup label="Email" error="Enter a valid email address." required>
            {(controlProps) => <Input {...controlProps} defaultValue="elliot@" />}
          </FormGroup>
        </div>
      </Subsection>
    </Section>
  )
}
