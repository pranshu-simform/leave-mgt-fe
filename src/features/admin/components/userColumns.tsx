import { Link } from 'react-router'
import { TONE_CLASSES, type Column } from '@/components/shared'
import { Badge, Button } from '@/components/ui'
import { ROLE_LABELS } from '@/constants/constant'
import { adminRequestsPath } from '@/constants/pathRoutes'
import type { AdminUser } from '@/features/admin/types/adminTypes'

const personColumn: Column<AdminUser> = {
  id: 'name',
  header: 'Person',
  mobile: 'title',
  cell: (user) => (
    <>
      <span className="font-medium">{user.name}</span>
      <span className="block text-caption break-all text-muted-foreground">{user.email}</span>
    </>
  ),
}

const roleColumn: Column<AdminUser> = {
  id: 'role',
  header: 'Role',
  cell: (user) => ROLE_LABELS[user.role],
}

const managerColumn: Column<AdminUser> = {
  id: 'manager',
  header: 'Manager',
  cell: (user) => user.manager?.name ?? 'None',
}

// "Invited" is someone HR added who has not set a password yet.
const statusColumn: Column<AdminUser> = {
  id: 'status',
  header: 'Status',
  mobile: 'status',
  cell: (user) => {
    const [label, tone] = !user.isActive
      ? (['Inactive', TONE_CLASSES.neutral] as const)
      : !user.hasPassword
        ? (['Invited', TONE_CLASSES.warning] as const)
        : (['Active', TONE_CLASSES.success] as const)
    return (
      <Badge variant="outline" className={tone}>
        {label}
      </Badge>
    )
  },
}

// The Balances tab: a person, with the buttons that open their balances and their requests.
export function buildUserColumns(
  onShowBalances: (user: AdminUser) => void,
): readonly Column<AdminUser>[] {
  return [
    personColumn,
    roleColumn,
    managerColumn,
    statusColumn,
    {
      id: 'actions',
      header: 'Actions',
      mobile: 'action',
      align: 'end',
      cell: (user) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label={`Balances of ${user.name}`}
            onClick={() => onShowBalances(user)}
          >
            Balances
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Requests of ${user.name}`}
            render={<Link to={adminRequestsPath(user.id)} />}
            nativeButton={false}
          >
            Requests
          </Button>
        </div>
      ),
    },
  ]
}

// The Users tab: the same person, with a resend button for someone who has not set a password.
// `resendingId` is the person whose link is being sent, so only that button is busy.
export function buildUserManagementColumns(
  onResend: (user: AdminUser) => void,
  resendingId: string | null,
): readonly Column<AdminUser>[] {
  return [
    personColumn,
    roleColumn,
    managerColumn,
    statusColumn,
    {
      id: 'actions',
      header: 'Actions',
      mobile: 'action',
      align: 'end',
      cell: (user) =>
        user.isActive && !user.hasPassword ? (
          <Button
            variant="outline"
            size="sm"
            aria-label={`Resend the set-password link to ${user.name}`}
            disabled={resendingId !== null}
            onClick={() => onResend(user)}
          >
            {resendingId === user.id ? 'Sending…' : 'Resend link'}
          </Button>
        ) : null,
    },
  ]
}
