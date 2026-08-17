import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { uid } from '../lib/format.ts'
import { Dropzone } from './Dropzone.tsx'
import { FileList, type ListedFile } from './FileList.tsx'
import { ResultGrid, type ResultItem } from './ResultGrid.tsx'
import { btnPrimary } from './OptionPanel.tsx'

type Props = {
  title: string
  description: string
  accept: string
  multiple?: boolean
  dropLabel?: string
  zipName?: string
  previewImages?: boolean
  reorder?: boolean
  actionLabel?: string
  heading?: 'h1' | 'h2'
  children?: ReactNode
  onRun: (files: ListedFile[]) => Promise<ResultItem[]>
}

export function ToolPage({
  title,
  description,
  accept,
  multiple = true,
  dropLabel,
  zipName,
  previewImages = false,
  reorder = false,
  actionLabel = '변환하기',
  heading = 'h1',
  children,
  onRun,
}: Props) {
  const [files, setFiles] = useState<ListedFile[]>([])
  const [results, setResults] = useState<ResultItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = useCallback(
    (incoming: File[]) => {
      setFiles((prev) => {
        const next = incoming.map((file) => ({
          id: uid(),
          file,
          previewUrl:
            previewImages && file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined,
        }))
        return multiple ? [...prev, ...next] : next
      })
    },
    [multiple, previewImages],
  )

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files
      if (items && items.length) addFiles([...items])
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addFiles])

  useEffect(() => {
    if (!files.length) return
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [files.length])

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
    }
  }, [files])

  const remove = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  const clear = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
    })
    setFiles([])
  }

  const move = (from: number, to: number) => {
    setFiles((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(from, 1)
      copy.splice(to, 0, item)
      return copy
    })
  }

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      const next = await onRun(files)
      setResults(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {heading === 'h2' ? (
          <h2 className="text-2xl font-semibold">{title}</h2>
        ) : (
          <h1 className="text-2xl font-semibold">{title}</h1>
        )}
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </header>

      <Dropzone accept={accept} multiple={multiple} onFiles={addFiles} label={dropLabel} />

      <FileList
        files={files}
        onRemove={remove}
        onClear={clear}
        onMove={reorder ? move : undefined}
      />

      {children}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnPrimary}
          disabled={!files.length || busy}
          onClick={() => void run()}
        >
          {busy ? '처리 중…' : actionLabel}
        </button>
        {busy && (
          <p className="text-sm text-[color:var(--muted)]" aria-live="polite">
            처리 중…
          </p>
        )}
        {error && (
          <p className="text-sm text-[color:var(--danger)]" role="alert">
            {error}
          </p>
        )}
      </div>

      <ResultGrid results={results} zipName={zipName} />
    </div>
  )
}
