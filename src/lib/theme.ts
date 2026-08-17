const KEY = 'darkroom-theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export function getStoredTheme(): ThemeMode {
  const v = localStorage.getItem(KEY)
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
}

export function applyStoredTheme() {
  applyTheme(getStoredTheme())
}
