import { useCallback, useState } from 'react'
import type { TastePreference } from '../types/cocktail-db.js'
import type { IdolMemorySlot } from '../lib/idol/memory.js'
import { updateIdolFromMessage } from '../lib/idol/memory.js'
import { ingestTasteSignals } from '../lib/recommendation/question-engine.js'
import { clearSession, loadSession, saveSession } from '../lib/storage/guest-session-store.js'
import { loadUnlockedIds } from '../lib/storage/cocktail-unlocks.js'

export function useGuestPreferenceSession() {
  const [session, setSession] = useState(() => loadSession())
  const [unlockedIds, setUnlockedIds] = useState(() => loadUnlockedIds())

  const ingestUserMessage = useCallback((text: string) => {
    setSession((prev) => {
      const next = {
        preference: ingestTasteSignals(text, prev.preference),
        idol: updateIdolFromMessage(prev.idol, text),
      }
      saveSession(next)
      return next
    })
  }, [])

  const setPreference = useCallback((preference: TastePreference) => {
    setSession((prev) => {
      const next = { ...prev, preference }
      saveSession(next)
      return next
    })
  }, [])

  const resetNight = useCallback(() => {
    const fresh = clearSession()
    setSession(fresh)
  }, [])

  return {
    preference: session.preference,
    idol: session.idol as IdolMemorySlot,
    unlockedIds,
    setUnlockedIds,
    ingestUserMessage,
    setPreference,
    resetNight,
  }
}
