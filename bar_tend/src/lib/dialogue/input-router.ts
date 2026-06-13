import { findCocktailByName } from '../cocktails/database.js'
import { isRecommendationIntent } from '../recommendation/question-engine.js'

const SAFETY_CONCERN = /죽고\s*싶|자살|자해|해치고\s*싶|다치게\s*할|살기\s*싫|끝내고\s*싶/
const EXIT_INTENT = /나갈게|갈게|바이|끝낼게|잘 있어|다음에|안녕히/

export type InputRoute =
  | 'safety'
  | 'exit'
  | 'explicit-cocktail'
  | 'recommendation'
  | 'general'

export function detectSafetyConcern(input: string): boolean {
  return SAFETY_CONCERN.test(input.toLowerCase())
}

export function detectExitIntent(input: string): boolean {
  return EXIT_INTENT.test(input.toLowerCase())
}

export function routeUserInput(
  input: string,
  options: { recommendationActive?: boolean } = {},
): InputRoute {
  if (detectSafetyConcern(input)) return 'safety'
  if (detectExitIntent(input)) return 'exit'
  if (findCocktailByName(input)) return 'explicit-cocktail'
  if (options.recommendationActive || isRecommendationIntent(input)) return 'recommendation'
  return 'general'
}
