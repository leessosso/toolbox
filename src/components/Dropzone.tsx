import { useCallback, useId, useState, type DragEvent } from 'react'

type Props = {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  label?: string
}

export function Dropzone({
  accept,
  multiple = true,
  onFiles,
  label = '파일을 끌어다 놓거나 클릭해서 선택',
}: Props) {
  const id = useId()
  const [over, setOver] = useState(false)

  const take = useCallback(
    (list: FileList | File[] | null) => {
      if (!list) return
      const files = [...list]
      if (files.length) onFiles(files)
    },
    [onFiles],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    take(e.dataTransfer.files)
  }

  return (
    <label
      htmlFor={id}
      onDragEnter={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={`mat-grid relative flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
        over
          ? 'border-[color:var(--safe)] bg-[color:color-mix(in_srgb,var(--safe)_12%,transparent)]'
          : 'border-[color:var(--line)] bg-[color:var(--bg-elev)]'
      }`}
    >
      <input
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
      <span className="font-display text-2xl font-bold tracking-tight">DROP</span>
      <p className="mt-2 max-w-md text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-xs text-[color:var(--muted)]">
        클립보드 붙여넣기도 됩니다 (Ctrl/⌘ + V)
      </p>
    </label>
  )
}
