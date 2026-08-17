import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { controlClass } from '../components/OptionPanel.tsx'
import { categoryLabel, tools, type ToolCategory } from '../tools/registry.ts'

const order: ToolCategory[] = ['pdf', 'image', 'text', 'generate']

export default function Home() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
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
      <div className="max-w-xs">
        <h1 className="sr-only">Toolbox</h1>
        <label className="block">
          <span className="sr-only">도구 검색</span>
          <input
            className={controlClass}
            name="q"
            autoComplete="off"
            placeholder="검색…"
            value={q}
            onChange={(e) => {
              const next = new URLSearchParams(params)
              const value = e.target.value
              if (value) next.set('q', value)
              else next.delete('q')
              setParams(next, { replace: true })
            }}
          />
        </label>
      </div>

      {order.map((cat) => {
        const group = filtered.filter((t) => t.category === cat)
        if (!group.length) return null
        return (
          <section key={cat} className="space-y-2">
            <h2 className="text-sm font-semibold text-[color:var(--muted)]">{categoryLabel[cat]}</h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((tool) => (
                <li key={tool.id} className="min-w-0">
                  <Link
                    to={`/t/${tool.id}`}
                    className="block h-full rounded-md border border-[color:var(--line)] bg-[color:var(--bg-elev)] px-3 py-3 hover:bg-[color:var(--chip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)]"
                  >
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">
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
