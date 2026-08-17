import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ToolCategory = 'pdf' | 'image' | 'text' | 'generate'

export type ToolDef = {
  id: string
  name: string
  description: string
  category: ToolCategory
  Component: LazyExoticComponent<ComponentType>
}

export const categoryLabel: Record<ToolCategory, string> = {
  pdf: 'PDF',
  image: '이미지',
  text: '텍스트',
  generate: '생성',
}

export const tools: ToolDef[] = [
  {
    id: 'pdf-to-image',
    name: 'PDF → 이미지',
    description: '각 페이지를 PNG, JPEG, WebP로 렌더합니다.',
    category: 'pdf',
    Component: lazy(() => import('./pdf-to-image/PdfToImage.tsx')),
  },
  {
    id: 'image-to-pdf',
    name: '이미지 → PDF',
    description: '여러 장을 순서대로 하나의 PDF로 묶습니다.',
    category: 'pdf',
    Component: lazy(() => import('./image-to-pdf/ImageToPdf.tsx')),
  },
  {
    id: 'pdf-organize',
    name: 'PDF 정리',
    description: '병합, 분할, 페이지 삭제와 회전.',
    category: 'pdf',
    Component: lazy(() => import('./pdf-organize/PdfOrganize.tsx')),
  },
  {
    id: 'image-resize',
    name: '이미지 리사이즈',
    description: '픽셀, 비율, 장변 최대 길이로 크기를 바꿉니다.',
    category: 'image',
    Component: lazy(() => import('./image-resize/ImageResize.tsx')),
  },
  {
    id: 'image-convert',
    name: '포맷 변환',
    description: 'PNG, JPEG, WebP, AVIF 사이를 변환합니다.',
    category: 'image',
    Component: lazy(() => import('./image-convert/ImageConvert.tsx')),
  },
  {
    id: 'image-compress',
    name: '이미지 압축',
    description: '품질 또는 목표 용량으로 무게를 줄입니다.',
    category: 'image',
    Component: lazy(() => import('./image-compress/ImageCompress.tsx')),
  },
  {
    id: 'text-utils',
    name: '텍스트 유틸',
    description: 'JSON, Base64, URL, 해시, 대소문자.',
    category: 'text',
    Component: lazy(() => import('./text-utils/TextUtils.tsx')),
  },
  {
    id: 'qr-generate',
    name: 'QR 코드',
    description: '텍스트, URL, Wi-Fi, 연락처 QR을 만듭니다.',
    category: 'generate',
    Component: lazy(() => import('./qr-generate/QrGenerate.tsx')),
  },
]

export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]))
