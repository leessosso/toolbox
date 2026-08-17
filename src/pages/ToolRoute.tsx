import { Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { toolsById } from '../tools/registry.ts'

export default function ToolRoute() {
  const { toolId } = useParams()
  const tool = toolId ? toolsById[toolId] : undefined
  if (!tool) return <Navigate to="/" replace />
  const Component = tool.Component
  return (
    <Suspense
      fallback={
        <p className="font-mono text-sm text-[color:var(--muted)]">도구 불러오는 중…</p>
      }
    >
      <Component />
    </Suspense>
  )
}
