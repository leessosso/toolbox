import { controlClass } from '../../components/OptionPanel.tsx'
import type { ImageMime } from '../../lib/image.ts'

const LABELS: Record<ImageMime, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
}

export function FormatSelect({
  value,
  onChange,
  formats,
}: {
  value: ImageMime
  onChange: (v: ImageMime) => void
  formats: ImageMime[]
}) {
  return (
    <select
      className={controlClass}
      value={value}
      onChange={(e) => onChange(e.target.value as ImageMime)}
    >
      {formats.map((mime) => (
        <option key={mime} value={mime}>
          {LABELS[mime]}
        </option>
      ))}
    </select>
  )
}

export function QualitySlider({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0.08}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--ink)]"
      />
      <span className="w-10 font-mono text-sm">{Math.round(value * 100)}</span>
    </div>
  )
}
