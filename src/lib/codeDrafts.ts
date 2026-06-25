/**
 * localStorage helpers for persisting code drafts in the workspace.
 * Key format: assessment:draft:{assessmentId}:{language}
 * This is client-only state and is intentionally not synced to the server.
 */

const PREFIX = 'assessment:draft'

interface CodeDraft {
  code: string
  savedAt: number
}

export function saveDraft(assessmentId: string, language: string, code: string): void {
  try {
    const key = `${PREFIX}:${assessmentId}:${language}`
    const draft: CodeDraft = { code, savedAt: Date.now() }
    localStorage.setItem(key, JSON.stringify(draft))
  } catch {
    // Storage quota exceeded — ignore silently
  }
}

export function loadDraft(assessmentId: string, language: string): string | null {
  try {
    const key = `${PREFIX}:${assessmentId}:${language}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const draft = JSON.parse(raw) as CodeDraft
    return draft.code
  } catch {
    return null
  }
}

export function clearDraft(assessmentId: string, language: string): void {
  try {
    const key = `${PREFIX}:${assessmentId}:${language}`
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ─── Timer persistence ────────────────────────────────────────────────────────

const TIMER_PREFIX = 'assessment:timer'

export function saveStartTime(assessmentId: string): number {
  const now = Date.now()
  try {
    localStorage.setItem(`${TIMER_PREFIX}:${assessmentId}`, String(now))
  } catch {
    // ignore
  }
  return now
}

export function loadStartTime(assessmentId: string): number | null {
  try {
    const raw = localStorage.getItem(`${TIMER_PREFIX}:${assessmentId}`)
    if (!raw) return null
    return Number(raw)
  } catch {
    return null
  }
}

export function clearStartTime(assessmentId: string): void {
  try {
    localStorage.removeItem(`${TIMER_PREFIX}:${assessmentId}`)
  } catch {
    // ignore
  }
}
