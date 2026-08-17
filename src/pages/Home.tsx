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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--bg-elev)] px-6 py-12 shadow-[var(--shadow)] sm:px-12">
        <div className="mat-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative max-w-2xl space-y-5">
          <p className="font-mono text-xs tracking-[0.28em] text-[color:var(--safe)] uppercase">
            Once or twice a year
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            암실에서
            <br />
            끝내는 잡일.
          </h1>
          <p className="text-lg text-[color:var(--muted)]">
            PDF를 이미지로, 해상도를 줄이고, QR을 뽑는 일. 일 년에 한두 번이지만
            그때마다 광고 사이트에 파일을 올리고 싶지 않았습니다.
          </p>
          <PrivacyBadge />
        </div>
      </section>

      <label className="block max-w-xl">
        <span className="sr-only">도구 검색</span>
        <input
          className={controlClass}
          placeholder="도구 검색 — pdf, 압축, qr…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {order.map((cat) => {
        const group = filtered.filter((t) => t.category === cat)
        if (!group.length) return null
        return (
          <section key={cat} className="space-y-4">
            <h2 className="font-display text-2xl font-bold">{categoryLabel[cat]}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/t/${tool.id}`}
                    className="block h-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elev)] p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--safe)] hover:shadow-[var(--shadow)]"
                  >
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[color:var(--muted)] uppercase">
                      {tool.id}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold">{tool.name}</h3>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
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
