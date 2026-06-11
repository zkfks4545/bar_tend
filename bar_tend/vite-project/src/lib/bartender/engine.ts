import { keywordRules } from './keywords.js'
import { generateResponse } from './conversation.js'
import type { BartenderResponse, Message } from '../../types.js'

export function keywordAnalyze(input: string): BartenderResponse | null {
  for (const rule of keywordRules) {
    if (rule.pattern.test(input.toLowerCase())) {
      return {
        response: rule.response,
        expression: rule.expression,
      }
    }
  }
  return null
}

export function detectIntent(input: string): string {
  const lower = input.toLowerCase()
  if (/\b(나갈게|갈게|바이|끝|잘 있어|다음에|안녕히)\b/.test(lower)) return 'exit-intent'
  if (/\b(추천|뭐가 좋아|칵테일|마실|취하|주문)\b/.test(lower)) return 'cocktail-query'
  if (/\b(달콤|쓰다|신맛|짠맛|향|맛)\b/.test(lower)) return 'taste-query'
  if (/\b(어떻게|재료|만들|레시피|뭐가 들)\b/.test(lower)) return 'recipe-query'
  if (/\b(힘들|우울|슬퍼|행복|기분|외롭)\b/.test(lower)) return 'mood-talk'
  return 'general-chat'
}

export function getCocktailResponse(input: string, history: Message[]): BartenderResponse {
  const keywordMatch = keywordAnalyze(input)
  if (keywordMatch) return keywordMatch

  return generateResponse(input, history)
}
