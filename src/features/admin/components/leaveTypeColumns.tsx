import { PencilIcon } from 'lucide-react'
import { TONE_CLASSES, type Column } from '@/components/shared'
import { Badge, Button } from '@/components/ui'
import type { AdminLeaveType } from '@/features/admin/types/adminTypes'
import { formatDays } from '@/features/admin/utils/formatDays'

export function buildLeaveTypeColumns(
  onEdit: (leaveType: AdminLeaveType) => void,
): readonly Column<AdminLeaveType>[] {
  return [
    {
      id: 'name',
      header: 'Leave type',
      mobile: 'title',
      className: 'font-medium',
      cell: (type) => type.name,
    },
    {
      id: 'balance',
      header: 'Balance',
      className: 'whitespace-nowrap',
      cell: (type) =>
        type.drawsFromBalance ? formatDays(type.defaultAllowanceDays) : 'No balance',
    },
    {
      id: 'approval',
      header: 'Approval',
      cell: (type) => (type.requiresApproval ? 'Required' : 'Automatic'),
    },
    {
      id: 'notice',
      header: 'Notice',
      className: 'whitespace-nowrap',
      cell: (type) => (type.minNoticeDays === 0 ? 'None' : formatDays(type.minNoticeDays)),
    },
    {
      id: 'longest',
      header: 'Longest',
      className: 'whitespace-nowrap',
      cell: (type) =>
        type.maxConsecutiveDays === null ? 'No limit' : formatDays(type.maxConsecutiveDays),
    },
    {
      id: 'status',
      header: 'Status',
      mobile: 'status',
      cell: (type) => (
        <Badge
          variant="outline"
          className={type.isActive ? TONE_CLASSES.success : TONE_CLASSES.neutral}
        >
          {type.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Edit',
      mobile: 'action',
      align: 'end',
      cell: (type) => (
        <Button
          variant="outline"
          size="sm"
          aria-label={`Edit ${type.name}`}
          onClick={() => onEdit(type)}
        >
          <PencilIcon aria-hidden="true" />
          Edit
        </Button>
      ),
    },
  ]
}
