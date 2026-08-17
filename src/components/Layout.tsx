import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle.tsx'

const gutter =
  'px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]'

export function Layout() {
  return (
    <div className="min-h-svh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-[max(1rem,env(safe-area-inset-left))] focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:z-50 focus:rounded-lg focus:bg-[color:var(--safe)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--safe-fg)]"
      >
        본문으로 건너뛰기
      </a>
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_88%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 py-2 ${gutter}`}>
          <NavLink
            to="/"
            translate="no"
            className="rounded-sm font-display text-xl font-extrabold tracking-tight transition-[color] hover:text-[color:var(--safe)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--safe)]"
          >
            Toolbox
          </NavLink>
          <ThemeToggle />
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className={`mx-auto max-w-6xl py-5 ${gutter}`}
      >
        <Outlet />
      </main>
      <footer
        className={`mx-auto max-w-6xl pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-[color:var(--muted)] ${gutter}`}
      >
        파일은 서버로 올라가지 않습니다.
      </footer>
    </div>
  )
}
