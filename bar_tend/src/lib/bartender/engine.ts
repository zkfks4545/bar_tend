import { keywordRules } from './keywords.js'
import { generateResponse } from './conversation.js'
import { detectSafetyConcern } from '../dialogue/input-router.js'
import type { BartenderResponse, Message } from '../../types.js'

export { detectSafetyConcern } from '../dialogue/input-router.js'

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
