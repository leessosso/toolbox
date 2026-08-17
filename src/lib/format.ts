export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  const nbsp = '\u00a0'
  if (bytes < 1024) {
    return `${new Intl.NumberFormat().format(bytes)}${nbsp}B`
  }
  const units = ['KB', 'MB', 'GB']
  let n = bytes / 1024
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  const digits = n >= 100 || i === 0 ? 0 : n >= 10 ? 1 : 2
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number(n.toFixed(digits)))
  return `${formatted}${nbsp}${units[i]}`
}

export function formatDims(width: number, height: number): string {
  return `${width} × ${height}`
}

export function uid(): string {
  return crypto.randomUUID()
}

export function stem(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function parsePageRange(input: string, pageCount: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const pages = new Set<number>()
  for (const part of trimmed.split(',')) {
    const bit = part.trim()
    if (!bit) continue
    const range = bit.split('-').map((s) => s.trim())
    if (range.length === 1) {
      const n = Number(range[0])
      if (n >= 1 && n <= pageCount) pages.add(n)
    } else if (range.length === 2) {
      const a = Number(range[0])
      const b = Number(range[1])
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue
      const from = Math.max(1, Math.min(a, b))
      const to = Math.min(pageCount, Math.max(a, b))
      for (let p = from; p <= to; p++) pages.add(p)
    }
  }
  return [...pages].sort((a, b) => a - b)
}
