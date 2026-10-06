import { CalendarCheck2Icon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
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
import { APP_NAME } from '@/constants/constant'
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
  // Where the signed-in user's menu goes.
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
  brand = APP_NAME,
  userMenu,
  children,
}: Readonly<AppShellProps>) {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef(pathname)

  // After a navigation focus moves to the page, so a keyboard or screen reader user starts there and
  // not on the link they just used. A new query string (a filter, the review sheet) is not one.
  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  const skipToContent = (event: MouseEvent) => {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only z-50 rounded-md bg-popover text-label shadow-lg ring-2 ring-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
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
              <nav aria-label="Main">
                <NavMenu navItems={navItems} />
              </nav>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {userMenu && <SidebarFooter>{userMenu}</SidebarFooter>}
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 bg-transparent">
        {/* A floating bar with the same extent as the page content (so its edges match the cards below
            it) and the same top gap as the sidebar card. The outer element only holds the gap. */}
        <header className="sticky top-0 z-20 pt-2">
          <div className="mx-auto w-full max-w-content px-gutter">
            <div className="flex h-header items-center justify-between gap-2 rounded-xl px-2 glass-raised">
              <SidebarTrigger size="icon" aria-label="Toggle navigation" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto w-full max-w-content flex-1 animate-fade-rise px-gutter py-6 outline-none"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
