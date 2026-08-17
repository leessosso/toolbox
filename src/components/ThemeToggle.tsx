import { useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  type ThemeMode,
} from '../lib/theme.ts'

const order: ThemeMode[] = ['system', 'light', 'dark']
const label: Record<ThemeMode, string> = {
  system: '시스템',
  light: '라이트',
  dark: '다크',
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme())
  const next = order[(order.indexOf(mode) + 1) % order.length]

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (getStoredTheme() === 'system') applyTheme('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <button
      type="button"
      aria-label={`테마 ${label[mode]}, 누르면 ${label[next]}`}
      title={`테마: ${label[mode]} → ${label[next]}`}
      className="grid h-11 w-11 place-items-center rounded-md text-[color:var(--muted)] transition-[color] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--safe)]"
      onClick={() => setMode(next)}
    >
      {mode === 'light' ? (
        <SunIcon />
      ) : mode === 'dark' ? (
        <MoonIcon />
      ) : (
        <SystemIcon />
      )}
    </button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12.5 10.2A5.2 5.2 0 0 1 5.8 3.5 5.2 5.2 0 1 0 12.5 10.2Z" />
    </svg>
  )
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="3.5" width="11" height="8" rx="1.2" />
      <path d="M6 13h4" />
    </svg>
  )
}
