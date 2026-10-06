import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { StatusBadge, TONE_CLASSES } from '@/components/shared'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Calendar,
  Card,
  CardContent,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Progress,
  ProgressLabel,
  ProgressValue,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { LEAVE_STATUSES } from '@/constants/leaveStatus'
import { cn } from '@/lib/utils'
import { Section, Subsection } from './Section'

const ROWS = [
  { id: 'LR-1042', type: 'Annual leave', dates: '12 Oct to 14 Oct', days: 3, status: 'PENDING' },
  { id: 'LR-1031', type: 'Sick leave', dates: '2 Oct', days: 1, status: 'APPROVED' },
  { id: 'LR-1019', type: 'Annual leave', dates: '21 Sep to 25 Sep', days: 5, status: 'REJECTED' },
  { id: 'LR-1004', type: 'Unpaid leave', dates: '1 Sep to 2 Sep', days: 2, status: 'CANCELLED' },
] as const

const TONE_ALERTS = [
  { tone: 'info', icon: InfoIcon, title: 'Info', text: 'Balances reset on 1 January.' },
  { tone: 'success', icon: CircleCheckIcon, title: 'Success', text: 'Your request was submitted.' },
  {
    tone: 'warning',
    icon: TriangleAlertIcon,
    title: 'Warning',
    text: 'Two teammates are already off on these dates.',
  },
  {
    tone: 'danger',
    icon: CircleAlertIcon,
    title: 'Error',
    text: 'You do not have enough balance for this request.',
  },
] as const

export function DataDisplaySection() {
  const [range, setRange] = useState<DateRange | undefined>()
  return (
    <Section
      id="data"
      title="Data display"
      description="Tables sit on one glass card with plain rows. Status is a badge with an icon and a label, never color alone."
    >
      <Subsection title="Status badges">
        <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 glass">
          {LEAVE_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <Separator orientation="vertical" className="h-5" />
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
        </div>
      </Subsection>

      <Subsection title="Alerts">
        <div className="grid gap-3 md:grid-cols-2">
          {TONE_ALERTS.map(({ tone, icon: Icon, title, text }) => (
            <Alert key={tone} className={cn(TONE_CLASSES[tone])}>
              <Icon aria-hidden="true" />
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription className="text-current">{text}</AlertDescription>
            </Alert>
          ))}
        </div>
      </Subsection>

      <Subsection title="Table and pagination">
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.dates}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.days}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#data" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#data" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#data">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#data" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Subsection>

      <div className="grid gap-6 lg:grid-cols-2">
        <Subsection title="Progress, tabs, avatar, skeleton">
          <div className="flex flex-col gap-5 rounded-xl p-4 glass">
            <Progress value={60}>
              <ProgressLabel>Annual leave used</ProgressLabel>
              <ProgressValue />
            </Progress>
            <Tabs defaultValue="mine">
              <TabsList>
                <TabsTrigger value="mine">Mine</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              <TabsContent value="mine" className="pt-2 text-muted-foreground">
                Your own requests.
              </TabsContent>
              <TabsContent value="team" className="pt-2 text-muted-foreground">
                Requests from your team.
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>EE</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        </Subsection>
        <Subsection title="Calendar (date range)">
          <div className="flex justify-center rounded-xl p-2 glass">
            <Calendar mode="range" selected={range} onSelect={setRange} />
          </div>
        </Subsection>
      </div>
    </Section>
  )
}
