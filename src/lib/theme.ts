const KEY = 'toolbox-theme'
const LEGACY_KEY = 'darkroom-theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export function getStoredTheme(): ThemeMode {
  const v = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
  if (v === 'light' || v === 'dark' || v === 'system') return v
  return 'system'
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  localStorage.setItem(KEY, mode)
  const color = resolved === 'dark' ? '#111111' : '#f6f6f6'
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.append(meta)
  }
  meta.setAttribute('content', color)
}

export function applyStoredTheme() {
  applyTheme(getStoredTheme())
}
