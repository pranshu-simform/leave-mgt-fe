import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui'
import { ROLE_LABELS } from '@/constants/constant'
import { useLogout } from '@/features/auth/hooks/useLogout'
import type { AuthUser } from '@/features/auth/types/authTypes'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function UserMenu({ user }: Readonly<{ user: AuthUser }>) {
  const { mutate: logout, isPending } = useLogout()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" aria-label="Account menu" />}>
            <Avatar size="sm">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-label">{user.name}</span>
              <span className="truncate text-caption text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <ChevronsUpDownIcon aria-hidden="true" className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-56">
            <div className="flex flex-col px-2 py-1.5">
              <span className="text-label">{user.name}</span>
              <span className="truncate text-caption text-muted-foreground">{user.email}</span>
            </div>
            <DropdownMenuItem disabled={isPending} onClick={() => logout()}>
              <LogOutIcon aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
