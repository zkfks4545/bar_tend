import { describe, expect, it } from 'vitest'
import {
  buildCandidatePoolFromState,
  initCandidatePool,
} from './engine.js'
import {
  addQuestionHistory,
  applyRecommendationSignals,
  createRecommendationState,
} from '../recommendation/state.js'

describe('adaptive recommendation candidate pool', () => {
  it('replays answered questions when rebuilding the pool after a signal change', () => {
    const state = addQuestionHistory(createRecommendationState(), {
      topic: 'alcohol',
      answer: '3',
    })

    const pool = buildCandidatePoolFromState(state)

    expect(pool.length).toBeGreaterThan(0)
    expect(pool.length).toBeLessThan(initCandidatePool().length)
    expect(pool.every((cocktail) => cocktail.features.alcohol_strength >= 0.6)).toBe(true)
  })

  it('applies the remaining structured signals while rebuilding the pool', () => {
    const state = applyRecommendationSignals(createRecommendationState(), [
      {
        field: 'alcoholPreference',
        value: 'high',
        confidence: 1,
        source: 'question',
      },
    ])

    const pool = buildCandidatePoolFromState(state)

    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((cocktail) => cocktail.features.alcohol_strength >= 0.6)).toBe(true)
  })
})
