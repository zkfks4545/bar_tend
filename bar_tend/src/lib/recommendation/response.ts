import type { CocktailData } from '../../types.js'
import type { RecommendationDecision } from '../../types/recommendation.js'

export function formatExplicitCocktailReply(cocktail: CocktailData): string {
  return `「${cocktail.name}」 찾으셨네요. 메뉴판보다 손님이 빠르시네.\n카드에는 설명만 얌전히 올려둘게요.`
}

export function formatRecommendationReply(
  decision: RecommendationDecision,
  acknowledgement?: string | null,
): string {
  const reason = decision.reasons.find((item) => item.code !== 'context')
  const opening = acknowledgement ?? '취향이 슬슬 자백하네요.'
  const reasonLine = reason
    ? `${reason.detail} 잔이 제법 눈치가 빠르죠.`
    : '지금까지 들은 걸로 제가 골라봤어요. 틀리면 잔 탓을 하죠.'

  return `${opening}\n오늘은 「${decision.cocktail.name}」로 가죠.\n${reasonLine}`
}
