import type { TastePreference } from '../../types/cocktail-db.js'
import type { IdolMemorySlot } from '../idol/memory.js'

const OLD_SESSION_KEY = 'barbot_session_v1'
const SESSION_KEY = 'restation_session_v1'

export interface RestationSession {
  preference: TastePreference
  idol: IdolMemorySlot
}

const DEFAULT_SESSION: RestationSession = {
  preference: {},
  idol: {
    sentiment: 'neutral',
    lastTopics: [],
    exchangeCount: 0,
  },
}

function migrateSession(): void {
  const old = localStorage.getItem(OLD_SESSION_KEY)
  if (old) {
    localStorage.setItem(SESSION_KEY, old)
    localStorage.removeItem(OLD_SESSION_KEY)
  }
}

export function loadSession(): RestationSession {
  try {
    migrateSession()
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return { ...DEFAULT_SESSION, idol: { ...DEFAULT_SESSION.idol, lastTopics: [] } }
    const parsed = JSON.parse(raw) as Partial<RestationSession>
    return {
      preference: parsed.preference ?? {},
      idol: {
        sentiment: parsed.idol?.sentiment ?? 'neutral',
        lastTopics: parsed.idol?.lastTopics ?? [],
        exchangeCount: parsed.idol?.exchangeCount ?? 0,
        userName: parsed.idol?.userName,
      },
    }
  } catch {
    return { ...DEFAULT_SESSION, idol: { ...DEFAULT_SESSION.idol, lastTopics: [] } }
  }
}

export function saveSession(session: RestationSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): RestationSession {
  const fresh = {
    ...DEFAULT_SESSION,
    idol: { ...DEFAULT_SESSION.idol, lastTopics: [] as string[] },
  }
  saveSession(fresh)
  return fresh
}
