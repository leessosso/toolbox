import { useMemo, useState } from 'react'
import { btnGhost, controlClass } from '../../components/OptionPanel.tsx'

type Mode = 'json' | 'base64' | 'url' | 'hash' | 'case'

async function sha(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', text: string) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function TextUtils() {
  const [mode, setMode] = useState<Mode>('json')
  const [input, setInput] = useState('')
  const [hashAlgo, setHashAlgo] = useState<'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-256')
  const [hash, setHash] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const computed = useMemo(() => {
    try {
      if (mode === 'json') {
        if (!input.trim()) return { output: '', error: null }
        return { output: JSON.stringify(JSON.parse(input), null, 2), error: null }
      }
      if (mode === 'base64') {
        return { output: btoa(unescape(encodeURIComponent(input))), error: null }
      }
      if (mode === 'url') {
        return { output: encodeURIComponent(input), error: null }
      }
      return { output: '', error: null }
    } catch (err) {
      return { output: '', error: err instanceof Error ? err.message : String(err) }
    }
  }, [input, mode])

  const runHash = async () => {
    setHash(await sha(hashAlgo, input))
  }

  const decodeBase64 = () => {
    try {
      setInput(decodeURIComponent(escape(atob(input))))
      setActionError(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '디코드 실패')
    }
  }

  const minifyJson = () => {
    try {
      setInput(JSON.stringify(JSON.parse(input)))
      setActionError(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  const shown =
    mode === 'hash'
      ? hash
      : mode === 'case'
        ? input
        : computed.output

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">텍스트 유틸</h1>
        <p className="text-sm text-[color:var(--muted)]">
          JSON 정리, Base64, URL 인코딩, SHA 해시.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['json', 'JSON'],
            ['base64', 'Base64'],
            ['url', 'URL'],
            ['hash', '해시'],
            ['case', '대소문자'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={btnGhost}
            style={mode === id ? { borderColor: 'var(--safe)' } : undefined}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-[color:var(--muted)]">입력</span>
          <textarea
            className={`${controlClass} min-h-72 resize-y font-mono text-sm`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-[color:var(--muted)]">출력</span>
          <textarea
            readOnly
            className={`${controlClass} min-h-72 resize-y font-mono text-sm`}
            value={
              mode === 'case'
                ? `${input.toUpperCase()}\n---\n${input.toLowerCase()}\n---\n${input
                    .split('\n')
                    .sort((a, b) => a.localeCompare(b))
                    .join('\n')}`
                : shown
            }
            spellCheck={false}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {mode === 'json' && (
          <>
            <button type="button" className={btnGhost} onClick={minifyJson}>
              한 줄로 압축
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                try {
                  JSON.parse(input)
                  setActionError('유효한 JSON입니다.')
                } catch (err) {
                  setActionError(err instanceof Error ? err.message : String(err))
                }
              }}
            >
              검증
            </button>
          </>
        )}
        {mode === 'base64' && (
          <button type="button" className={btnGhost} onClick={decodeBase64}>
            Base64 → 텍스트
          </button>
        )}
        {mode === 'url' && (
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              try {
                setInput(decodeURIComponent(input))
                setActionError(null)
              } catch (err) {
                setActionError(err instanceof Error ? err.message : String(err))
              }
            }}
          >
            URL 디코드
          </button>
        )}
        {mode === 'hash' && (
          <>
            <select
              className={`${controlClass} w-auto`}
              value={hashAlgo}
              onChange={(e) => setHashAlgo(e.target.value as typeof hashAlgo)}
            >
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-512">SHA-512</option>
            </select>
            <button type="button" className={btnGhost} onClick={() => void runHash()}>
              해시 계산
            </button>
          </>
        )}
        <button
          type="button"
          className={btnGhost}
          onClick={() => void navigator.clipboard.writeText(
            mode === 'case'
              ? input.toUpperCase()
              : shown,
          )}
        >
          출력 복사
        </button>
      </div>
      {(actionError || computed.error) && (
        <p className="text-sm text-[color:var(--safe)]">{actionError || computed.error}</p>
      )}
    </div>
  )
}
