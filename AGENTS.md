# AGENTS.md

## Cursor Cloud specific instructions

toolbox is a **fully client-side** React 19 + TypeScript + Vite 8 single-page app. There is **no backend, database, or secrets** — all PDF/image/text/QR processing runs in the browser (some in Web Workers under `src/workers/`). Nothing to run other than the frontend.

Standard commands live in `package.json`; use them directly:
- Dev server: `npm run dev` (Vite on `http://localhost:5173/`).
- Lint: `npm run lint` (oxlint).
- Build: `npm run build` (runs `tsc -b` typecheck, then `vite build`).
- Preview a production build: `npm run preview`.

Non-obvious notes:
- **No automated test suite exists** — there is no `test` script or test framework. Verify changes via lint, build (which includes typecheck), and manual browser testing.
- `BASE_PATH` env var controls the app base URL at build time (`vite.config.ts`). Default `/` is correct for local dev; GitHub Pages CI builds with `BASE_PATH=/toolbox/`. Do not set it for local dev/preview or client-side routes will break.
- The dev server binds localhost only. To reach it from outside the VM, start with `npm run dev -- --host`.
