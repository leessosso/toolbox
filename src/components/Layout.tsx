import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle.tsx'

export function Layout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight">
              DARKROOM
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-[color:var(--muted)] uppercase sm:inline">
              local tools
            </span>
          </NavLink>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-12 text-sm text-[color:var(--muted)]">
        암실처럼, 작업물은 밖으로 나가지 않습니다.
      </footer>
    </div>
  )
}
