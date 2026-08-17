import { PDFDocument, degrees, PageSizes, rgb } from 'pdf-lib'

export type PdfJob =
  | { id: string; kind: 'merge'; files: { name: string; buffer: ArrayBuffer }[] }
  | {
      id: string
      kind: 'extract'
      buffer: ArrayBuffer
      pages: number[]
    }
  | {
      id: string
      kind: 'edit'
      buffer: ArrayBuffer
      deletePages: number[]
      rotations: Record<number, number>
    }
  | {
      id: string
      kind: 'imagesToPdf'
      images: { buffer: ArrayBuffer; type: string }[]
      paper: 'original' | 'a4' | 'letter'
      orientation: 'auto' | 'portrait' | 'landscape'
      margin: number
      fit: 'contain' | 'cover'
    }

export type PdfJobOk = { id: string; ok: true; buffer: ArrayBuffer }
export type PdfJobErr = { id: string; ok: false; error: string }

self.onmessage = async (e: MessageEvent<PdfJob>) => {
  const job = e.data
  try {
    const bytes = await run(job)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const payload: PdfJobOk = { id: job.id, ok: true, buffer: copy.buffer }
  self.postMessage(payload, { transfer: [copy.buffer] })
  } catch (err) {
    const payload: PdfJobErr = {
      id: job.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(payload)
  }
}

async function run(job: PdfJob): Promise<Uint8Array> {
  if (job.kind === 'merge') {
    const out = await PDFDocument.create()
    for (const file of job.files) {
      const src = await PDFDocument.load(file.buffer)
      const pages = await out.copyPages(src, src.getPageIndices())
      for (const page of pages) out.addPage(page)
    }
    return out.save()
  }

  if (job.kind === 'extract') {
    const src = await PDFDocument.load(job.buffer)
    const out = await PDFDocument.create()
    const indices = job.pages.map((p) => p - 1)
    const copied = await out.copyPages(src, indices)
    for (const page of copied) out.addPage(page)
    return out.save()
  }

  if (job.kind === 'edit') {
    const src = await PDFDocument.load(job.buffer)
    const remove = new Set(job.deletePages.map((p) => p - 1))
    const keep = src.getPageIndices().filter((i) => !remove.has(i))
    const out = await PDFDocument.create()
    const copied = await out.copyPages(src, keep)
    copied.forEach((page, idx) => {
      const pageNo = keep[idx] + 1
      const extra = job.rotations[pageNo] ?? 0
      if (extra) page.setRotation(degrees((page.getRotation().angle + extra) % 360))
      out.addPage(page)
    })
    return out.save()
  }

  const out = await PDFDocument.create()
  for (const image of job.images) {
    const bytes = new Uint8Array(image.buffer)
    const embedded =
      image.type === 'image/jpeg' || image.type === 'image/jpg'
        ? await out.embedJpg(bytes)
        : await out.embedPng(bytes)
    const iw = embedded.width
    const ih = embedded.height
    let pw: number
    let ph: number
    if (job.paper === 'original') {
      pw = iw
      ph = ih
    } else {
      const size = job.paper === 'a4' ? PageSizes.A4 : PageSizes.Letter
      pw = size[0]
      ph = size[1]
      const landscape =
        job.orientation === 'landscape' ||
        (job.orientation === 'auto' && iw > ih)
      if (landscape) {
        pw = size[1]
        ph = size[0]
      }
    }
    const page = out.addPage([pw, ph])
    const m = job.margin
    const boxW = Math.max(1, pw - m * 2)
    const boxH = Math.max(1, ph - m * 2)
    const scale =
      job.fit === 'cover'
        ? Math.max(boxW / iw, boxH / ih)
        : Math.min(boxW / iw, boxH / ih)
    const dw = iw * scale
    const dh = ih * scale
    const x = m + (boxW - dw) / 2
    const y = m + (boxH - dh) / 2
    if (job.fit === 'cover') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pw,
        height: ph,
        color: rgb(1, 1, 1),
      })
    }
    page.drawImage(embedded, { x, y, width: dw, height: dh })
  }
  return out.save()
}
