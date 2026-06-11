import { cocktails } from '@/lib/cocktails/database.js'
import type { Cocktail } from '@/types.js'

export default function CocktailBookTab({
  unlockedIds,
  onSelect,
}: {
  unlockedIds: Set<string>
  onSelect?: (cocktail: Cocktail) => void
}) {
  return (
    <div className="codex-grid">
      {cocktails.map((c) => {
        const unlocked = unlockedIds.has(c.id)
        return (
          <button
            key={c.id}
            type="button"
            className={`codex-slot ${unlocked ? 'codex-slot--unlocked' : 'codex-slot--locked'}`}
            onClick={() => unlocked && onSelect?.(c)}
            disabled={!unlocked}
            title={unlocked ? c.name : '???'}
          >
            {unlocked ? (
              <>
                {c.image ? (
                  <img src={c.image} alt="" className="codex-slot__img" />
                ) : (
                  <span className="codex-slot__glyph">{c.name.charAt(0)}</span>
                )}
                <span className="codex-slot__name">{c.name}</span>
              </>
            ) : (
              <>
                <span className="codex-slot__silhouette">?</span>
                <span className="codex-slot__name codex-slot__name--locked">???</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
