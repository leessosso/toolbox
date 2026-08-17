import { formatBytes } from '../lib/format.ts'
import { downloadBlob, downloadZip } from '../lib/download.ts'
import { btnGhost, btnPrimary } from './OptionPanel.tsx'

export type ResultItem = {
  id: string
  name: string
  blob: Blob
  previewUrl?: string
  meta?: string
  originalSize?: number
  error?: string
}

type Props = {
  results: ResultItem[]
  zipName?: string
}

export function ResultGrid({ results, zipName = 'results.zip' }: Props) {
  const ok = results.filter((r) => r.blob.size > 0 && !r.error)
  if (!results.length) return null

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">결과 {ok.length}</h2>
        {ok.length > 1 && (
          <button
            type="button"
            className={btnPrimary}
            onClick={() =>
              void downloadZip(
                ok.map((r) => ({ name: r.name, data: r.blob })),
                zipName,
              )
            }
          >
            모두 ZIP으로 받기
          </button>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-md border border-[color:var(--line)] bg-[color:var(--bg-elev)]"
          >
            {item.previewUrl && !item.error ? (
              <img
                src={item.previewUrl}
                alt=""
                width={400}
                height={300}
                loading="lazy"
                className="aspect-[4/3] w-full bg-[color:var(--chip)] object-contain"
              />
            ) : null}
            <div className="space-y-2 p-3">
              <p className="truncate font-medium">{item.name}</p>
              {item.error ? (
                <p className="text-sm text-[color:var(--danger)]" role="alert">
                  {item.error}
                </p>
              ) : (
                <p className="font-mono text-xs tabular-nums text-[color:var(--muted)]">
                  {formatBytes(item.blob.size)}
                  {item.originalSize
                    ? `  ←  ${formatBytes(item.originalSize)}`
                    : ''}
                  {item.meta ? ` · ${item.meta}` : ''}
                </p>
              )}
              {!item.error && (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => downloadBlob(item.blob, item.name)}
                >
                  다운로드
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
