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
      <span className="text-[color:var(--muted)]">{label}</span>
      {children}
    </label>
  )
}

export function OptionPanel({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-md border border-[color:var(--line)] bg-[color:var(--bg-elev)] p-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}

export const controlClass =
  'w-full rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] px-3 py-2 text-[color:var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)]'

export const btnPrimary =
  'inline-flex items-center justify-center rounded-md bg-[color:var(--safe)] px-3 py-2 text-sm font-medium text-[color:var(--safe-fg)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)] disabled:cursor-not-allowed disabled:opacity-40'

export const btnGhost =
  'inline-flex items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--bg-elev)] px-3 py-2 text-sm font-medium text-[color:var(--ink)] hover:bg-[color:var(--chip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)] disabled:opacity-40'
