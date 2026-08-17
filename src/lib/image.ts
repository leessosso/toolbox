export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif'

export type ResizeMode = 'keep' | 'exact' | 'percent' | 'maxLongEdge'

export type ProcessOptions = {
  mode: ResizeMode
  width?: number
  height?: number
  keepAspect?: boolean
  percent?: number
  maxLongEdge?: number
  format: ImageMime
  quality: number
  background?: string
}

export type ProcessResult = {
  blob: Blob
  width: number
  height: number
  quality?: number
}

const FORMAT_CACHE = new Map<ImageMime, boolean>()

export async function supportsMime(mime: ImageMime): Promise<boolean> {
  const cached = FORMAT_CACHE.get(mime)
  if (cached !== undefined) return cached
  if (mime === 'image/png' || mime === 'image/jpeg') {
    FORMAT_CACHE.set(mime, true)
    return true
  }
  try {
    const canvas = makeCanvas(2, 2)
    const ctx = get2d(canvas)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 2, 2)
    const blob = await canvasToBlob(canvas, mime, 0.5)
    const ok = blob.type === mime || (mime === 'image/webp' && blob.size > 0)
    FORMAT_CACHE.set(mime, ok)
    return ok
  } catch {
    FORMAT_CACHE.set(mime, false)
    return false
  }
}

export async function supportedFormats(): Promise<ImageMime[]> {
  const all: ImageMime[] = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
  const flags = await Promise.all(all.map(supportsMime))
  return all.filter((_, i) => flags[i])
}

export function mimeExt(mime: ImageMime): string {
  switch (mime) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    case 'image/avif':
      return 'avif'
  }
}

export function mimeFromExt(name: string): ImageMime | null {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'avif') return 'image/avif'
  return null
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement

function makeCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height)
  }
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return c
}

function get2d(canvas: AnyCanvas): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas를 만들 수 없습니다.')
  return ctx as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
}

async function canvasToBlob(
  canvas: AnyCanvas,
  mime: ImageMime,
  quality: number,
): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type: mime, quality })
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('인코딩에 실패했습니다.'))
      },
      mime,
      quality,
    )
  })
}

export function computeTargetSize(
  srcW: number,
  srcH: number,
  options: ProcessOptions,
): { width: number; height: number } {
  const { mode } = options
  if (mode === 'keep') return { width: srcW, height: srcH }
  if (mode === 'percent') {
    const p = Math.max(1, options.percent ?? 100) / 100
    return {
      width: Math.max(1, Math.round(srcW * p)),
      height: Math.max(1, Math.round(srcH * p)),
    }
  }
  if (mode === 'maxLongEdge') {
    const max = Math.max(1, options.maxLongEdge ?? Math.max(srcW, srcH))
    const long = Math.max(srcW, srcH)
    if (long <= max) return { width: srcW, height: srcH }
    const scale = max / long
    return {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(srcH * scale)),
    }
  }
  const keep = options.keepAspect !== false
  let w = options.width || 0
  let h = options.height || 0
  if (w && h && !keep) {
    return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) }
  }
  if (w && h && keep) {
    const scale = Math.min(w / srcW, h / srcH)
    return {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(srcH * scale)),
    }
  }
  if (w) {
    const scale = w / srcW
    return {
      width: Math.max(1, Math.round(w)),
      height: Math.max(1, Math.round(srcH * scale)),
    }
  }
  if (h) {
    const scale = h / srcH
    return {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(h)),
    }
  }
  return { width: srcW, height: srcH }
}

async function drawStepped(
  source: ImageBitmap,
  tw: number,
  th: number,
  background?: string,
): Promise<AnyCanvas> {
  let src: ImageBitmap | AnyCanvas = source
  let w = source.width
  let h = source.height
  while (w / 2 >= tw && h / 2 >= th) {
    w = Math.max(1, Math.round(w / 2))
    h = Math.max(1, Math.round(h / 2))
    const tmp = makeCanvas(w, h)
    const ctx = get2d(tmp)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(src, 0, 0, w, h)
    src = tmp
  }
  const out = makeCanvas(tw, th)
  const ctx = get2d(out)
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, tw, th)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, tw, th)
  return out
}

export async function processImage(
  blob: Blob,
  options: ProcessOptions,
): Promise<ProcessResult> {
  const bitmap = await createImageBitmap(blob)
  try {
    const { width, height } = computeTargetSize(bitmap.width, bitmap.height, options)
    const needsBg =
      (options.format === 'image/jpeg' || options.format === 'image/avif') &&
      Boolean(options.background)
    const canvas = await drawStepped(
      bitmap,
      width,
      height,
      needsBg ? options.background : undefined,
    )
    const encoded = await canvasToBlob(canvas, options.format, options.quality)
    return { blob: encoded, width, height }
  } finally {
    bitmap.close()
  }
}

export async function compressToTarget(
  blob: Blob,
  options: Omit<ProcessOptions, 'quality'> & { targetBytes: number },
): Promise<ProcessResult & { quality: number }> {
  let lo = 0.08
  let hi = 0.95
  let best: ProcessResult | null = null
  let bestQ = hi
  for (let i = 0; i < 8; i++) {
    const q = (lo + hi) / 2
    const result = await processImage(blob, { ...options, quality: q })
    best = result
    bestQ = q
    if (result.blob.size <= options.targetBytes) hi = q
    else lo = q
  }
  if (!best) throw new Error('압축에 실패했습니다.')
  if (best.blob.size > options.targetBytes) {
    const floor = await processImage(blob, { ...options, quality: 0.08 })
    return { ...floor, quality: 0.08 }
  }
  return { ...best, quality: bestQ }
}
