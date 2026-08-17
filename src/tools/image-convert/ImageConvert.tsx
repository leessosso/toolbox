import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel } from '../../components/OptionPanel.tsx'
import type { ListedFile } from '../../components/FileList.tsx'
import type { ResultItem } from '../../components/ResultGrid.tsx'
import { mimeExt, type ImageMime } from '../../lib/image.ts'
import { processInWorker } from '../../lib/imageClient.ts'
import { stem } from '../../lib/format.ts'
import { FormatSelect, QualitySlider } from '../_shared/imageControls.tsx'
import { useImageFormats } from '../_shared/useImageFormats.ts'

export default function ImageConvert() {
  const formats = useImageFormats()
  const [format, setFormat] = useState<ImageMime>('image/webp')
  const [quality, setQuality] = useState(0.86)
  const [background, setBackground] = useState('#ffffff')

  const run = async (files: ListedFile[]): Promise<ResultItem[]> => {
    const out: ResultItem[] = []
    for (const item of files) {
      try {
        const result = await processInWorker(item.file, {
          mode: 'keep',
          format,
          quality,
          background,
        })
        out.push({
          id: item.id,
          name: `${stem(item.file.name)}.${mimeExt(format)}`,
          blob: result.blob,
          previewUrl: URL.createObjectURL(result.blob),
          originalSize: item.file.size,
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
      title="포맷 변환"
      description="투명 PNG를 JPEG로 바꿀 때 배경색을 고를 수 있습니다. AVIF는 브라우저가 지원할 때만 나타납니다."
      accept="image/*"
      previewImages
      zipName="converted.zip"
      onRun={run}
    >
      <OptionPanel>
        <Field label="대상 포맷">
          <FormatSelect value={format} onChange={setFormat} formats={formats} />
        </Field>
        <Field label="품질">
          <QualitySlider
            value={quality}
            onChange={setQuality}
            disabled={format === 'image/png'}
          />
        </Field>
        <Field label="불투명 배경">
          <input
            type="color"
            className="h-10 w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg)]"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </Field>
      </OptionPanel>
    </ToolPage>
  )
}
