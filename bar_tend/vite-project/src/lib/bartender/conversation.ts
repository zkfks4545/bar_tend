import { cocktails } from '../cocktails/database.js'
import type { Cocktail, Message, BartenderResponse, ConversationContext } from '../../types.js'

const kf = (patterns: string[]) => new RegExp(patterns.map(
  (p) => (/^[a-z]/i.test(p) ? `\\b${p}\\b` : p)
).join('|'))

function detectIntent(input: string): string {
  const lower = input.toLowerCase()
  if (kf(['나갈게', '갈게', '바이', '끝', '잘 있어', '다음에', '안녕히']).test(lower)) return 'exit-intent'
  if (kf(['추천', '뭐가 좋아', '칵테일', '마실', '취하', '주문']).test(lower)) return 'cocktail-query'
  if (kf(['달콤', '쓰다', '신맛', '짠맛', '향', '맛', '상큼', '청량', '순하', '강하', '진하']).test(lower)) return 'taste-query'
  if (kf(['어떻게', '재료', '만들', '레시피', '뭐가 들']).test(lower)) return 'recipe-query'
  if (kf(['힘들', '우울', '슬퍼', '행복', '기분', '외롭', '지쳤', '스트레스']).test(lower)) return 'mood-talk'
  return 'general-chat'
}

export function buildConversationContext(history: Message[]): ConversationContext {
  const ctx: ConversationContext = {
    greeted: false,
    userMood: null,
    lastTopic: null,
    mentionedCocktail: null,
    recommendedCocktail: null,
    exchangeCount: 0,
    lastBartenderWasQuestion: false,
    totalUserMessages: 0,
  }

  for (const msg of history) {
    const t = (msg.text || '').toLowerCase()

    if (msg.role === 'user') {
      ctx.totalUserMessages++

      if (kf(['안녕', '하이', '방가', '처음', '반가워']).test(t)) ctx.greeted = true
      if (kf(['힘들', '우울', '슬퍼', '외롭', '스트레스', '피곤', '괴롭', '지쳤']).test(t)) ctx.userMood = 'sad'
      if (kf(['좋아', '행복', '신나', '축하', '기쁘', '즐거', '최고']).test(t)) ctx.userMood = 'happy'
      if (kf(['추천', '뭐가 좋아', '칵테일', '마실', '취하', '주문']).test(t)) ctx.lastTopic = 'cocktail-request'
      if (kf(['달콤', '달아', '시럽', '달게', '달짝']).test(t)) ctx.lastTopic = 'taste-sweet'
      if (kf(['씁쓸', '쓰다', '비터', '쓴맛']).test(t)) ctx.lastTopic = 'taste-bitter'
      if (kf(['상쾌', '시원', '청량', 'fresh', '탄산', '기포']).test(t)) ctx.lastTopic = 'taste-refresh'
      if (kf(['이야기', '사연', '비밀', '옛날', '추억', '유래']).test(t)) ctx.lastTopic = 'story'
      if (kf(['어떻게', '재료', '만들', '레시피', '뭐가 들']).test(t)) ctx.lastTopic = 'recipe'

      for (const c of cocktails) {
        if (t.includes(c.name.toLowerCase())) {
          ctx.mentionedCocktail = c
          break
        }
      }
    } else {
      const b = msg.text.toLowerCase()
      if (/\?$/.test(msg.text.trim())) ctx.lastBartenderWasQuestion = true
      for (const c of cocktails) {
        if (b.includes(c.name.toLowerCase())) {
          ctx.recommendedCocktail = c
          break
        }
      }
    }
  }

  ctx.exchangeCount = Math.floor(history.length / 2)
  return ctx
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface ResponseTemplate {
  response: string
  expression: BartenderResponse['expression']
}

const SAD_RESPONSES: ResponseTemplate[] = [
  { response: '손님, 표정이 안 좋아 보여요. 제가 농담을 할까요, 술을 줄까요? 둘 다 별로면... 그냥 조용히 있어드릴게요.', expression: 'sympathy' },
  { response: '인생이 힘들죠, 저도 알아요. 근데 저는 알바 중이니까 일단 한 잔 하시겠어요?', expression: 'sympathy' },
  { response: '세상이 무거우면 잠시 내려놓는 게 답이에요. 여기서는 그게 제 역할이니까, 천천히 쉬다 가세요.', expression: 'sympathy' },
]

const HAPPY_RESPONSES: ResponseTemplate[] = [
  { response: '오, 좋은 기운이 느껴져요. 오늘은 손님 한턱 내시는 날인가 보네요? 농담이고, 축하 한 잔 준비해드릴게요.', expression: 'smirk' },
  { response: '좋은 날은 좋은 칵테일이 빠질 수 없죠. 제가 딱 골라드릴게요. 실패하면... 책임은 안 져요.', expression: 'smirk' },
]

const COCKTAIL_REQUEST: ResponseTemplate[] = [
  { response: '칵테일 원하시는군요. 취향을 좀 알아야 하는데... 달콤하게? 쌉쌀하게? 아니면 그냥 제 마음대로 드릴까요?', expression: 'thinking' },
  { response: '좋아요. 손님 오늘 분위기에 맞는 걸로 골라보겠습니다. 대신 취향을 좀 알려주셔야 해요.', expression: 'talk' },
]

const TASTE_SWEET: ResponseTemplate[] = [
  { response: '달콤한 거, 좋은 선택이에요. 피나 콜라다나 브램블처럼 과일 달콤함이 확 오는 걸로 찾아볼게요.', expression: 'talk' },
  { response: '단맛은 모든 사람을 설득하는 맛이죠. 단맛 뒤에 숨은 이야기도 있긴 한데... 그건 마시면서 천천히.', expression: 'talk' },
]

const TASTE_BITTER: ResponseTemplate[] = [
  { response: '쓴맛이라, 역시 나이를 아시는군요. 네그로니나 올드 패션드, 클래식하게 가시죠.', expression: 'smirk' },
  { response: '쓴맛에는 깊이가 있죠. 인생처럼. 근데 제가 인생 얘기하기엔 알바생이라... 네그로니 한 잔 어떠세요?', expression: 'smirk' },
]

const TASTE_REFRESH: ResponseTemplate[] = [
  { response: '청량한 걸로 가시죠. 모히토나 진피즈, 민트와 시트러스가 사는 걸로 찾아볼게요.', expression: 'talk' },
  { response: '시원하게 가시죠. 제가 만들면 더 시원합니다. 농담 아니에요, 얼음 많이 넣어드려요.', expression: 'talk' },
]

const RECIPE_REQUEST: ResponseTemplate[] = [
  { response: '레시피를 물어보시면... 영업 비밀인데요. 뭐, 손님이시니 가르쳐드리죠. 어떤 게 궁금하세요?', expression: 'talk' },
  { response: '직접 만들어보시려고요? 멋진 취미네요. 제 비법을 좀 알려드리겠습니다.', expression: 'talk' },
]

function getCocktailMentionResponses(cocktail: Cocktail): ResponseTemplate[] {
  return [
    { response: `아, ${cocktail.name}. 아시는 분이네요. ${cocktail.vibe}. ${cocktail.story} 혹시 한 잔 하시겠어요?`, expression: 'talk' },
    { response: `${cocktail.name}을 아시는군요. ${cocktail.vibe}. 제가 만들면 더 특별해...지려나? 한번 해보죠.`, expression: 'smirk' },
  ]
}

const GENERAL_CHAT: ResponseTemplate[] = [
  { response: '세상은 빠르게 돌아가는데, 여기 바에서는 시간이 느리게 가는 것 같지 않아요? 제 시급도 느리게 가는 것 같지만...', expression: 'idle' },
  { response: '손님 말씀, 맞는 말이에요. 가끔은 대화 자체가 술보다 취하게 할 때가 있죠. 근데 술도 있어요.', expression: 'talk' },
  { response: '밤이 깊어갈수록 이야기도 깊어지죠. 전 알바라 피곤하지만... 천천히 하세요.', expression: 'talk' },
  { response: '이 바에는 여러 사람들의 이야기가 쌓여 있어요. 손님 이야기도 여기 남겨두시면... 제 기억력이 좋은 편은 아니라서 금방 잊을 것 같네요.', expression: 'talk' },
]

const AFTER_RECOMMENDATION: ResponseTemplate[] = [
  { response: '아까 그 칵테일, 괜찮으셨나요? 다른 것도 찾아드릴까요? 취향이 생기면 계속 찾게 되는 법이니까.', expression: 'talk' },
  { response: '또 오셨네요. 저번에 드린 그거 아직 기억나요? 말이 나온 김에 다른 것도 추천해드릴까요?', expression: 'smirk' },
]

export function generateResponse(input: string, history: Message[]): BartenderResponse {
  const ctx = buildConversationContext(history)

  if (ctx.mentionedCocktail) {
    return pick(getCocktailMentionResponses(ctx.mentionedCocktail))
  }

  const intent = detectIntent(input)

  switch (intent) {
    case 'exit-intent':
      return { response: '벌써 가세요? 또 오세요, 기다리고 있을게요. 알바니까요.', expression: 'idle' }

    case 'cocktail-query':
      return pick(COCKTAIL_REQUEST)

    case 'mood-talk': {
      if (ctx.userMood === 'sad') return pick(SAD_RESPONSES)
      if (ctx.userMood === 'happy') return pick(HAPPY_RESPONSES)
      return {
        response: '기분 얘기를 해주셨네요. 어떤 감정이든 여기선 환영이에요. 그 기분에 맞는 술을 찾아볼게요.',
        expression: 'talk',
      }
    }

    case 'taste-query': {
      if (kf(['달콤', '달아', '시럽', '달게', '단']).test(input)) return pick(TASTE_SWEET)
      if (kf(['씁쓸', '쓰다', '비터', '쓴맛']).test(input)) return pick(TASTE_BITTER)
      if (kf(['상쾌', '시원', '청량', 'fresh', '탄산', '순하', '강하', '진하']).test(input)) return pick(TASTE_REFRESH)
      return {
        response: '칵테일은 맛의 조화예요. 어떤 맛을 원하시는지 알려주시면 그에 맞춰 찾아드릴게요.',
        expression: 'talk',
      }
    }

    case 'recipe-query':
      return pick(RECIPE_REQUEST)

    default: {
      if (ctx.recommendedCocktail && ctx.lastTopic === 'cocktail-request') {
        return pick(AFTER_RECOMMENDATION)
      }
      if (ctx.userMood === 'sad') return pick(SAD_RESPONSES)
      return pick(GENERAL_CHAT)
    }
  }
}
