export type PlaygroundSnippet = {
  id: string
  name: string
  code: string
  updatedAt: number
}

const snippetsStorageKey = 'exstream-playground-snippets-v1'
const customStorageKey = 'exstream-playground-custom-v1'

function isSnippet(value: unknown): value is PlaygroundSnippet {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PlaygroundSnippet>
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.code === 'string' &&
    typeof candidate.updatedAt === 'number' &&
    Number.isFinite(candidate.updatedAt)
  )
}

export function readPlaygroundSnippets(storage: Storage): PlaygroundSnippet[] {
  const serialized = storage.getItem(snippetsStorageKey)
  if (!serialized) return []

  try {
    const stored = JSON.parse(serialized) as { version?: unknown; snippets?: unknown }
    if (stored.version !== 1 || !Array.isArray(stored.snippets)) return []
    return stored.snippets.filter(isSnippet).sort((left, right) => right.updatedAt - left.updatedAt)
  } catch {
    return []
  }
}

export function writePlaygroundSnippets(storage: Storage, snippets: PlaygroundSnippet[]) {
  storage.setItem(snippetsStorageKey, JSON.stringify({ version: 1, snippets }))
}

export function readPlaygroundCustom(storage: Storage, fallback: string) {
  return storage.getItem(customStorageKey) ?? fallback
}

export function writePlaygroundCustom(storage: Storage, code: string) {
  storage.setItem(customStorageKey, code)
}
