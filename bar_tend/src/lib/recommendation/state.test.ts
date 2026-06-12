import { describe, expect, it } from 'vitest'
import { getAllCocktailData } from '../cocktails/database.js'
import {
  applyRecommendationSignals,
  buildRecommendationReasons,
  createRecommendationState,
  extractRecommendationSignals,
  filterCocktailsByRecommendationState,
  removeRecommendationSignal,
} from './state.js'

describe('recommendation state', () => {
  it('extracts structured mood, situation, taste and alcohol signals', () => {
    const signals = extractRecommendationSignals('퇴근했는데 피곤해. 달달하고 도수 낮은 걸로 추천해줘')
    const state = applyRecommendationSignals(createRecommendationState(), signals)

    expect(state.moods).toContain('tired')
    expect(state.situations).toContain('after-work')
    expect(state.taste.sweetness).toBe(0.8)
    expect(state.alcoholPreference).toBe('low')
  })

  it('does not silently replace a non-alcoholic request with alcoholic data', () => {
    const state = applyRecommendationSignals(
      createRecommendationState(),
      extractRecommendationSignals('무알코올로 추천해줘'),
    )

    expect(filterCocktailsByRecommendationState(getAllCocktailData(), state)).toEqual([])
  })

  it('filters excluded ingredients and returns evidence-based reasons', () => {
    const [mojito] = getAllCocktailData().filter((cocktail) => cocktail.name === '모히토')
    const state = applyRecommendationSignals(createRecommendationState(), [
      { field: 'taste.fizz', value: 0.8, confidence: 1, source: 'question' },
      { field: 'excludedIngredients', value: '민트', confidence: 1, source: 'question' },
    ])

    expect(filterCocktailsByRecommendationState([mojito], state)).toEqual([])
    expect(buildRecommendationReasons(mojito, state)[0]).toMatchObject({
      code: 'taste-match',
      label: '취향 일치',
    })
  })

  it('extracts excluded ingredients in natural Korean word order', () => {
    const state = applyRecommendationSignals(
      createRecommendationState(),
      extractRecommendationSignals('민트 없이 상큼한 걸로 추천해줘'),
    )

    expect(state.excludedIngredients).toEqual(['민트'])
  })

  it('rebuilds structured state from the remaining signals when one is removed', () => {
    const state = applyRecommendationSignals(createRecommendationState(), [
      { field: 'alcoholPreference', value: 'low', confidence: 1, source: 'question' },
      { field: 'alcoholPreference', value: 'high', confidence: 1, source: 'question' },
      { field: 'taste.sweetness', value: 0.8, confidence: 1, source: 'question' },
    ])

    const next = removeRecommendationSignal(state, 1)

    expect(next.alcoholPreference).toBe('low')
    expect(next.taste.sweetness).toBe(0.8)
    expect(next.signals).toHaveLength(2)
  })
})
