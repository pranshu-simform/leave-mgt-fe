import { Link, Outlet } from 'react-router'

export function RootLayout() {
  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link to="/" className="font-semibold">
          Leave & Attendance
        </Link>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
