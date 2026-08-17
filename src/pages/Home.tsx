import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PrivacyBadge } from '../components/PrivacyBadge.tsx'
import { controlClass } from '../components/OptionPanel.tsx'
import { categoryLabel, tools, type ToolCategory } from '../tools/registry.ts'

const order: ToolCategory[] = ['pdf', 'image', 'text', 'generate']

export default function Home() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return tools
    return tools.filter((t) =>
      [t.name, t.description, t.id, categoryLabel[t.category]]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="sr-only">toolbox</h1>
          <PrivacyBadge />
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">도구 검색</span>
          <input
            className={controlClass}
            placeholder="검색 — pdf, 압축, qr…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      {order.map((cat) => {
        const group = filtered.filter((t) => t.category === cat)
        if (!group.length) return null
        return (
          <section key={cat} className="space-y-3">
            <h2 className="font-display text-lg font-bold">{categoryLabel[cat]}</h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/t/${tool.id}`}
                    className="block h-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-elev)] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[color:var(--safe)] hover:shadow-[var(--shadow)]"
                  >
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[color:var(--muted)] uppercase">
                      {tool.id}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold">{tool.name}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {tool.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {filtered.length === 0 && (
        <p className="text-[color:var(--muted)]">맞는 도구가 없습니다.</p>
      )}
    </div>
  )
}
