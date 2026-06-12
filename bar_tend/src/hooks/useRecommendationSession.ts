import { useCallback, useState } from 'react'
import {
  detectExpressedDimensions,
  filterPool,
  ingestTasteSignals,
  initCandidatePool,
  isRecommendationIntent,
  nextFilterQuestion,
  pickFromPool,
} from '@/lib/recommendation/question-engine.js'
import { findCocktailByName } from '@/lib/cocktails/database.js'
import {
  addQuestionHistory,
  answerLatestQuestion,
  applyRecommendationSignals,
  createRecommendationDecision,
  createRecommendationState,
  extractRecommendationSignals,
  filterCocktailsByRecommendationState,
} from '@/lib/recommendation/state.js'
import type { CocktailData, Expression } from '@/types.js'
import type { TastePreference } from '@/types/cocktail-db.js'
import type { RecommendationDecision, RecommendationState } from '@/types/recommendation.js'

export interface RecommendationResult {
  reply: string
  expression: Expression
  cocktail: CocktailData | null
  decision: RecommendationDecision | null
}

export function useRecommendationSession() {
  const [candidatePool, setCandidatePool] = useState<CocktailData[] | null>(null)
  const [filterCount, setFilterCount] = useState(0)
  const [recommendationState, setRecommendationState] = useState<RecommendationState>(
    createRecommendationState,
  )

  const resetRecommendation = useCallback(() => {
    setCandidatePool(null)
    setFilterCount(0)
    setRecommendationState(createRecommendationState())
  }, [])

  const resolveRecommendation = useCallback(
    (text: string, preference: TastePreference): RecommendationResult | null => {
      const explicitCocktail = findCocktailByName(text)
      const isRecommendation =
        !explicitCocktail && (candidatePool !== null || isRecommendationIntent(text))

      if (explicitCocktail) {
        return {
          cocktail: explicitCocktail,
          decision: createRecommendationDecision(explicitCocktail, recommendationState),
          reply: `${explicitCocktail.vibe}\n\n「${explicitCocktail.name}」, 좋은 선택이에요.\n${explicitCocktail.story}`,
          expression: 'smirk',
        }
      }

      if (!isRecommendation) return null

      const tasteSnapshot = ingestTasteSignals(text, preference)
      const signals = extractRecommendationSignals(text)
      let nextState = applyRecommendationSignals(recommendationState, signals)
      if (candidatePool !== null) nextState = answerLatestQuestion(nextState, text)
      const pool = filterCocktailsByRecommendationState(candidatePool ?? initCandidatePool(), nextState)
      const combinedTaste = { ...tasteSnapshot, ...nextState.taste }
      let filtered: CocktailData[]
      let nextQuestion

      if (pool.length === 0) {
        resetRecommendation()
        return {
          cocktail: null,
          decision: null,
          reply: '그 조건에 맞는 잔은 지금 목록에 없네요. 없는 술을 있는 척하면 재고 조사가 길어지거든요.',
          expression: 'thinking',
        }
      }

      if (candidatePool === null) {
        const expressed = detectExpressedDimensions(text)
        filtered = expressed.size > 0 ? filterPool(pool, text, 0) : pool
        nextQuestion = nextFilterQuestion(filtered, 0, expressed, text)
      } else {
        filtered = filterPool(pool, text, filterCount)
        nextQuestion = nextFilterQuestion(filtered, filterCount + 1, undefined, text)
      }

      if (nextQuestion) {
        nextState = addQuestionHistory(nextState, {
          topic: nextQuestion.question.dimension ?? `question-${nextQuestion.index}`,
        })
        setRecommendationState(nextState)
        setCandidatePool(filtered)
        setFilterCount(nextQuestion.index)
        return {
          cocktail: null,
          decision: null,
          reply: nextQuestion.question.text,
          expression: 'thinking',
        }
      }

      const cocktail = pickFromPool(filtered, combinedTaste)
      if (!cocktail) return null
      const decision = createRecommendationDecision(cocktail, nextState)
      resetRecommendation()

      return {
        cocktail,
        decision,
        reply: `취향이 슬슬 자백하네요.\n${cocktail.vibe}\n\n오늘의 추천: 「${cocktail.name}」\n${cocktail.story}\n\n아니면 다시 고르죠. 잔은 상처받지 않으니까요.`,
        expression: 'smirk',
      }
    },
    [candidatePool, filterCount, recommendationState, resetRecommendation],
  )

  return {
    resetRecommendation,
    resolveRecommendation,
  }
}
