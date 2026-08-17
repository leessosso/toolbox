import { useEffect, useState } from 'react'
import { supportedFormats, type ImageMime } from '../../lib/image.ts'

export function useImageFormats() {
  const [formats, setFormats] = useState<ImageMime[]>([
    'image/png',
    'image/jpeg',
    'image/webp',
  ])
  useEffect(() => {
    void supportedFormats().then(setFormats)
  }, [])
  return formats
}
