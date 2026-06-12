const OLD_STORAGE_KEY = 'barbot_codex_unlocks'
const STORAGE_KEY = 'restation_codex_unlocks'

function migrateCodex(): void {
  const old = localStorage.getItem(OLD_STORAGE_KEY)
  if (old) {
    localStorage.setItem(STORAGE_KEY, old)
    localStorage.removeItem(OLD_STORAGE_KEY)
  }
}

export function loadUnlockedIds(): Set<string> {
  try {
    migrateCodex()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function saveUnlockedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function unlockCocktailId(id: string): Set<string> {
  const next = loadUnlockedIds()
  next.add(id)
  saveUnlockedIds(next)
  return next
}

export function isCocktailUnlocked(id: string, cache?: Set<string>): boolean {
  const ids = cache ?? loadUnlockedIds()
  return ids.has(id)
}
