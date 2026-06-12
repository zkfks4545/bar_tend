import type { CocktailData } from '../types.js'
import type { FeatureKey, TastePreference } from './cocktail-db.js'

export type RecommendationMood =
  | 'depressed'
  | 'tired'
  | 'lonely'
  | 'excited'
  | 'angry'
  | 'empty'
  | 'celebratory'
  | 'heartbroken'
  | 'anxious'
  | 'bored'

export type RecommendationSituation =
  | 'after-work'
  | 'breakup'
  | 'celebration'
  | 'sleepless'
  | 'rough-day'
  | 'casual-drink'
  | 'first-visit'
  | 'returning-guest'

export type AlcoholPreference = 'non-alcoholic' | 'low' | 'medium' | 'high' | 'any'
export type SignalSource = 'rule' | 'question' | 'webllm'

export interface RecommendationSignal {
  field:
    | `taste.${FeatureKey}`
    | 'moods'
    | 'situations'
    | 'alcoholPreference'
    | 'preferredIngredients'
    | 'excludedIngredients'
  value: string | number
  confidence: number
  source: SignalSource
  evidence?: string
}

export interface QuestionHistoryEntry {
  topic: string
  answer?: string
}

export interface RecommendationState {
  taste: TastePreference
  moods: RecommendationMood[]
  situations: RecommendationSituation[]
  alcoholPreference: AlcoholPreference
  preferredIngredients: string[]
  excludedIngredients: string[]
  questionHistory: QuestionHistoryEntry[]
  signals: RecommendationSignal[]
}

export interface RecommendationReason {
  code: 'taste-match' | 'strength-match' | 'ingredient-match' | 'context'
  label: string
  detail: string
  evidence: string[]
}

export interface RecommendationDecision {
  cocktail: CocktailData
  reasons: RecommendationReason[]
  state: RecommendationState
}
