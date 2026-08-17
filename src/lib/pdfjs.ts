import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'

let configured = false

export function setupPdfjs() {
  if (configured) return
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  configured = true
}

export async function loadPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  setupPdfjs()
  const task = getDocument({ data, useSystemFonts: true })
  return task.promise
}
