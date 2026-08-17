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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">원본 {files.length}</h2>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`원본 ${files.length}개를 모두 지울까요?`)) onClear()
          }}
          className="rounded-sm text-sm text-[color:var(--muted)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)]"
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
            className={`flex items-center gap-3 rounded-md border border-[color:var(--line)] bg-[color:var(--bg-elev)] p-2 ${onMove ? 'select-none' : ''}`}
          >
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-[color:var(--chip)] font-mono text-[10px] uppercase">
                {item.file.name.split('.').pop()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.file.name}</p>
              <p className="font-mono text-xs tabular-nums text-[color:var(--muted)]">
                {formatBytes(item.file.size)}
                {onMove ? ' · 드래그 또는 버튼으로 순서 변경' : ''}
              </p>
            </div>
            {onMove && (
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="위로"
                  disabled={index === 0}
                  className="rounded px-2 py-0.5 text-xs text-[color:var(--muted)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)] disabled:opacity-30"
                  onClick={() => onMove(index, index - 1)}
                >
                  위
                </button>
                <button
                  type="button"
                  aria-label="아래로"
                  disabled={index === files.length - 1}
                  className="rounded px-2 py-0.5 text-xs text-[color:var(--muted)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)] disabled:opacity-30"
                  onClick={() => onMove(index, index + 1)}
                >
                  아래
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-md px-3 py-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink)]"
            >
              제거
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
