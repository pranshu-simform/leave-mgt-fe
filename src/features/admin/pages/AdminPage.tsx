import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { BalancesPanel } from '@/features/admin/components/BalancesPanel'
import { HolidaysPanel } from '@/features/admin/components/HolidaysPanel'
import { LeaveTypesPanel } from '@/features/admin/components/LeaveTypesPanel'
import { RequestsPanel } from '@/features/admin/components/RequestsPanel'

const TAB_PARAM = 'tab'
const TABS = [
  { value: 'leave-types', label: 'Leave types' },
  { value: 'holidays', label: 'Holidays' },
  { value: 'balances', label: 'Balances' },
  { value: 'requests', label: 'Requests' },
] as const
const DEFAULT_TAB = TABS[0].value

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get(TAB_PARAM)
  const tab = TABS.find((candidate) => candidate.value === requested)?.value ?? DEFAULT_TAB

  // A new tab starts clean: the page, size and year of the other tab do not carry over. It adds a
  // history entry, so Back returns to the previous tab.
  const changeTab = (value: string) =>
    setSearchParams(value === DEFAULT_TAB ? {} : { [TAB_PARAM]: value })

  return (
    <>
      <PageHeader title="Admin" description="Leave types, holidays, balances and requests" />
      <Tabs value={tab} onValueChange={(value) => changeTab(String(value))}>
        <TabsList className="max-w-full justify-start overflow-x-auto overflow-y-hidden">
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="leave-types" className="mt-4">
          <LeaveTypesPanel />
        </TabsContent>
        <TabsContent value="holidays" className="mt-4">
          <HolidaysPanel />
        </TabsContent>
        <TabsContent value="balances" className="mt-4">
          <BalancesPanel />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <RequestsPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}
