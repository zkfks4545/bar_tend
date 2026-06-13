import { describe, expect, it } from 'vitest'
import { getAllCocktailData } from '../cocktails/database.js'
import {
  applyQuestionAnswer,
  formatQuestion,
  getQuestionById,
  selectNextQuestion,
} from './question-engine.js'
import {
  addQuestionHistory,
  applyRecommendationSignals,
  createRecommendationState,
  filterCocktailsByRecommendationState,
} from './state.js'

describe('adaptive recommendation questions', () => {
  it('skips topics already known from recommendation state', () => {
    const state = applyRecommendationSignals(createRecommendationState(), [
      { field: 'taste.sweetness', value: 0.8, confidence: 1, source: 'rule' },
      { field: 'preferredIngredients', value: '진', confidence: 1, source: 'rule' },
    ])

    const question = selectNextQuestion(getAllCocktailData(), state)

    expect(question?.topic).not.toBe('sweetness')
    expect(question?.topic).not.toBe('base')
  })

  it('does not repeat asked topics and stops after three questions', () => {
    let state = createRecommendationState()
    const pool = getAllCocktailData()
    const asked = new Set<string>()

    for (let count = 0; count < 3; count += 1) {
      const question = selectNextQuestion(pool, state)
      if (!question) break
      expect(asked.has(question!.topic)).toBe(false)
      asked.add(question!.topic)
      state = addQuestionHistory(state, { topic: question!.topic, answer: '카루아에게 맡기기' })
    }

    const cappedState = ['base', 'sweetness', 'alcohol'].reduce(
      (current, topic) => addQuestionHistory(current, { topic, answer: '카루아에게 맡기기' }),
      createRecommendationState(),
    )

    expect(asked.size).toBeGreaterThan(0)
    expect(selectNextQuestion(pool, cappedState)).toBeNull()
  })

  it('applies a numbered JSON choice as structured state and filters candidates', () => {
    const question = getQuestionById('base-spirit')
    expect(question).not.toBeNull()

    const result = applyQuestionAnswer(createRecommendationState(), question!, '1')
    const filtered = filterCocktailsByRecommendationState(getAllCocktailData(), result.state)

    expect(result.state.preferredIngredients).toEqual(['진'])
    expect(result.acknowledgement).toContain('깔끔한 척')
    expect(filtered.length).toBeGreaterThan(1)
    expect(filtered.length).toBeLessThan(getAllCocktailData().length)
    expect(filtered.every((cocktail) => cocktail.base_spirit === '진')).toBe(true)
    expect(filtered.some((cocktail) => cocktail.name === '다이키리')).toBe(false)
  })

  it('uses taste answers to narrow the candidate pool', () => {
    const question = getQuestionById('fizz')
    expect(question).not.toBeNull()

    const result = applyQuestionAnswer(createRecommendationState(), question!, '1')
    const filtered = filterCocktailsByRecommendationState(getAllCocktailData(), result.state)

    expect(filtered.length).toBeLessThan(getAllCocktailData().length)
    expect(filtered.every((cocktail) => cocktail.features.fizz >= 0.45)).toBe(true)
  })

  it('accepts free text answers and keeps question copy concise for choice UI', () => {
    const question = getQuestionById('fizz')
    expect(question).not.toBeNull()

    const result = applyQuestionAnswer(createRecommendationState(), question!, '탄산 없이 부드럽게')
    const rendered = formatQuestion(question!, result.acknowledgement)

    expect(result.state.taste.fizz).toBe(0.1)
    expect(rendered).toContain(question!.prompt)
    expect(rendered).toContain('직접 말씀하셔도')
    expect(rendered).not.toContain('1. 톡 쏘고 청량하게')
  })

  it('ends questioning only when Kahlua is asked to take over', () => {
    const question = getQuestionById('fizz')
    expect(question).not.toBeNull()

    const delegated = applyQuestionAnswer(
      createRecommendationState(),
      question!,
      '카루아에게 맡기기',
    )
    const unknown = applyQuestionAnswer(createRecommendationState(), question!, '잘 모르겠어요')

    expect(delegated.finishRecommendation).toBe(true)
    expect(delegated.state).toEqual(createRecommendationState())
    expect(unknown.finishRecommendation).toBe(false)
  })

  it('maps every cocktail to at least one answer in every recommendation question', () => {
    const cocktails = getAllCocktailData()

    for (const question of [
      getQuestionById('base-spirit'),
      getQuestionById('sweetness'),
      getQuestionById('alcohol-strength'),
      getQuestionById('sourness'),
      getQuestionById('fizz'),
    ]) {
      expect(question).not.toBeNull()
      const choices = question!.choices.filter((choice) => !choice.finishRecommendation)

      for (const choice of choices) {
        const state = applyRecommendationSignals(createRecommendationState(), choice.signals)
        expect(filterCocktailsByRecommendationState(cocktails, state).length).toBeGreaterThan(0)
      }

      for (const cocktail of cocktails) {
        const mapped = choices.some((choice) => {
          const state = applyRecommendationSignals(createRecommendationState(), choice.signals)
          return filterCocktailsByRecommendationState([cocktail], state).length === 1
        })
        expect(mapped, `${cocktail.name} has no answer for ${question!.id}`).toBe(true)
      }
    }
  })
})
