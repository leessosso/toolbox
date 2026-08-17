import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { uid } from '../lib/format.ts'
import { Dropzone } from './Dropzone.tsx'
import { FileList, type ListedFile } from './FileList.tsx'
import { PrivacyBadge } from './PrivacyBadge.tsx'
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
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[0.2em] text-[color:var(--safe)] uppercase">
          Tool
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-[color:var(--muted)]">{description}</p>
        <PrivacyBadge />
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
        {error && <p className="text-sm text-[color:var(--safe)]">{error}</p>}
      </div>

      <ResultGrid results={results} zipName={zipName} />
    </div>
  )
}
