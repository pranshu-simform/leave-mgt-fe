import { useApiHealth } from '@/features/dashboard/hooks/useApiHealth'
import { isApiError } from '@/lib/apiClient'

export default function DashboardPage() {
  const { data, error, isPending } = useApiHealth()

  let apiStatus = 'API: checking...'
  if (data) {
    apiStatus = `API: ${data.status}`
  } else if (error) {
    const detail = isApiError(error) ? `${error.code}, status ${error.status}` : error.message
    apiStatus = `API: unreachable (${detail})`
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Leave & Attendance</h1>
      <p className="text-muted-foreground">
        Frontend scaffold is wired up - dashboard, calendar and approvals pages land here.
      </p>
      <output aria-busy={isPending} className="block text-sm">
        {apiStatus}
      </output>
    </div>
  )
}
