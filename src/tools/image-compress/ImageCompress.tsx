import { useEffect, useState } from 'react'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel, controlClass } from '../../components/OptionPanel.tsx'
import type { ListedFile } from '../../components/FileList.tsx'
import type { ResultItem } from '../../components/ResultGrid.tsx'
import { mimeExt, type ImageMime } from '../../lib/image.ts'
import { compressInWorker, processInWorker } from '../../lib/imageClient.ts'
import { formatBytes, stem } from '../../lib/format.ts'
import { FormatSelect, QualitySlider } from '../_shared/imageControls.tsx'
import { useImageFormats } from '../_shared/useImageFormats.ts'

export default function ImageCompress() {
  const formats: ImageMime[] = useImageFormats().filter((m) => m !== 'image/png')
  const [format, setFormat] = useState<ImageMime>('image/webp')
  const [quality, setQuality] = useState(0.72)
  const [targetMode, setTargetMode] = useState(false)
  const [targetKb, setTargetKb] = useState(250)
  const [background, setBackground] = useState('#ffffff')
  const [estimate, setEstimate] = useState<string | null>(null)
  const [sample, setSample] = useState<File | null>(null)

  useEffect(() => {
    if (!sample || targetMode) {
      setEstimate(null)
      return
    }
    let cancelled = false
    const t = window.setTimeout(() => {
      void processInWorker(sample, {
        mode: 'keep',
        format,
        quality,
        background,
      }).then((r) => {
        if (!cancelled) setEstimate(formatBytes(r.blob.size))
      })
    }, 280)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [sample, format, quality, background, targetMode])

  const run = async (files: ListedFile[]): Promise<ResultItem[]> => {
    setSample(files[0]?.file ?? null)
    const out: ResultItem[] = []
    for (const item of files) {
      try {
        const result = targetMode
          ? await compressInWorker(item.file, {
              mode: 'keep',
              format,
              background,
              targetBytes: targetKb * 1024,
            })
          : await processInWorker(item.file, {
              mode: 'keep',
              format,
              quality,
              background,
            })
        const q =
          typeof result.quality === 'number'
            ? `q ${Math.round(result.quality * 100)}`
            : undefined
        out.push({
          id: item.id,
          name: `${stem(item.file.name)}.${mimeExt(format)}`,
          blob: result.blob,
          previewUrl: URL.createObjectURL(result.blob),
          originalSize: item.file.size,
          meta: q,
        })
      } catch (err) {
        out.push({
          id: item.id,
          name: item.file.name,
          blob: new Blob(),
          originalSize: item.file.size,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    return out
  }

  return (
    <ToolPage
      title="이미지 압축"
      description="품질 슬라이더로 가볍게, 또는 목표 용량 이하가 될 때까지 품질을 탐색합니다."
      accept="image/*"
      previewImages
      zipName="compressed.zip"
      actionLabel="압축하기"
      onRun={async (files) => {
        setSample(files[0]?.file ?? null)
        return run(files)
      }}
    >
      <OptionPanel>
        <Field label="포맷">
          <FormatSelect
            value={formats.includes(format) ? format : 'image/jpeg'}
            onChange={setFormat}
            formats={formats.length ? formats : ['image/jpeg', 'image/webp']}
          />
        </Field>
        <Field label="목표 용량 모드">
          <input
            type="checkbox"
            className="mt-3 h-5 w-5 accent-[color:var(--ink)]"
            checked={targetMode}
            onChange={(e) => setTargetMode(e.target.checked)}
          />
        </Field>
        {targetMode ? (
          <Field label="목표 용량 (KB)">
            <input
              className={controlClass}
              type="number"
              min={10}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
            />
          </Field>
        ) : (
          <Field label="품질">
            <QualitySlider value={quality} onChange={setQuality} />
          </Field>
        )}
        <Field label="배경">
          <input
            type="color"
            className="h-10 w-full rounded-md border border-[color:var(--line)] bg-[color:var(--bg)]"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </Field>
      </OptionPanel>
      {estimate && !targetMode && (
        <p className="font-mono text-sm text-[color:var(--muted)]">
          첫 파일 예상 용량 ≈ {estimate}
        </p>
      )}
    </ToolPage>
  )
}
