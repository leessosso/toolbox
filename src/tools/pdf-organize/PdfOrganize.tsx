import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel, btnGhost, btnPrimary, controlClass } from '../../components/OptionPanel.tsx'
import { Dropzone } from '../../components/Dropzone.tsx'
import { FileList, type ListedFile } from '../../components/FileList.tsx'
import { downloadBlob, u8Blob } from '../../lib/download.ts'
import { parsePageRange, stem } from '../../lib/format.ts'
import { loadPdf } from '../../lib/pdfjs.ts'
import { editPdf, extractPdfPages, mergePdfs } from '../../lib/pdfClient.ts'

type Thumb = { page: number; url: string; rotation: number; selected: boolean }

export default function PdfOrganize() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'edit' ? 'edit' : 'merge'

  const setTab = (next: 'merge' | 'edit') => {
    const sp = new URLSearchParams(params)
    if (next === 'merge') sp.delete('tab')
    else sp.set('tab', 'edit')
    setParams(sp, { replace: true })
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-pretty">PDF 정리</h1>
        <p className="text-sm text-[color:var(--muted)]">
          병합하거나, 페이지를 고르고 돌리고 잘라냅니다.
        </p>
      </header>
      <div className="flex gap-2">
        <button
          type="button"
          className={tab === 'merge' ? btnPrimary : btnGhost}
          onClick={() => setTab('merge')}
        >
          병합
        </button>
        <button
          type="button"
          className={tab === 'edit' ? btnPrimary : btnGhost}
          onClick={() => setTab('edit')}
        >
          페이지 편집
        </button>
      </div>
      {tab === 'merge' ? <MergePanel /> : <EditPanel />}
    </div>
  )
}

function MergePanel() {
  return (
    <ToolPage
      title="병합"
      description="위에서 아래로 이어집니다. 드래그로 순서를 바꾸세요."
      heading="h2"
      accept="application/pdf,.pdf"
      reorder
      actionLabel="합치기"
      onRun={async (files: ListedFile[]) => {
        const packed = await Promise.all(
          files.map(async (f) => ({
            name: f.file.name,
            buffer: await f.file.arrayBuffer(),
          })),
        )
        const bytes = await mergePdfs(packed)
        const blob = u8Blob(bytes, 'application/pdf')
        return [{ id: 'merged', name: 'merged.pdf', blob }]
      }}
    />
  )
}

function EditPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [thumbs, setThumbs] = useState<Thumb[]>([])
  const [range, setRange] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (incoming: File[]) => {
    const next = incoming[0]
    if (!next) return
    setFile(next)
    setError(null)
    setBusy(true)
    try {
      const pdf = await loadPdf(await next.arrayBuffer())
      const items: Thumb[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.35 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        items.push({
          page: i,
          url: canvas.toDataURL('image/jpeg', 0.7),
          rotation: 0,
          selected: false,
        })
      }
      setThumbs(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const selected = thumbs.filter((t) => t.selected).map((t) => t.page)

  const rotateSelected = () => {
    setThumbs((prev) =>
      prev.map((t) =>
        t.selected ? { ...t, rotation: (t.rotation + 90) % 360 } : t,
      ),
    )
  }

  const saveEdit = async () => {
    if (!file) return
    if (
      selected.length &&
      !window.confirm(
        `선택된 ${selected.length}페이지가 저장본에서 삭제됩니다. 계속할까요?`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const rotations: Record<number, number> = {}
      for (const t of thumbs) {
        if (t.rotation) rotations[t.page] = t.rotation
      }
      const bytes = await editPdf(await file.arrayBuffer(), selected, rotations)
      downloadBlob(
        u8Blob(bytes, 'application/pdf'),
        `${stem(file.name)}-edited.pdf`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const extract = async (pages: number[]) => {
    if (!file || !pages.length) return
    setBusy(true)
    setError(null)
    try {
      const bytes = await extractPdfPages(await file.arrayBuffer(), pages)
      downloadBlob(
        u8Blob(bytes, 'application/pdf'),
        `${stem(file.name)}-extract.pdf`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Dropzone
        accept="application/pdf,.pdf"
        multiple={false}
        onFiles={(f) => void load(f)}
        label="편집할 PDF 하나"
      />
      {file && (
        <FileList
          files={[{ id: 'one', file }]}
          onRemove={() => {
            setFile(null)
            setThumbs([])
          }}
          onClear={() => {
            setFile(null)
            setThumbs([])
          }}
        />
      )}
      <OptionPanel>
        <Field label="추출 범위">
          <input
            className={controlClass}
            placeholder="1-3, 8…"
            name="range"
            autoComplete="off"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
        </Field>
      </OptionPanel>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnGhost} disabled={busy || !selected.length} onClick={rotateSelected}>
          선택 90° 회전
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={busy || !selected.length}
          onClick={() => void extract(selected)}
        >
          선택 페이지 추출
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={busy || !file}
          onClick={() =>
            void extract(parsePageRange(range, thumbs.length || 1))
          }
        >
          범위 분할
        </button>
        <button
          type="button"
          className={btnPrimary}
          disabled={busy || !file}
          onClick={() => void saveEdit()}
        >
          {busy ? '처리 중…' : '삭제·회전 적용 후 저장'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[color:var(--safe)]" role="alert">
          {error} 파일을 확인한 뒤 다시 시도하세요.
        </p>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {thumbs.map((t) => (
          <li key={t.page}>
            <button
              type="button"
              onClick={() =>
                setThumbs((prev) =>
                  prev.map((x) =>
                    x.page === t.page ? { ...x, selected: !x.selected } : x,
                  ),
                )
              }
              className={`w-full overflow-hidden rounded-xl border p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--safe)] ${
                t.selected
                  ? 'border-[color:var(--safe)] ring-2 ring-[color:var(--safe)]'
                  : 'border-[color:var(--line)]'
              }`}
            >
              <img
                src={t.url}
                alt={`${t.page}페이지`}
                width={160}
                height={220}
                loading="lazy"
                className="w-full bg-[color:var(--chip)] motion-safe:transition-transform"
                style={{ transform: `rotate(${t.rotation}deg)` }}
              />
              <span className="mt-1 block font-mono text-xs">
                {t.page}
                {t.rotation ? ` · ${t.rotation}°` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {file && (
        <p className="text-sm text-[color:var(--muted)]">
          선택된 페이지는 저장 시 삭제됩니다. 추출은 별도 파일로 내려받습니다.
        </p>
      )}
    </div>
  )
}
