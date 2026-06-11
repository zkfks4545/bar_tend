import { keywordRules } from './keywords.js'
import { generateResponse } from './conversation.js'
import type { BartenderResponse, Message } from '../../types.js'

const SAFETY_CONCERN = /죽고\s*싶|자살|자해|해치고\s*싶|다치게\s*할|살기\s*싫|끝내고\s*싶/

export function detectSafetyConcern(input: string): boolean {
  return SAFETY_CONCERN.test(input.toLowerCase())
}

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
  if (detectSafetyConcern(input)) {
    return {
      response: '그 말은 농담으로 넘기면 안 되겠네요. 지금 당장 다칠 위험이 있거나 혼자 버티기 어렵다면, 가까운 사람이나 지역 응급 서비스에 바로 연락할 수 있겠어요?',
      expression: 'sympathy',
    }
  }

  const keywordMatch = keywordAnalyze(input)
  if (keywordMatch) return keywordMatch

  return generateResponse(input, history)
}
