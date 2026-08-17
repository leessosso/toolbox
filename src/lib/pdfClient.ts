import type { PdfJob, PdfJobErr, PdfJobOk } from '../workers/pdf.worker.ts'

type Handler = (msg: PdfJobOk | PdfJobErr) => void

let worker: Worker | null = null
const pending = new Map<string, Handler>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<PdfJobOk | PdfJobErr>) => {
      const fn = pending.get(e.data.id)
      if (fn) {
        pending.delete(e.data.id)
        fn(e.data)
      }
    }
  }
  return worker
}

function call(job: PdfJob, transfer: ArrayBuffer[]): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    pending.set(job.id, (msg) => {
      if (!msg.ok) reject(new Error(msg.error))
      else resolve(new Uint8Array(msg.buffer))
    })
    getWorker().postMessage(job, transfer)
  })
}

export async function mergePdfs(files: { name: string; buffer: ArrayBuffer }[]) {
  return call(
    { id: crypto.randomUUID(), kind: 'merge', files },
    files.map((f) => f.buffer),
  )
}

export async function extractPdfPages(buffer: ArrayBuffer, pages: number[]) {
  return call({ id: crypto.randomUUID(), kind: 'extract', buffer, pages }, [buffer])
}

export async function editPdf(
  buffer: ArrayBuffer,
  deletePages: number[],
  rotations: Record<number, number>,
) {
  return call(
    { id: crypto.randomUUID(), kind: 'edit', buffer, deletePages, rotations },
    [buffer],
  )
}

export async function imagesToPdf(
  images: { buffer: ArrayBuffer; type: string }[],
  paper: 'original' | 'a4' | 'letter',
  orientation: 'auto' | 'portrait' | 'landscape',
  margin: number,
  fit: 'contain' | 'cover',
) {
  return call(
    {
      id: crypto.randomUUID(),
      kind: 'imagesToPdf',
      images,
      paper,
      orientation,
      margin,
      fit,
    },
    images.map((i) => i.buffer),
  )
}
