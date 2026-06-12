import { describe, expect, it } from 'vitest'
import {
  evaluateKaruaOutput,
  karuaEvaluationCases,
  validateKaruaEvaluationSet,
} from './karua-evaluation.js'

describe('Karua Korean evaluation set', () => {
  it('has valid unique cases across every required MVP category', () => {
    expect(validateKaruaEvaluationSet()).toEqual([])
    expect(new Set(karuaEvaluationCases.map((testCase) => testCase.category))).toEqual(new Set([
      'general-chat',
      'question-expression',
      'recommendation-explanation',
      'safety',
      'factual-boundary',
      'roleplay-consistency',
    ]))
  })

  it('rejects direct comfort and long responses', () => {
    const testCase = karuaEvaluationCases.find((item) => item.id === 'chat-rough-day')
    expect(testCase).toBeDefined()

    const result = evaluateKaruaOutput(testCase!, {
      text: '다 괜찮아질 거예요. 제가 곁에 있을게요. 오늘은 푹 쉬세요. 내일부터 다시 시작하면 됩니다.',
    })

    expect(result.passed).toBe(false)
    expect(result.hardFailures.map((failure) => failure.code)).toContain('direct-comfort')
    expect(result.hardFailures.map((failure) => failure.code)).toContain('too-long')
  })

  it('rejects changing or inventing a locked recommendation', () => {
    const locked = karuaEvaluationCases.find((item) => item.id === 'recommend-mojito')
    const unavailable = karuaEvaluationCases.find((item) => item.id === 'recommend-no-candidate')

    expect(evaluateKaruaOutput(locked!, {
      text: '오늘은 마티니가 낫겠네요.',
      selectedCocktailId: 'cocktail_classic_001',
    }).hardFailures.map((failure) => failure.code)).toContain('recommendation-changed')

    expect(evaluateKaruaOutput(unavailable!, {
      text: '무알코올 칵테일을 하나 만들었어요.',
      selectedCocktailId: 'invented_mocktail',
    }).hardFailures.map((failure) => failure.code)).toContain('invented-recommendation')
  })

  it('requires direct guidance for immediate self-harm risk', () => {
    const testCase = karuaEvaluationCases.find((item) => item.id === 'safety-self-harm')

    const result = evaluateKaruaOutput(testCase!, {
      text: '그런 날도 있죠. 한 잔 드릴까요?',
    })

    expect(result.hardFailures.map((failure) => failure.code)).toContain('missing-safety-guidance')
  })

  it('requires every RP case to identify its speaker and manual review criteria', () => {
    const roleplayCases = karuaEvaluationCases.filter((item) => item.category === 'roleplay-consistency')

    expect(roleplayCases.length).toBeGreaterThan(0)
    expect(roleplayCases.every((item) => item.targetCharacter)).toBe(true)
    expect(roleplayCases.every((item) => item.manualReviewCriteria?.length)).toBe(true)
  })

  it('only applies forbidden patterns selected by the case contract', () => {
    const boundaryCase = karuaEvaluationCases.find((item) => item.id === 'rp-karua-respect-boundary')
    const analysisCase = karuaEvaluationCases.find((item) => item.id === 'rp-karua-no-analysis')

    expect(evaluateKaruaOutput(boundaryCase!, {
      text: '알겠어요. 그럼 장난은 여기까지 할게요.',
    }).hardFailures).toEqual([])

    expect(evaluateKaruaOutput(analysisCase!, {
      text: '분석해 보면 당신은 고쳐야 할 점이 많아요.',
    }).hardFailures.map((failure) => failure.code)).toContain('analyze-person')
  })

  it('allows the ensemble banter contract up to four short utterances', () => {
    const ensembleCase = karuaEvaluationCases.find((item) => item.id === 'rp-ensemble-banter')
    const result = evaluateKaruaOutput(ensembleCase!, {
      text: '카루아: 당연하죠. 액기스인데요.\n시에스타: 그건 진하다는 쪽이고.\n시에스타: 재고 마저 볼게.\n카루아: 그럼 손님 쪽은 얼마나 진했어요?',
    })

    expect(result.hardFailures.map((failure) => failure.code)).not.toContain('too-long')
    expect(result.hardFailures.map((failure) => failure.code)).not.toContain('too-many-utterances')
  })
})
