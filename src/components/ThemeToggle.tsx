import { useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  type ThemeMode,
} from '../lib/theme.ts'
import { controlClass } from './OptionPanel.tsx'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme())

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
    <select
      aria-label="테마"
      className={`${controlClass} w-auto py-1.5 text-sm`}
      value={mode}
      onChange={(e) => setMode(e.target.value as ThemeMode)}
    >
      <option value="system">시스템</option>
      <option value="light">라이트</option>
      <option value="dark">다크룸</option>
    </select>
  )
}
