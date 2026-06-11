import type { CocktailRecord, FeatureKey, TastePreference } from '../../types/cocktail-db.js'
import { getAllCocktailRecords, scoreCocktailMatch } from '../cocktails/cocktail-db.js'

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
/*  Structured questions with numbered choices + free-text fallback     */
/* ------------------------------------------------------------------ */

export interface FilterChoice {
  label: string
  filter: ((c: CocktailRecord) => boolean) | null
}

export interface FilterQuestion {
  text: string
  choices: FilterChoice[]
  /** Which dimension this question covers — used to skip already-expressed ones */
  dimension?: string
}

function spiritMatch(c: CocktailRecord, spirit: string): boolean {
  return c.base_spirit?.includes(spirit) ?? false
}

const QUESTIONS: FilterQuestion[] = [
  {
    dimension: 'sweetness',
    text: '단맛은 어떻게 하시겠어요? 달게, 쌉쌀하게, 아니면 적당히?',
    choices: [
      { label: '많이 달콤하게', filter: (c) => c.features.sweetness >= 0.6 },
      { label: '적당히 달콤하게', filter: (c) => c.features.sweetness >= 0.3 },
      { label: '쌉쌀/드라이하게', filter: (c) => c.features.sweetness <= 0.3 },
      { label: '상관없어요', filter: null },
    ],
  },
  {
    dimension: 'base',
    text: '베이스는요? 진, 럼, 위스키... 골라보세요.',
    choices: [
      { label: '진 (Martini, Negroni)', filter: (c) => spiritMatch(c, '진') },
      { label: '럼 (Mojito)', filter: (c) => spiritMatch(c, '럼') },
      { label: '위스키 (Old Fashioned)', filter: (c) => spiritMatch(c, '위스키') },
      { label: '데킬라/보드카/시그니처', filter: (c) => spiritMatch(c, '데킬라') || spiritMatch(c, '보드카') || spiritMatch(c, '시그니처') },
      { label: '상관없어요', filter: null },
    ],
  },
  {
    dimension: 'alcohol',
    text: '도수는요? 가볍게, 적당히, 강하게. 선택은 자유.',
    choices: [
      { label: '가볍게', filter: (c) => c.features.alcohol_strength <= 0.4 },
      { label: '적당히', filter: (c) => c.features.alcohol_strength >= 0.3 && c.features.alcohol_strength <= 0.7 },
      { label: '강하게', filter: (c) => c.features.alcohol_strength >= 0.6 },
      { label: '상관없어요', filter: null },
    ],
  },
  {
    dimension: 'sourness',
    text: '마지막 질문! 신맛은 어떻게 하시겠어요?',
    choices: [
      { label: '상큼/새콤하게', filter: (c) => c.features.sourness >= 0.4 },
      { label: '순하게', filter: (c) => c.features.sourness <= 0.3 },
      { label: '상관없어요', filter: null },
    ],
  },
]

export function initCandidatePool(): CocktailRecord[] {
  return getAllCocktailRecords()
}

/**
 * Detect which question dimensions the user already expressed in free text.
 */
export function detectExpressedDimensions(text: string): Set<string> {
  const lower = text.toLowerCase()
  const dims = new Set<string>()
  if (/보드카|럼|진|위스키|데킬라|베이스|베이|base|spirit/i.test(lower)) dims.add('base')
  if (/달콤|달아|단맛|달달|달다|쌉쌀|씁쓸|쓰다|비터|드라이|sweet|bitter/i.test(lower)) dims.add('sweetness')
  if (/도수|강하|약하|가볍|세게|독하|순하|strong|light/i.test(lower)) dims.add('alcohol')
  if (/신맛|상큼|새콤|sour|레몬|라임|시트러스/i.test(lower)) dims.add('sourness')
  return dims
}

function buildAcknowledgement(expressed: Set<string>): string {
  if (expressed.has('base')) return '베이스, 좋네요.\n'
  if (expressed.has('sweetness')) return '단맛, 알겠어요.\n'
  if (expressed.has('alcohol')) return '도수, 오케이.\n'
  if (expressed.has('sourness')) return '신맛 쪽이군요.\n'
  return ''
}

const ASK_INTROS = ['자, ', '그러면 ', '음, ', '']

export function nextFilterQuestion(
  pool: CocktailRecord[],
  startIndex: number,
  /** dimensions already expressed by the user */
  skipDimensions?: Set<string>,
  /** prev answer text for contextual flow */
  previousAnswer?: string,
): { question: FilterQuestion; index: number } | null {
  if (startIndex >= QUESTIONS.length) return null

  let idx = startIndex
  while (idx < QUESTIONS.length && skipDimensions?.has(QUESTIONS[idx].dimension ?? '')) {
    idx++
  }
  if (idx >= QUESTIONS.length) return null

  const q = QUESTIONS[idx]
  const askIntro = ASK_INTROS[idx] ?? ''

  let context = ''
  if (idx === 0) {
    if (skipDimensions && skipDimensions.size > 0) {
      context = buildAcknowledgement(skipDimensions)
    } else {
      context = pool.length <= 7
        ? '후보를 좀 좁혀볼게요.\n'
        : '자, 취향부터 알아보시죠.\n'
    }
  } else if (previousAnswer) {
    const lower = previousAnswer.toLowerCase()
    if (/많이 달콤|1/.test(lower)) context = '달콤하게, 알겠습니다.\n'
    else if (/적당히 달콤|2/.test(lower)) context = '적당히, 무난무난.\n'
    else if (/쌉쌀|드라이|3/.test(lower)) context = '드라이하게, 좋아요.\n'
    else if (/진/.test(lower)) context = '진 베이스, 깔끔하네요.\n'
    else if (/럼/.test(lower)) context = '럼, 달콤하고 부드럽죠.\n'
    else if (/위스키/.test(lower)) context = '위스키, 묵직하게 가시네요.\n'
    else if (/보드카/.test(lower)) context = '보드카, 깔끔 그 자체.\n'
    else if (/데킬라/.test(lower)) context = '데킬라, 화끈하게!\n'
    else if (/시그니처/.test(lower)) context = '시그니처, 특별한 걸 원하시네요.\n'
    else if (/가볍|1/.test(lower)) context = '가볍게, 좋습니다.\n'
    else if (/적당|2/.test(lower)) context = '적당히, 무난하죠.\n'
    else if (/강하|3/.test(lower)) context = '강하게, 한 방이네요.\n'
    else if (/상큼|새콤|1/.test(lower)) context = '상큼하게, 좋아요.\n'
    else if (/순하|2/.test(lower)) context = '순하게, 무난하게.\n'
  }

  const choicesText = q.choices.map((c, i) => `${i + 1}. ${c.label}`).join('\n')

  return {
    question: {
      text: `${context}${askIntro}${q.text}\n\n${choicesText}\n\n---\n(직접 말씀하셔도 돼요)`,
      choices: q.choices,
    },
    index: idx,
  }
}

type FilterRule = {
  test: RegExp
  filter: (c: CocktailRecord) => boolean
}

const FREE_TEXT_RULES: FilterRule[] = [
  { test: /탄산\s*없|노\s*탄산|논\s*카본|부드럽|스트레이트/, filter: (c) => c.features.fizz <= 0.2 },
  { test: /탄산|톡\s*쏘|청량|스파클|기포|상쾌|fizz|스파클링/, filter: (c) => c.features.fizz >= 0.4 },
  { test: /달콤|달아|달게|단맛|달짝|달달|달다|디저트|sweet/, filter: (c) => c.features.sweetness >= 0.4 },
  { test: /쌉쌀|씁쓸|쓰다|비터|쓴맛|bitter|드라이/, filter: (c) => c.features.sweetness <= 0.3 },
  { test: /강하|독하|진하|세게|쎄|쎈|도수\s*높|하이볼|strong/, filter: (c) => c.features.alcohol_strength >= 0.6 },
  { test: /약하|가볍|순하|약한|도수\s*낮|낮은|약하게|soft|light/, filter: (c) => c.features.alcohol_strength <= 0.4 },
  { test: /상큼|새콤|신맛|sour|레몬|라임|시트러스|산뜻/, filter: (c) => c.features.sourness >= 0.4 },
  { test: /순하|안\s*신/, filter: (c) => c.features.sourness <= 0.3 },
  { test: /(^|\s)진(\s|$|으|로|베|이)/, filter: (c) => spiritMatch(c, '진') },
  { test: /럼/, filter: (c) => spiritMatch(c, '럼') },
  { test: /위스키|버번/, filter: (c) => spiritMatch(c, '위스키') },
  { test: /데킬라/, filter: (c) => spiritMatch(c, '데킬라') },
  { test: /보드카/, filter: (c) => spiritMatch(c, '보드카') },
]

export function filterPool(
  pool: CocktailRecord[],
  answer: string,
  questionIndex: number,
): CocktailRecord[] {
  const trimmed = answer.trim()

  // 1. Numeric choice: map "1", "2" … to the corresponding choice filter
  const num = parseInt(trimmed, 10)
  if (!isNaN(num) && num >= 1 && num <= QUESTIONS[questionIndex]?.choices.length) {
    const choice = QUESTIONS[questionIndex].choices[num - 1]
    if (choice.filter) {
      const kept = pool.filter(choice.filter)
      return kept.length > 0 ? kept : pool
    }
    return pool // null filter = "상관없어요"
  }

  // 2. Free-text — chain ALL matching rules instead of first-match-wins
  const lower = answer.toLowerCase()
  let current = pool
  let matched = false

  for (const rule of FREE_TEXT_RULES) {
    if (rule.test.test(lower)) {
      const kept = current.filter(rule.filter)
      if (kept.length > 0) {
        current = kept
        matched = true
      }
    }
  }

  return matched ? current : pool
}

export function pickFromPool(pool: CocktailRecord[], preference: TastePreference): CocktailRecord | null {
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
