import type { KeywordRule } from '../../types.js'

function koreanFriendly(patterns: string[]): string {
  return patterns.map((p) => {
    if (/^[a-zA-Z]/.test(p)) return `\\b${p}\\b`
    return p
  }).join('|')
}

export const keywordRules: KeywordRule[] = [
  {
    pattern: new RegExp(koreanFriendly(['안녕', '하이', '처음', '방가', '반가워'])),
    expression: 'talk',
    response: '어? 처음 뵙는 분 같은데... 잘 찾아오셨네요. Re:Station 온 걸 환영합니다~',
  },
  {
    pattern: new RegExp(koreanFriendly(['힘들', '우울', '슬퍼', '지쳤', '피곤', '외롭', '괴롭', '스트레스'])),
    expression: 'sympathy',
    response: '오늘 하루가 손님한테 일을 꽤 몰아줬나 보네요. 여기선 일단 짐 말고 취향만 내려놓으시면 돼요.',
  },
  {
    pattern: new RegExp(koreanFriendly(['좋아', '행복', '신나', '기분', '축하', '최고', '기쁘', '즐거'])),
    expression: 'smirk',
    response: '오, 좋은 일이 먼저 도착했네요. 잔은 뒤늦게 합류시켜 드릴까요?',
  },
  {
    pattern: new RegExp(koreanFriendly(['추천', '뭐가 좋아', '칵테일', '마실', '취하', '주문'])),
    expression: 'talk',
    response: '추천을 원하시는군요. 손님 취향을 맞혀야 하는 건가... 좀 압박되는데요. 그래도 한번 해보죠.',
  },
  {
    pattern: new RegExp(koreanFriendly(['놀라', '대박', '어떻게', '미친', '신기'])),
    expression: 'surprised',
    response: '허, 세상에 이런 일이 다 있네요. 저도 한잔 해야 할까... 아니, 일하는 중이죠. 손님은 어떠세요?',
  },
  {
    pattern: new RegExp(koreanFriendly(['이야기', '사연', '비밀', '옛날', '추억'])),
    expression: 'thinking',
    response: '이야기가 있으신 표정이네요. 제 시급에는 비밀 유지비도 포함된 걸로 해둘게요.',
  },
  {
    pattern: new RegExp(koreanFriendly(['달콤', '달아', '시럽', '달게', '달짝'])),
    expression: 'talk',
    response: '단맛! 좋죠. 단 게 최고인 거 아는데... 칵테일로도 달콤하게 가능합니다. 찾아볼게요.',
  },
  {
    pattern: new RegExp(koreanFriendly(['씁쓸', '쓰다', '비터', '쓴맛', 'bitter'])),
    expression: 'smirk',
    response: '쓴맛이라... 어른의 맛을 아시는군요. 인생도 쓰고 커피도 쓰고, 칵테일도 쓰게 마시는 거죠.',
  },
  {
    pattern: new RegExp(koreanFriendly(['상쾌', '시원', '청량', 'fresh'])),
    expression: 'talk',
    response: '청량하게 가시죠! 속이 확 뚫리는 그 느낌, 저도 좋아합니다. 시원한 걸로 찾아볼게요.',
  },
  {
    pattern: new RegExp(koreanFriendly(['탄산', '톡쏘', '톡 쏘', '스파클', 'fizz', '기포'])),
    expression: 'talk',
    response: '톡 쏘는 걸 원하시네요. 콜라도 있긴 한데... 칵테일로 더 세련되게 가보시죠.',
  },
  {
    pattern: new RegExp(koreanFriendly(['신맛', '상큼', '새콤', 'sour', '시트러스'])),
    expression: 'talk',
    response: '상큼한 거요? 입안에 산 바람이 부는 느낌이죠. 좋아요, 찾아볼게요.',
  },
  {
    pattern: new RegExp(koreanFriendly(['강하', '독하', '진하', '세게', '도수'])),
    expression: 'talk',
    response: '강한 걸 찾으시네요. 잔은 작아도 존재감은 출석부보다 확실하죠. 천천히 드실 수 있는 쪽으로 볼게요.',
  },
]
