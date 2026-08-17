import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage.tsx'
import { Field, OptionPanel, controlClass } from '../../components/OptionPanel.tsx'
import type { ListedFile } from '../../components/FileList.tsx'
import type { ResultItem } from '../../components/ResultGrid.tsx'
import {
  mimeExt,
  mimeFromExt,
  type ImageMime,
  type ProcessOptions,
} from '../../lib/image.ts'
import { processInWorker } from '../../lib/imageClient.ts'
import { formatDims, stem } from '../../lib/format.ts'
import { QualitySlider } from '../_shared/imageControls.tsx'
import { useImageFormats } from '../_shared/useImageFormats.ts'

export default function ImageResize() {
  const formats = useImageFormats()
  const [mode, setMode] = useState<ProcessOptions['mode']>('maxLongEdge')
  const [width, setWidth] = useState(1920)
  const [height, setHeight] = useState(1080)
  const [keepAspect, setKeepAspect] = useState(true)
  const [percent, setPercent] = useState(50)
  const [maxLongEdge, setMaxLongEdge] = useState(1600)
  const [format, setFormat] = useState<ImageMime | 'keep'>('keep')
  const [quality, setQuality] = useState(0.92)
  const [background, setBackground] = useState('#ffffff')

  const run = async (files: ListedFile[]): Promise<ResultItem[]> => {
    const out: ResultItem[] = []
    for (const item of files) {
      const target =
        format === 'keep'
          ? (mimeFromExt(item.file.name) ?? 'image/png')
          : format
      try {
        const result = await processInWorker(item.file, {
          mode,
          width,
          height,
          keepAspect,
          percent,
          maxLongEdge,
          format: target,
          quality,
          background,
        })
        const name = `${stem(item.file.name)}.${mimeExt(target)}`
        out.push({
          id: item.id,
          name,
          blob: result.blob,
          previewUrl: URL.createObjectURL(result.blob),
          originalSize: item.file.size,
          meta: formatDims(result.width, result.height),
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
      title="이미지 리사이즈"
      description="큰 사진은 단계적으로 줄여 선명함을 유지합니다. 장변 제한이 SNS·첨부 용량에 가장 쓸모 있습니다."
      accept="image/*"
      previewImages
      zipName="resized.zip"
      onRun={run}
    >
      <OptionPanel>
        <Field label="모드">
          <select
            className={controlClass}
            value={mode}
            onChange={(e) => setMode(e.target.value as ProcessOptions['mode'])}
          >
            <option value="maxLongEdge">장변 최대</option>
            <option value="exact">직접 지정</option>
            <option value="percent">비율 (%)</option>
          </select>
        </Field>
        {mode === 'maxLongEdge' && (
          <Field label="장변 최대 (px)">
            <input
              className={controlClass}
              type="number"
              min={1}
              value={maxLongEdge}
              onChange={(e) => setMaxLongEdge(Number(e.target.value))}
            />
          </Field>
        )}
        {mode === 'percent' && (
          <Field label="비율 (%)">
            <input
              className={controlClass}
              type="number"
              min={1}
              max={400}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </Field>
        )}
        {mode === 'exact' && (
          <>
            <Field label="너비 (px)">
              <input
                className={controlClass}
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </Field>
            <Field label="높이 (px)">
              <input
                className={controlClass}
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </Field>
            <Field label="비율 유지">
              <input
                type="checkbox"
                className="mt-3 h-5 w-5 accent-[color:var(--safe)]"
                checked={keepAspect}
                onChange={(e) => setKeepAspect(e.target.checked)}
              />
            </Field>
          </>
        )}
        <Field label="출력 포맷">
          <select
            className={controlClass}
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageMime | 'keep')}
          >
            <option value="keep">원본 유지</option>
            {formats.map((mime) => (
              <option key={mime} value={mime}>
                {mime.replace('image/', '').toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label="품질">
          <QualitySlider
            value={quality}
            onChange={setQuality}
            disabled={format === 'image/png' || format === 'keep'}
          />
        </Field>
        <Field label="JPEG 배경">
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
