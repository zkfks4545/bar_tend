import { describe, expect, it } from 'vitest'
import { getCocktailById } from '../cocktails/database.js'
import { createRecommendationDecision, createRecommendationState } from './state.js'
import { formatExplicitCocktailReply, formatRecommendationReply } from './response.js'

describe('recommendation dialogue copy', () => {
  it('keeps explicit cocktail character copy in dialogue without factual card copy', () => {
    const cocktail = getCocktailById('cocktail_classic_001')!
    const reply = formatExplicitCocktailReply(cocktail)

    expect(reply).toContain('메뉴판보다 손님이 빠르시네')
    expect(reply).not.toContain(cocktail.description)
  })

  it('uses structured recommendation reasons in Kahlua dialogue', () => {
    const cocktail = getCocktailById('cocktail_classic_008')!
    const state = {
      ...createRecommendationState(),
      taste: { fizz: 0.8 },
    }
    const reply = formatRecommendationReply(createRecommendationDecision(cocktail, state))

    expect(reply).toContain(`「${cocktail.name}」`)
    expect(reply).toContain('탄산감 취향과 가까워요')
    expect(reply).toContain('눈치가 빠르죠')
    expect(reply).not.toContain(cocktail.description)
  })
})
