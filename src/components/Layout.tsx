import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle.tsx'

export function Layout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight">
              Toolbox
            </span>
          </NavLink>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-sm text-[color:var(--muted)]">
        파일은 서버로 올라가지 않습니다.
      </footer>
    </div>
  )
}
