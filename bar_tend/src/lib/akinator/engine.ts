import type { CocktailData } from '../../types.js'
import type { FeatureKey, TastePreference } from '../../types/cocktail-db.js'
import type { QuestionTopic, RecommendationState } from '../../types/recommendation.js'
import { getAllCocktailData, scoreCocktailMatch } from '../cocktails/cocktail-db.js'
import { filterCocktailsByRecommendationState } from '../recommendation/state.js'

const NUDGE = 0.2

export function isRecommendationIntent(text: string): boolean {
  const kf = (patterns: string[]) => new RegExp(
    patterns.map((p) => {
      if (/^[a-z]/i.test(p)) return `\\b${p}\\b`
      return p
    }).join('|'), 'i',
  )
  if (kf(['추천', '골라', '마실', '칵테일', '한잔', '뭐 마실', '메뉴', '적당한', '다른\\s*(걸|거|술|칵테일)', '또.*추천', '별로', '다시\\s*찾']).test(text)) return true
  if (kf(['달콤', '달달', '달다', '씁쓸', '쓰다', '비터', '상쾌', '시원', '청량', 'fresh', '시트러스', '탄산', '스파이시']).test(text)) return true
  if (kf(['과일', '베리', '플로럴', '스모키', '허브', '커피', '크리미', '진저', '향']).test(text)) return true
  if (kf(['세게', '약하게', '가볍', '도수', '취하', 'strong', '강한', '독한', '순한']).test(text)) return true
  if (kf(['신맛', '상큼', '새콤', 'sour', '레몬', '라임', '산뜻']).test(text)) return true
  return false
}

export function ingestTasteSignals(text: string, current: TastePreference): TastePreference {
  const hints: Record<FeatureKey, { up: RegExp[]; down: RegExp[] }> = {
    sweetness: {
      up: [/달콤|달아|sweet|syrup|시럽|달게|달짝|달달|달다|디저트|단맛/i],
      down: [/안\s*달|드라이|dry|씁쓸|쓰다|bitter|쌉쌀/i],
    },
    alcohol_strength: {
      up: [/세게|쎄|강하|도수|취하|strong|stiff|독하|진하|하이볼|쎈/i],
      down: [/약하|가볍|light|soft|논알|순하|약한/i],
    },
    fizz: {
      up: [/탄산|톡\s*쏘|스파클|fizz|soda|청량|스파클링|거품|기포|상쾌/i],
      down: [/탄산\s*없|스틱|still|부드럽/i],
    },
    sourness: {
      up: [/신맛|상큼|새콤|sour|lime|레몬|시트러스|라임|산뜻/i],
      down: [/안\s*신|무난/i],
    },
  }

  const next: TastePreference = { ...current }
  for (const key of Object.keys(hints) as FeatureKey[]) {
    const { up, down } = hints[key]
    const base = next[key] ?? 0.5
    if (up.some((r) => r.test(text))) next[key] = clamp01(base + NUDGE)
    if (down.some((r) => r.test(text))) next[key] = clamp01(base - NUDGE)
  }
  return next
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/* ------------------------------------------------------------------ */
/*  Karua-style adaptive questions                                      */
/* ------------------------------------------------------------------ */

export interface FilterChoice {
  label: string
  filter: ((c: CocktailData) => boolean) | null
}

export interface FilterQuestion {
  text: string
  choices: FilterChoice[]
}

function spiritMatch(c: CocktailData, spirit: string): boolean {
  return c.base_spirit?.includes(spirit) ?? false
}

interface KaruaQuestion {
  topic: QuestionTopic
  karuaLine: string
  choices: FilterChoice[]
  /** Returns true if this topic is already sufficiently covered by state */
  isCovered: (state: RecommendationState) => boolean
  /** Pick which choice best matches the user's free-text answer */
  matchFreeText: (text: string) => number | null
}

const KARUA_QUESTIONS: KaruaQuestion[] = [
  {
    topic: 'mood',
    karuaLine: '기분은 좀 어떠세요? 오늘 하루, 살 만하셨어요, 말아야 할 만하셨어요.',
    choices: [
      { label: '좋아요', filter: null },
      { label: '별로예요', filter: null },
      { label: '그냥 그래요', filter: null },
    ],
    isCovered: (s) => s.moods.length > 0 || s.situations.length > 0,
    matchFreeText: () => null,
  },
  {
    topic: 'sweetness',
    karuaLine: '단 거, 좋아하시나요? 싫어하시나요? 아니면 그냥 그런가요.',
    choices: [
      { label: '달게', filter: (c) => c.features.sweetness >= 0.6 },
      { label: '적당히', filter: (c) => c.features.sweetness >= 0.3 },
      { label: '쌉쌀하게', filter: (c) => c.features.sweetness <= 0.3 },
      { label: '상관없어요', filter: null },
    ],
    isCovered: (s) => s.taste.sweetness !== undefined,
    matchFreeText: (text) => {
      if (/달콤|달아|단맛|달달|달게|sweet/i.test(text)) return 0
      if (/적당|무난/i.test(text)) return 1
      if (/쌉쌀|씁쓸|쓰다|드라이|bitter/i.test(text)) return 2
      return null
    },
  },
  {
    topic: 'fizz',
    karuaLine: '톡 쏘는 걸 좋아하시는 편이에요? 아니면 부드러운 쪽이요.',
    choices: [
      { label: '톡톡 쏘는 걸로', filter: (c) => c.features.fizz >= 0.4 },
      { label: '부드러운 걸로', filter: (c) => c.features.fizz <= 0.2 },
      { label: '상관없어요', filter: null },
    ],
    isCovered: (s) => s.taste.fizz !== undefined,
    matchFreeText: (text) => {
      if (/탄산|톡 쏘|청량|스파클|fizz/i.test(text)) return 0
      if (/부드럽|탄산 없|스틸/i.test(text)) return 1
      return null
    },
  },
  {
    topic: 'alcohol',
    karuaLine: '가볍게 시작하실 건가요, 오늘은 좀 세게 가실 건가요.',
    choices: [
      { label: '가볍게', filter: (c) => c.features.alcohol_strength <= 0.4 },
      { label: '적당히', filter: (c) => c.features.alcohol_strength >= 0.3 && c.features.alcohol_strength <= 0.7 },
      { label: '강하게', filter: (c) => c.features.alcohol_strength >= 0.6 },
      { label: '상관없어요', filter: null },
    ],
    isCovered: (s) => s.taste.alcohol_strength !== undefined || s.alcoholPreference !== 'any',
    matchFreeText: (text) => {
      if (/가볍|약하|순하|light/i.test(text)) return 0
      if (/적당/i.test(text)) return 1
      if (/강하|세게|독하|진하|strong/i.test(text)) return 2
      return null
    },
  },
  {
    topic: 'sourness',
    karuaLine: '신맛은요? 상큼한 쪽, 순한 쪽, 아니면 아무 쪽이나.',
    choices: [
      { label: '상큼/새콤하게', filter: (c) => c.features.sourness >= 0.4 },
      { label: '순하게', filter: (c) => c.features.sourness <= 0.3 },
      { label: '상관없어요', filter: null },
    ],
    isCovered: (s) => s.taste.sourness !== undefined,
    matchFreeText: (text) => {
      if (/상큼|새콤|신맛|sour|레몬|라임|시트러스/i.test(text)) return 0
      if (/순하|안 신/i.test(text)) return 1
      return null
    },
  },
  {
    topic: 'base',
    karuaLine: '베이스는 따로 원하시는 게 있나요. 없으면 제가 알아서 골라도 되고요.',
    choices: [
      { label: '진', filter: (c) => spiritMatch(c, '진') },
      { label: '럼', filter: (c) => spiritMatch(c, '럼') },
      { label: '위스키', filter: (c) => spiritMatch(c, '위스키') },
      { label: '데킬라/보드카', filter: (c) => spiritMatch(c, '데킬라') || spiritMatch(c, '보드카') },
      { label: '상관없어요', filter: null },
    ],
    isCovered: () => false,
    matchFreeText: (text) => {
      if (/(^|\s)진(\s|$|으|로|베|이)/i.test(text)) return 0
      if (/럼/i.test(text)) return 1
      if (/위스키|버번/i.test(text)) return 2
      if (/데킬라|보드카/i.test(text)) return 3
      return null
    },
  },
]

export function initCandidatePool(): CocktailData[] {
  return getAllCocktailData()
}

export function buildCandidatePoolFromState(state: RecommendationState): CocktailData[] {
  let pool = filterCocktailsByRecommendationState(initCandidatePool(), state)

  for (const entry of state.questionHistory) {
    if (entry.answer) {
      pool = applyAnswerToPool(pool, entry.answer, entry.topic as QuestionTopic)
    }
  }

  return pool
}

export function pickNextQuestion(
  pool: CocktailData[],
  state: RecommendationState,
): { question: FilterQuestion; topic: QuestionTopic } | null {
  const askedTopics = new Set(state.questionHistory.map((h) => h.topic))

  const candidates = KARUA_QUESTIONS.filter(
    (q) => !askedTopics.has(q.topic) && !q.isCovered(state),
  )

  if (candidates.length === 0) return null

  const picked = candidates[0]

  const askedCount = state.questionHistory.filter((h) => h.answer !== undefined).length
  let context = ''
  if (askedCount === 0) {
    context = pool.length <= 7
      ? '에이, 별로 안 남았는데요.\n자, '
      : '자, 취향부터 알아보시죠.\n'
  } else {
    const prevAnswer = state.questionHistory[state.questionHistory.length - 1]?.answer
    if (prevAnswer && picked.matchFreeText) {
      const match = picked.matchFreeText(prevAnswer)
      if (match !== null) {
        const choiceLabels: Record<string, string> = {
          mood: '',
          sweetness: '달콤하게, 알겠습니다.\n',
          fizz: '',
          alcohol: '오케이.\n',
          sourness: '상큼하게, 좋아요.\n',
          base: '',
        }
        context = choiceLabels[picked.topic] ?? ''
      }
    }
  }

  const choicesText = picked.choices.map((c, i) => `${i + 1}. ${c.label}`).join('\n')

  return {
    question: {
      text: `${context}${picked.karuaLine}\n\n${choicesText}\n\n---\n(직접 말씀하셔도 돼요)`,
      choices: picked.choices,
    },
    topic: picked.topic,
  }
}

export function applyAnswerToPool(
  pool: CocktailData[],
  answer: string,
  topic: QuestionTopic,
): CocktailData[] {
  const q = KARUA_QUESTIONS.find((q) => q.topic === topic)
  if (!q) return pool

  const trimmed = answer.trim()
  const num = parseInt(trimmed, 10)

  if (!isNaN(num) && num >= 1 && num <= q.choices.length) {
    const choice = q.choices[num - 1]
    if (choice.filter) {
      const kept = pool.filter(choice.filter)
      return kept.length > 0 ? kept : pool
    }
    return pool
  }

  const match = q.matchFreeText(trimmed)
  if (match !== null) {
    const choice = q.choices[match]
    if (choice.filter) {
      const kept = pool.filter(choice.filter)
      return kept.length > 0 ? kept : pool
    }
  }

  return pool
}

export function pickFromPool(pool: CocktailData[], preference: TastePreference): CocktailData | null {
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]

  const expressed: TastePreference = {}
  const weights: Partial<Record<FeatureKey, number>> = {}
  const defaults: Record<FeatureKey, number> = {
    sweetness: 0.5, alcohol_strength: 0.5, fizz: 0.35, sourness: 0.45,
  }

  for (const key of Object.keys(defaults) as FeatureKey[]) {
    const val = preference[key]
    if (val !== undefined && Math.abs(val - defaults[key]) > 0.01) {
      expressed[key] = val
      weights[key] = 2
    }
  }

  return [...pool].sort(
    (a, b) =>
      scoreCocktailMatch(a, expressed, weights) -
      scoreCocktailMatch(b, expressed, weights),
  )[0] ?? pool[0]
}
