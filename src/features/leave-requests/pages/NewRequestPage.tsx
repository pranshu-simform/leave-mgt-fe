import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/shared'
import { PATH_ROUTES, requestDetailPath } from '@/constants/pathRoutes'
import { RequestForm } from '@/features/leave-requests/components/RequestForm'
import { useSubmitRequest } from '@/features/leave-requests/hooks/useSubmitRequest'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import {
  parsePrefill,
  type LeaveRequestFormData,
} from '@/features/leave-requests/schemas/leaveRequestSchema'

const EMPTY_FORM: LeaveRequestFormData = { leaveTypeId: '', startDate: '', endDate: '', note: '' }

export default function NewRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const submit = useSubmitRequest()
  // "Cancel and resubmit" opens the form with the old values; read once, each one validated.
  const [defaultValues] = useState<LeaveRequestFormData>(() => ({
    ...EMPTY_FORM,
    ...parsePrefill(searchParams),
  }))

  const done = useCallback(
    (request: LeaveRequest) => void navigate(requestDetailPath(request.id)),
    [navigate],
  )

  return (
    <>
      <PageHeader
        title="Request leave"
        description="Pick a type and your dates. The preview shows what the request would do before you send it."
        breadcrumbs={[
          { label: 'My requests', to: PATH_ROUTES.REQUESTS.PATH },
          { label: 'New request' },
        ]}
      />
      <RequestForm
        mode="create"
        defaultValues={defaultValues}
        cancelTo={PATH_ROUTES.REQUESTS.PATH}
        onSubmit={(values) =>
          submit.mutateAsync({
            leaveTypeId: values.leaveTypeId,
            startDate: values.startDate,
            endDate: values.endDate,
            note: values.note.trim() || undefined,
          })
        }
        onDone={done}
      />
    </>
  )
}
