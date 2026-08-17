import type { ProcessOptions, ProcessResult } from './image.ts'
import { compressToTarget, processImage } from './image.ts'

export type ImageJob =
  | { id: string; kind: 'process'; buffer: ArrayBuffer; type: string; options: ProcessOptions }
  | {
      id: string
      kind: 'target'
      buffer: ArrayBuffer
      type: string
      options: Omit<ProcessOptions, 'quality'> & { targetBytes: number }
    }

export type ImageJobOk = {
  id: string
  ok: true
  buffer: ArrayBuffer
  mime: string
  width: number
  height: number
  quality?: number
}

export type ImageJobErr = { id: string; ok: false; error: string }

type Handler = (msg: ImageJobOk | ImageJobErr) => void

let worker: Worker | null = null
const pending = new Map<string, Handler>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/image.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<ImageJobOk | ImageJobErr>) => {
      const fn = pending.get(e.data.id)
      if (fn) {
        pending.delete(e.data.id)
        fn(e.data)
      }
    }
  }
  return worker
}

function run(job: ImageJob, transfer: ArrayBuffer): Promise<ProcessResult & { quality?: number }> {
  return new Promise((resolve, reject) => {
    pending.set(job.id, (msg) => {
      if (!msg.ok) {
        reject(new Error(msg.error))
        return
      }
      resolve({
        blob: new Blob([msg.buffer], { type: msg.mime }),
        width: msg.width,
        height: msg.height,
        quality: msg.quality,
      })
    })
    try {
      getWorker().postMessage(job, [transfer])
    } catch {
      void fallback(job).then(resolve, reject)
    }
  })
}

async function fallback(
  job: ImageJob,
): Promise<ProcessResult & { quality?: number }> {
  const blob = new Blob([job.buffer], { type: job.type })
  if (job.kind === 'target') {
    return compressToTarget(blob, job.options)
  }
  return processImage(blob, job.options)
}

export async function processInWorker(
  file: Blob,
  options: ProcessOptions,
): Promise<ProcessResult> {
  const buffer = await file.arrayBuffer()
  return run(
    { id: crypto.randomUUID(), kind: 'process', buffer, type: file.type, options },
    buffer,
  )
}

export async function compressInWorker(
  file: Blob,
  options: Omit<ProcessOptions, 'quality'> & { targetBytes: number },
): Promise<ProcessResult & { quality?: number }> {
  const buffer = await file.arrayBuffer()
  return run(
    { id: crypto.randomUUID(), kind: 'target', buffer, type: file.type, options },
    buffer,
  )
}
