import { Link } from 'react-router'
import { TONE_CLASSES, type Column } from '@/components/shared'
import { Badge, Button } from '@/components/ui'
import { ROLE_LABELS } from '@/constants/constant'
import { adminRequestsPath } from '@/constants/pathRoutes'
import type { AdminUser } from '@/features/admin/types/adminTypes'

export function buildUserColumns(
  onShowBalances: (user: AdminUser) => void,
): readonly Column<AdminUser>[] {
  return [
    {
      id: 'name',
      header: 'Person',
      mobile: 'title',
      cell: (user) => (
        <>
          <span className="font-medium">{user.name}</span>
          <span className="block text-caption break-all text-muted-foreground">{user.email}</span>
        </>
      ),
    },
    { id: 'role', header: 'Role', cell: (user) => ROLE_LABELS[user.role] },
    { id: 'manager', header: 'Manager', cell: (user) => user.manager?.name ?? 'None' },
    {
      id: 'status',
      header: 'Status',
      mobile: 'status',
      cell: (user) => (
        <Badge
          variant="outline"
          className={user.isActive ? TONE_CLASSES.success : TONE_CLASSES.neutral}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
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
