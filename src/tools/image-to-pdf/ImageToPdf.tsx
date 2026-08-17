import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel, controlClass } from '../../components/OptionPanel.tsx'
import type { ListedFile } from '../../components/FileList.tsx'
import type { ResultItem } from '../../components/ResultGrid.tsx'
import { processInWorker } from '../../lib/imageClient.ts'
import { u8Blob } from '../../lib/download.ts'
import { imagesToPdf } from '../../lib/pdfClient.ts'
import { stem } from '../../lib/format.ts'

export default function ImageToPdf() {
  const [paper, setPaper] = useState<'original' | 'a4' | 'letter'>('a4')
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>(
    'auto',
  )
  const [margin, setMargin] = useState(36)
  const [fit, setFit] = useState<'contain' | 'cover'>('contain')

  const run = async (files: ListedFile[]): Promise<ResultItem[]> => {
    const images: { buffer: ArrayBuffer; type: string }[] = []
    for (const item of files) {
      const prepared = await processInWorker(item.file, {
        mode: 'keep',
        format: 'image/jpeg',
        quality: 0.92,
        background: '#ffffff',
      })
      images.push({
        buffer: await prepared.blob.arrayBuffer(),
        type: 'image/jpeg',
      })
    }
    const bytes = await imagesToPdf(images, paper, orientation, margin, fit)
    const blob = u8Blob(bytes, 'application/pdf')
    const name = files.length === 1 ? `${stem(files[0].file.name)}.pdf` : 'images.pdf'
    return [{ id: 'pdf', name, blob, originalSize: files.reduce((s, f) => s + f.file.size, 0) }]
  }

  return (
    <ToolPage
      title="이미지 → PDF"
      description="목록을 드래그해 순서를 바꾼 뒤 한 권으로 묶습니다."
      accept="image/*"
      previewImages
      reorder
      actionLabel="PDF 만들기"
      onRun={run}
    >
      <OptionPanel>
        <Field label="용지">
          <select
            className={controlClass}
            value={paper}
            onChange={(e) => setPaper(e.target.value as typeof paper)}
          >
            <option value="original">이미지 크기</option>
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </Field>
        <Field label="방향">
          <select
            className={controlClass}
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as typeof orientation)}
          >
            <option value="auto">자동</option>
            <option value="portrait">세로</option>
            <option value="landscape">가로</option>
          </select>
        </Field>
        <Field label="여백 (pt)">
          <input
            className={controlClass}
            type="number"
            min={0}
            max={120}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
          />
        </Field>
        <Field label="맞춤">
          <select
            className={controlClass}
            value={fit}
            onChange={(e) => setFit(e.target.value as typeof fit)}
          >
            <option value="contain">안에 맞추기</option>
            <option value="cover">채우기</option>
          </select>
        </Field>
      </OptionPanel>
    </ToolPage>
  )
}
