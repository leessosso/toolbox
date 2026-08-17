import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { Field, OptionPanel, btnGhost, btnPrimary, controlClass } from '../../components/OptionPanel.tsx'
import { downloadBlob } from '../../lib/download.ts'

type Preset = 'text' | 'url' | 'wifi' | 'vcard'

const presets: Preset[] = ['text', 'url', 'wifi', 'vcard']

export default function QrGenerate() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('preset')
  const preset: Preset = presets.includes(raw as Preset) ? (raw as Preset) : 'text'
  const setPreset = (id: Preset) => {
    const sp = new URLSearchParams(params)
    if (id === 'text') sp.delete('preset')
    else sp.set('preset', id)
    setParams(sp, { replace: true })
  }
  const [text, setText] = useState('https://')
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [hidden, setHidden] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [size, setSize] = useState(320)
  const [dark, setDark] = useState('#111111')
  const [light, setLight] = useState('#ffffff')
  const [png, setPng] = useState<string>('')
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const payload = useCallback(() => {
    if (preset === 'wifi') {
      return `WIFI:T:WPA;S:${ssid};P:${password};H:${hidden};;`
    }
    if (preset === 'vcard') {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n')
    }
    return text
  }, [preset, ssid, password, hidden, name, phone, email, text])

  const generate = useCallback(async () => {
    setError(null)
    const value = payload()
    if (!value.trim()) {
      setError('내용을 입력하세요.')
      return
    }
    try {
      const url = await QRCode.toDataURL(value, {
        errorCorrectionLevel: ecc,
        width: size,
        margin: 2,
        color: { dark, light },
      })
      const svgStr = await QRCode.toString(value, {
        type: 'svg',
        errorCorrectionLevel: ecc,
        width: size,
        margin: 2,
        color: { dark, light },
      })
      setPng(url)
      setSvg(svgStr)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [payload, ecc, size, dark, light])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void generate()
    }, 200)
    return () => window.clearTimeout(t)
  }, [generate])

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold">QR 코드</h1>
        <p className="text-sm text-[color:var(--muted)]">
          텍스트, 링크, Wi-Fi, 명함. PNG와 SVG로 저장합니다.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['text', '텍스트'],
            ['url', 'URL'],
            ['wifi', 'Wi-Fi'],
            ['vcard', '연락처'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={preset === id ? btnPrimary : btnGhost}
            onClick={() => setPreset(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <OptionPanel>
        {preset === 'wifi' ? (
          <>
            <Field label="네트워크 이름">
              <input
                className={controlClass}
                name="ssid"
                autoComplete="off"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
              />
            </Field>
            <Field label="비밀번호">
              <input
                className={controlClass}
                type="password"
                name="wifi-password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="숨겨진 네트워크">
              <input
                type="checkbox"
                className="mt-3 h-5 w-5 accent-[color:var(--ink)]"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
              />
            </Field>
          </>
        ) : preset === 'vcard' ? (
          <>
            <Field label="이름">
              <input
                className={controlClass}
                name="fn"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="전화">
              <input
                className={controlClass}
                type="tel"
                inputMode="tel"
                name="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="이메일">
              <input
                className={controlClass}
                type="email"
                inputMode="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </>
        ) : (
          <Field label={preset === 'url' ? 'URL' : '텍스트'}>
            <textarea
              className={`${controlClass} min-h-24 sm:col-span-2`}
              name={preset === 'url' ? 'url' : 'text'}
              autoComplete="off"
              inputMode={preset === 'url' ? 'url' : undefined}
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
        )}
        <Field label="오류 정정">
          <select className={controlClass} value={ecc} onChange={(e) => setEcc(e.target.value as typeof ecc)}>
            <option value="L">L (7%)</option>
            <option value="M">M (15%)</option>
            <option value="Q">Q (25%)</option>
            <option value="H">H (30%)</option>
          </select>
        </Field>
        <Field label="크기 (px)">
          <input
            className={controlClass}
            type="number"
            min={128}
            max={1024}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </Field>
        <Field label="전경">
          <input type="color" className="h-10 w-full rounded-md border border-[color:var(--line)]" value={dark} onChange={(e) => setDark(e.target.value)} />
        </Field>
        <Field label="배경">
          <input type="color" className="h-10 w-full rounded-md border border-[color:var(--line)]" value={light} onChange={(e) => setLight(e.target.value)} />
        </Field>
      </OptionPanel>

      <button type="button" className={btnPrimary} onClick={() => void generate()}>
        생성
      </button>
      {error && (
        <p className="text-sm text-[color:var(--danger)]" role="alert">
          {error}
        </p>
      )}

      {png && (
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <img src={png} alt="QR 미리보기" className="rounded-md border border-[color:var(--line)]" width={size} height={size} />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={btnGhost}
              onClick={async () => {
                const res = await fetch(png)
                downloadBlob(await res.blob(), 'qr.png')
              }}
            >
              PNG 저장
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() =>
                downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qr.svg')
              }
            >
              SVG 저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
