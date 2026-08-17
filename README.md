# toolbox

브라우저에서만 돌아가는 도구 모음입니다. PDF·이미지는 서버로 올라가지 않습니다.

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

## 배포

GitHub Pages: `main`에 푸시하면 Actions가 `https://leessosso.github.io/toolbox/`에 올립니다.

처음 한 번만 저장소 **Settings → Pages → Source**에서 **GitHub Actions**를 고르면 됩니다.

로컬에서 Pages와 같은 경로로 빌드하려면:

```bash
BASE_PATH=/toolbox/ npm run build
npm run preview
```

Vercel 등 루트 도메인 호스팅은 `npm run build`만 하면 됩니다. SPA 리라이트는 `vercel.json`에 있습니다.
