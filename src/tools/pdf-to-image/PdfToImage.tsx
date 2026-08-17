import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel, controlClass } from '../../components/OptionPanel.tsx'
import type { ListedFile } from '../../components/FileList.tsx'
import type { ResultItem } from '../../components/ResultGrid.tsx'
import { loadPdf } from '../../lib/pdfjs.ts'
import { mimeExt, type ImageMime } from '../../lib/image.ts'
import { parsePageRange, stem, uid } from '../../lib/format.ts'
import { FormatSelect, QualitySlider } from '../_shared/imageControls.tsx'
import { useImageFormats } from '../_shared/useImageFormats.ts'

export default function PdfToImage() {
  const formats: ImageMime[] = useImageFormats().filter((m) => m !== 'image/avif')
  const [scale, setScale] = useState(2)
  const [range, setRange] = useState('')
  const [format, setFormat] = useState<ImageMime>('image/png')
  const [quality, setQuality] = useState(0.92)

  const run = async (files: ListedFile[]): Promise<ResultItem[]> => {
    const out: ResultItem[] = []
    for (const item of files) {
      const data = await item.file.arrayBuffer()
      const pdf = await loadPdf(data)
      const pages = parsePageRange(range, pdf.numPages)
      for (const pageNo of pages) {
        try {
          const page = await pdf.getPage(pageNo)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas 실패')
          await page.render({ canvas, canvasContext: ctx, viewport }).promise
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error('인코딩 실패'))),
              format,
              quality,
            )
          })
          out.push({
            id: uid(),
            name: `${stem(item.file.name)}-p${String(pageNo).padStart(3, '0')}.${mimeExt(format)}`,
            blob,
            previewUrl: URL.createObjectURL(blob),
            originalSize: item.file.size,
            meta: `${Math.round(viewport.width)} × ${Math.round(viewport.height)}`,
          })
        } catch (err) {
          out.push({
            id: uid(),
            name: `${item.file.name} p${pageNo}`,
            blob: new Blob(),
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }
    return out
  }

  return (
    <ToolPage
      title="PDF → 이미지"
      description="페이지를 고해상도 캔버스로 찍습니다. 2×는 화면용, 3×는 인쇄에 가깝습니다."
      accept="application/pdf,.pdf"
      zipName="pdf-pages.zip"
      dropLabel="PDF를 끌어다 놓으세요"
      onRun={run}
    >
      <OptionPanel>
        <Field label="배율">
          <select
            className={controlClass}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          >
            <option value={1}>1× (72 DPI)</option>
            <option value={2}>2× (144 DPI)</option>
            <option value={3}>3× (216 DPI)</option>
          </select>
        </Field>
        <Field label="페이지 범위">
          <input
            className={controlClass}
            placeholder="비우면 전체 · 예: 1-3, 7"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
        </Field>
        <Field label="포맷">
          <FormatSelect
            value={formats.includes(format) ? format : 'image/png'}
            onChange={setFormat}
            formats={formats.length ? formats : ['image/png', 'image/jpeg', 'image/webp']}
          />
        </Field>
        <Field label="품질">
          <QualitySlider
            value={quality}
            onChange={setQuality}
            disabled={format === 'image/png'}
          />
        </Field>
      </OptionPanel>
    </ToolPage>
  )
}
