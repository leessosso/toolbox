import type { ReactNode } from 'react'

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm">
      <span className="font-medium tracking-wide text-[color:var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  )
}

export function OptionPanel({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elev)] p-4 shadow-[var(--shadow)] sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}

export const controlClass =
  'w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg)] px-3 py-2 text-[color:var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--safe)]'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--safe)] px-5 py-2.5 font-semibold text-[color:var(--safe-fg)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40'

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-elev)] px-4 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--safe)] disabled:opacity-40'
