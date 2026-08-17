import { zipSync } from 'fflate'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadZip(
  files: { name: string; data: Uint8Array | Blob }[],
  zipName: string,
) {
  const entries: Record<string, Uint8Array> = {}
  const used = new Map<string, number>()
  for (const file of files) {
    let name = file.name || 'file'
    const n = used.get(name) ?? 0
    used.set(name, n + 1)
    if (n > 0) {
      const dot = name.lastIndexOf('.')
      name =
        dot > 0
          ? `${name.slice(0, dot)}-${n}${name.slice(dot)}`
          : `${name}-${n}`
    }
    entries[name] =
      file.data instanceof Blob
        ? new Uint8Array(await file.data.arrayBuffer())
        : file.data
  }
  const zipped = zipSync(entries, { level: 6 })
  downloadBlob(u8Blob(zipped, 'application/zip'), zipName)
}

export function u8Blob(data: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(data.byteLength)
  copy.set(data)
  return new Blob([copy.buffer], { type })
}

