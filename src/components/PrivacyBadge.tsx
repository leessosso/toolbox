export function PrivacyBadge() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--chip)] px-3 py-1 text-xs font-medium tracking-wide text-[color:var(--muted)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--safe)]" />
      파일은 이 브라우저 안에서만 처리됩니다. 서버로 올라가지 않습니다.
    </p>
  )
}
