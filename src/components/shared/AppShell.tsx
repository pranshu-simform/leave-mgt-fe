import { CalendarCheck2Icon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui'
import { ThemeToggle } from './ThemeToggle'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

interface AppShellProps {
  navItems: NavItem[]
  brand?: string
  // Where the signed-in user's menu goes (Phase 8).
  userMenu?: ReactNode
  children: ReactNode
}

function NavMenu({ navItems }: Readonly<{ navItems: NavItem[] }>) {
  const { pathname } = useLocation()
  const { state, isMobile, setOpenMobile } = useSidebar()
  // A tooltip only helps when the sidebar is collapsed to icons. Otherwise it is a second thing
  // that swallows the first Escape press.
  const showTooltip = state === 'collapsed' && !isMobile

  return (
    <SidebarMenu>
      {navItems.map(({ label, to, icon: Icon, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to)
        return (
          <SidebarMenuItem key={to}>
            <SidebarMenuButton
              isActive={active}
              tooltip={showTooltip ? label : undefined}
              onClick={() => setOpenMobile(false)}
              render={<NavLink to={to} end={end} />}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

// The frame of every signed-in page. It knows nothing about roles: the caller passes the nav items.
export function AppShell({
  navItems,
  brand = 'Leave & Attendance',
  userMenu,
  children,
}: Readonly<AppShellProps>) {
  return (
    <SidebarProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-primary-foreground shadow-glow">
              <CalendarCheck2Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="truncate text-label font-semibold group-data-[collapsible=icon]:hidden">
              {brand}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <NavMenu navItems={navItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {userMenu && <SidebarFooter>{userMenu}</SidebarFooter>}
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 flex h-header items-center gap-2 px-gutter glass-raised">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="h-5 self-center" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-content flex-1 animate-fade-rise px-gutter py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
