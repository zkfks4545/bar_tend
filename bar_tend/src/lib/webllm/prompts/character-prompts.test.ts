import { describe, expect, it } from 'vitest'
import { createRecommendationState } from '@/lib/recommendation/state.js'
import {
  buildKaruaQuestionPrompt,
  buildSignalExtractionPrompt,
  ENSEMBLE_EVENT_SYSTEM_PROMPT,
  getCharacterSystemPrompt,
  KARUA_SYSTEM_PROMPT,
  PROMPT_DRAFT_NOTICE,
  SIESTA_EVENT_SYSTEM_PROMPT,
} from './character-prompts.js'

describe('WebLLM character prompt drafts', () => {
  it('marks every prompt family as an initial draft that requires revision', () => {
    expect(KARUA_SYSTEM_PROMPT).toContain(PROMPT_DRAFT_NOTICE)
    expect(SIESTA_EVENT_SYSTEM_PROMPT).toContain(PROMPT_DRAFT_NOTICE)
    expect(buildSignalExtractionPrompt(createRecommendationState())).toContain(PROMPT_DRAFT_NOTICE)
  })

  it('keeps Karua gentle, non-analytical, and boundary-aware', () => {
    expect(KARUA_SYSTEM_PROMPT).toContain('존댓말을 중심')
    expect(KARUA_SYSTEM_PROMPT).toContain('분석하거나 교정하지 않는다')
    expect(KARUA_SYSTEM_PROMPT).toContain('경계를 존중')
    expect(KARUA_SYSTEM_PROMPT).toContain('농담의 의미 해설')
  })

  it('keeps Siesta short, dry, experienced, and temporary', () => {
    expect(SIESTA_EVENT_SYSTEM_PROMPT).toContain('짧고 건조하고 담담하고 직설적')
    expect(SIESTA_EVENT_SYSTEM_PROMPT).toContain('자기 경험으로 훈계하지 않는다')
    expect(SIESTA_EVENT_SYSTEM_PROMPT).toContain('2~4개 발화')
    expect(SIESTA_EVENT_SYSTEM_PROMPT).toContain('대화권은 카루아에게')
  })

  it('binds RST-402 question expression to the engine-selected topic', () => {
    const prompt = buildKaruaQuestionPrompt('sweetness', createRecommendationState(), '단 건 싫어요')

    expect(prompt).toContain('질문 주제: sweetness')
    expect(prompt).toContain('주제를 변경하지 말고')
    expect(prompt).toContain('단 건 싫어요')
    expect(prompt).toContain('설문 문항이나 체크리스트처럼 말하지 않는다.')
  })

  it('routes RP evaluation cases to the matching character prompt', () => {
    expect(getCharacterSystemPrompt('karua')).toBe(KARUA_SYSTEM_PROMPT)
    expect(getCharacterSystemPrompt('siesta')).toBe(SIESTA_EVENT_SYSTEM_PROMPT)
    expect(getCharacterSystemPrompt('ensemble')).toBe(ENSEMBLE_EVENT_SYSTEM_PROMPT)
  })
})
