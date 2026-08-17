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
      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-5 text-center ${
        over
          ? 'select-none border-[color:var(--ink)] bg-[color:var(--chip)]'
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
      <p className="text-sm">{label}</p>
      <p className="mt-1 text-xs text-[color:var(--muted)]">Ctrl/⌘ + V 로 붙여넣기</p>
    </label>
  )
}
