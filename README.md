# DARKROOM

브라우저에서만 돌아가는 잡일 도구 모음입니다. PDF·이미지는 서버로 올라가지 않습니다.

## 도구

- PDF → 이미지
- 이미지 → PDF
- PDF 정리 (병합 / 분할 / 삭제 / 회전)
- 이미지 리사이즈
- 포맷 변환 (PNG / JPEG / WebP / AVIF)
- 이미지 압축 (품질 또는 목표 용량)
- 텍스트 유틸 (JSON, Base64, URL, SHA)
- QR 코드 (텍스트 / URL / Wi-Fi / 연락처)

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
npm run preview
```

정적 호스팅(Vercel, GitHub Pages, Netlify)에 `dist`만 올리면 됩니다. Vercel용 SPA 리라이트는 `vercel.json`에 들어 있습니다.
