import { useCallback, useState } from 'react'
import {
  detectExpressedDimensions,
  filterPool,
  ingestTasteSignals,
  initCandidatePool,
  isRecommendationIntent,
  nextFilterQuestion,
  pickFromPool,
} from '@/lib/akinator/engine.js'
import { findCocktailByName } from '@/lib/cocktails/database.js'
import type { CocktailData, Expression } from '@/types.js'
import type { TastePreference } from '@/types/cocktail-db.js'

export interface RecommendationResult {
  reply: string
  expression: Expression
  cocktail: CocktailData | null
}

export function useRecommendationSession() {
  const [candidatePool, setCandidatePool] = useState<CocktailData[] | null>(null)
  const [filterCount, setFilterCount] = useState(0)

  const resetRecommendation = useCallback(() => {
    setCandidatePool(null)
    setFilterCount(0)
  }, [])

  const resolveRecommendation = useCallback(
    (text: string, preference: TastePreference): RecommendationResult | null => {
      const explicitCocktail = findCocktailByName(text)
      const isRecommendation =
        !explicitCocktail && (candidatePool !== null || isRecommendationIntent(text))

      if (explicitCocktail) {
        return {
          cocktail: explicitCocktail,
          reply: `${explicitCocktail.vibe}\n\n「${explicitCocktail.name}」, 좋은 선택이에요.\n${explicitCocktail.story}`,
          expression: 'smirk',
        }
      }

      if (!isRecommendation) return null

      const tasteSnapshot = ingestTasteSignals(text, preference)
      const pool = candidatePool ?? initCandidatePool()
      let filtered: CocktailData[]
      let nextQuestion

      if (candidatePool === null) {
        const expressed = detectExpressedDimensions(text)
        filtered = expressed.size > 0 ? filterPool(pool, text, 0) : pool
        nextQuestion = nextFilterQuestion(filtered, 0, expressed, text)
      } else {
        filtered = filterPool(pool, text, filterCount)
        nextQuestion = nextFilterQuestion(filtered, filterCount + 1, undefined, text)
      }

      if (nextQuestion) {
        setCandidatePool(filtered)
        setFilterCount(nextQuestion.index)
        return {
          cocktail: null,
          reply: nextQuestion.question.text,
          expression: 'thinking',
        }
      }

      const cocktail = pickFromPool(filtered, tasteSnapshot)
      resetRecommendation()
      if (!cocktail) return null

      return {
        cocktail,
        reply: `취향이 슬슬 자백하네요.\n${cocktail.vibe}\n\n오늘의 추천: 「${cocktail.name}」\n${cocktail.story}\n\n아니면 다시 고르죠. 잔은 상처받지 않으니까요.`,
        expression: 'smirk',
      }
    },
    [candidatePool, filterCount, resetRecommendation],
  )

  return {
    resetRecommendation,
    resolveRecommendation,
  }
}
