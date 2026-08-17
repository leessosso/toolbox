import { formatBytes } from '../lib/format.ts'

export type ListedFile = {
  id: string
  file: File
  previewUrl?: string
}

type Props = {
  files: ListedFile[]
  onRemove: (id: string) => void
  onMove?: (from: number, to: number) => void
  onClear: () => void
}

export function FileList({ files, onRemove, onMove, onClear }: Props) {
  if (!files.length) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">원본 {files.length}</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-[color:var(--muted)] underline-offset-2 hover:text-[color:var(--safe)] hover:underline"
        >
          모두 지우기
        </button>
      </div>
      <ul className="grid gap-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            draggable={Boolean(onMove)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index))
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (!onMove) return
              const from = Number(e.dataTransfer.getData('text/plain'))
              if (Number.isFinite(from) && from !== index) onMove(from, index)
            }}
            className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-elev)] p-2"
          >
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-[color:var(--chip)] font-mono text-[10px] uppercase">
                {item.file.name.split('.').pop()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.file.name}</p>
              <p className="font-mono text-xs text-[color:var(--muted)]">
                {formatBytes(item.file.size)}
                {onMove ? ' · 드래그해서 순서 변경' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-full px-3 py-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--safe)]"
            >
              제거
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
