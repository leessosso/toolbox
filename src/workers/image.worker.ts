import type { ImageJob, ImageJobErr, ImageJobOk } from '../lib/imageClient.ts'
import { compressToTarget, processImage } from '../lib/image.ts'

self.onmessage = async (e: MessageEvent<ImageJob>) => {
  const job = e.data
  try {
    const blob = new Blob([job.buffer], { type: job.type })
    const result =
      job.kind === 'target'
        ? await compressToTarget(blob, job.options)
        : await processImage(blob, job.options)
    const buffer = await result.blob.arrayBuffer()
    const payload: ImageJobOk = {
      id: job.id,
      ok: true,
      buffer,
      mime: result.blob.type,
      width: result.width,
      height: result.height,
      quality: job.kind === 'target' ? result.quality : undefined,
    }
    self.postMessage(payload, { transfer: [buffer] })
  } catch (err) {
    const payload: ImageJobErr = {
      id: job.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(payload)
  }
}
