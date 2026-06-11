const BASE = 'https://www.thecocktaildb.com/api/json/v1/1'

const INGREDIENT_MAP = {
  'tequila': '데킬라', 'mezcal': '메스칼',
  'vodka': '보드카',
  'gin': '진',
  'rum': '럼', 'light rum': '럼', 'dark rum': '럼', 'spiced rum': '럼',
  'whiskey': '위스키', 'whisky': '위스키', 'bourbon': '버번', 'scotch': '스카치',
  'rye whiskey': '라이 위스키', 'irish whiskey': '아이리시 위스키',
  'brandy': '브랜디', 'cognac': '코냑',
  'campari': '캄파리',
  'triple sec': '트리플 섹', 'cointreau': '쿠앵트로', 'blue curacao': '블루 큐라소',
  'amaretto': '아마레토', 'kahlua': '깔루아',
  'sweet vermouth': '스위트 베르무트', 'dry vermouth': '드라이 베르무트',
  'angostura bitters': '앙고스투라 비터', 'peychauds bitters': '페요 비터',
  'lime juice': '라임 주스', 'lemon juice': '레몬 주스',
  'simple syrup': '설탕 시럽', 'sugar': '설탕', 'sugar syrup': '설탕 시럽',
  'honey syrup': '꿀 시럽', 'honey': '꿀',
  'coconut cream': '코코넛 크림', 'cream of coconut': '코코넛 크림',
  'egg white': '달걀 흰자', 'egg yolk': '달걀 노른자',
  'soda water': '소다수', 'club soda': '소다수',
  'tonic water': '토닉 워터',
  'ginger beer': '진저 비어', 'ginger ale': '진저 에일',
  'cranberry juice': '크랜베리 주스',
  'pineapple juice': '파인애플 주스',
  'orange juice': '오렌지 주스',
  'grapefruit juice': '자몽 주스',
  'tomato juice': '토마토 주스',
  'grenadine': '그레나딘',
  'mint': '민트', 'fresh mint': '민트',
  'salt': '소금', 'coarse salt': '굵은 소금',
  'pepper': '후추', 'black pepper': '후추',
  'tabasco': '타바스코', 'hot sauce': '핫소스',
  'worcestershire sauce': '우스터 소스',
  'prosecco': '프로세코', 'champagne': '샴페인',
  'coffee': '커피', 'espresso': '에스프레소',
  'milk': '우유', 'cream': '크림', 'heavy cream': '생크림', 'half and half': '하프 앤 하프',
  'chocolate': '초콜릿', 'dark chocolate': '다크 초콜릿',
  'absinthe': '압생트', 'pastis': '파스티스',
  'coca-cola': '콜라', 'coke': '콜라', 'cola': '콜라',
  'sprite': '스프라이트', '7-up': '세븐업',
  'applejack': '애플잭',
  'sherry': '셰리', 'port': '포트', 'madeira': '마데이라',
  'cinnamon': '시나몬', 'nutmeg': '육두구', 'clove': '정향',
  'vanilla': '바닐라', 'vanilla extract': '바닐라 추출액',
  'orange flower water': '오렌지 플라워 워터',
  'rose water': '로즈 워터',
  'agave syrup': '아가베 시럽',
  'maple syrup': '메이플 시럽',
  'cucumber': '오이', 'celery': '셀러리',
  'cherry': '체리', 'maraschino cherry': '마라시노 체리',
  'olive': '올리브', 'cocktail olive': '올리브',
  'lemon': '레몬', 'lime': '라임', 'orange': '오렌지',
  'strawberry': '딸기', 'raspberry': '라즈베리', 'blueberry': '블루베리',
  'banana': '바나나', 'pineapple': '파인애플', 'watermelon': '수박',
  'mango': '망고', 'peach': '복숭아', 'apricot': '살구',
  'coconut': '코코넛', 'coconut milk': '코코넛 밀크',
}

function translateIngredient(name) {
  if (!name) return ''
  return INGREDIENT_MAP[name.trim().toLowerCase()] || name.trim()
}

function getIngredients(drink) {
  const list = []
  for (let i = 1; i <= 15; i++) {
    const name = drink[`strIngredient${i}`]
    const measure = drink[`strMeasure${i}`]
    if (name) {
      list.push({
        name: translateIngredient(name),
        measure: (measure || '').trim(),
      })
    }
  }
  return list
}

function inferTaste(ingredients, drink) {
  const eng = []
  for (let i = 1; i <= 15; i++) {
    if (drink[`strIngredient${i}`]) eng.push(drink[`strIngredient${i}`].toLowerCase())
  }
  const all = eng.join(' ')

  const hasSweet = /sugar|syrup|simple|sweet|honey|coka|coke|cola|grenadine|triple.*sec|curaçao|curaco|cream|coconut|pineapple|orange|grape|cherry|berry|chocolate|choco|agave|maple|banana|mango|peach|apricot/.test(all)
  const hasSour = /lemon|lime|grapefruit|citrus|sour/.test(all)
  const hasBitter = /bitter|campari|tonic|angostura/.test(all)
  const hasCarbonated = /soda|cola|tonic|sparkling|champagne|prosecco|ginger beer|ginger ale|sprite|7-up/.test(all)
  const isAlcoholic = drink.strAlcoholic === 'Alcoholic'

  return {
    sweet: hasSweet ? 4 : 2,
    sour: hasSour ? 4 : 1,
    bitter: hasBitter ? 3 : 1,
    savory: 1,
    alcohol: !isAlcoholic ? 1 : drink.strCategory === 'Shot' ? 5 : 3,
    carbonated: hasCarbonated,
  }
}

function inferBase(ingredients) {
  const first = ingredients[0]
  if (!first) return '리큐르'
  const n = first.name.toLowerCase()
  if (/데킬라|메스칼/.test(n) || /tequila|mezcal/.test(n)) return '데킬라'
  if (/보드카/.test(n) || /vodka/.test(n)) return '보드카'
  if (/진/.test(n) || /gin/.test(n)) return '진'
  if (/럼/.test(n) || /rum/.test(n)) return '럼'
  if (/위스키|버번|스카치/.test(n) || /whiskey|whisky|bourbon|scotch|rye/.test(n)) return '위스키'
  if (/브랜디|코냑/.test(n) || /brandy|cognac|applejack/.test(n)) return '브랜디'
  if (/리큐르|깔루아|아마레토|셰리|포트/.test(n) || /liqueur|amaretto|kahlua|baileys|sherry|port/.test(n)) return '리큐르'
  return '리큐르'
}

function inferAroma(ingredients, drink) {
  const all = []
  for (let i = 1; i <= 15; i++) {
    const n = drink[`strIngredient${i}`]
    if (n) all.push(n.toLowerCase())
  }

  const tags = []
  if (all.some(i => /lemon|lime|grapefruit|orange/.test(i))) tags.push('시트러스')
  if (all.some(i => /mint|herb|basil|rosemary|thyme|sage/.test(i))) tags.push('허브')
  if (all.some(i => /flower|floral|rose|lavender|orange flower/.test(i))) tags.push('플로럴')
  if (all.some(i => /berry|strawberry|raspberry|blueberry|cherry/.test(i))) tags.push('베리')
  if (all.some(i => /pineapple|coconut|banana|tropical|mango|melon|watermelon|peach|apricot/.test(i))) tags.push('과일')
  if (all.some(i => /coffee|espresso|mocha/.test(i))) tags.push('커피')
  if (all.some(i => /chocolate|cacao|cocoa/.test(i))) tags.push('초콜릿')
  if (all.some(i => /cream|coconut cream|milk|egg white|half and half/.test(i))) tags.push('크리미')
  if (all.some(i => /spice|ginger|cinnamon|nutmeg|clove|allspice/.test(i))) tags.push('스파이시')
  if (all.some(i => /whiskey|whisky|bourbon|smoke|scotch|rye/.test(i))) tags.push('스모키')
  if (all.some(i => /celery|tomato|vegetable/.test(i))) tags.push('세이보리')
  if (all.some(i => /cucumber|melon|watermelon/.test(i))) tags.push('프레시')
  if (tags.length === 0) tags.push('과일')
  return tags
}

function generateVibe(taste) {
  if (taste.alcohol >= 4) return '강렬하고 묵직한, 어른의 맛'
  if (taste.sweet >= 4 && taste.carbonated) return '달콤하고 톡 쏘는 즐거움'
  if (taste.sweet >= 4) return '달콤하고 부드러운 매력'
  if (taste.sour >= 4 && taste.carbonated) return '상큼하고 청량한 산뜻함'
  if (taste.sour >= 4) return '신선하고 상큼한 맛의 조화'
  if (taste.bitter >= 3) return '쓴맛 속에 숨겨진 깊은 풍미'
  if (taste.carbonated) return '톡 쏘는 청량감이 일품인 칵테일'
  return '균형 잡힌 클래식한 한 잔'
}

function generateStory(drink, ingredients, taste, base) {
  const name = drink.strDrink
  const cat = drink.strCategory || ''
  const alcoholic = drink.strAlcoholic || ''
  const mainIngredient = ingredients[0]

  const lines = []
  lines.push(`'${name}'은(는) ${base} 베이스의 칵테일입니다.`)

  if (cat && cat !== 'Unknown') lines.push(`${cat} 스타일로 제조됩니다.`)
  if (alcoholic === 'Non alcoholic') lines.push('논알콜 칵테일로 부담 없이 즐기실 수 있습니다.')

  const desc = []
  if (taste.sweet >= 4) desc.push('달콤한')
  if (taste.sour >= 4) desc.push('상큼한')
  if (taste.bitter >= 3) desc.push('쌉쌀한')
  if (taste.alcohol >= 4) desc.push('도수가 높은')
  if (desc.length > 1) lines.push(`${desc.slice(0, -1).join(', ')} ${desc.slice(-1)} 맛이 특징이며,`)
  else if (desc.length > 0) lines.push(`${desc[0]} 맛이 특징이며,`)
  else lines.push('부드러운 맛이 특징이며,')

  lines.push(`주 재료는 ${mainIngredient.name}입니다.`)

  const inst = drink.strInstructions
  if (inst) {
    const short = inst.replace(/\n/g, ' ').split('.').slice(0, 2).join('.').trim()
    if (short) lines.push(`레시피: ${short}.`)
  }

  return lines.join(' ')
}

function toOurCocktail(drink) {
  const ingredients = getIngredients(drink)
  const taste = inferTaste(ingredients, drink)
  const base = inferBase(ingredients)
  const aroma = inferAroma(ingredients, drink)
  const vibe = generateVibe(taste)
  const story = generateStory(drink, ingredients, taste, base)

  return {
    id: `api-${drink.idDrink}`,
    name: drink.strDrink,
    taste,
    aroma,
    base,
    ingredients: ingredients.map(i => i.name),
    measures: ingredients.map(i => i.measure),
    image: drink.strDrinkThumb,
    glass: drink.strGlass,
    category: drink.strCategory,
    alcoholic: drink.strAlcoholic,
    story,
    vibe,
  }
}

function toJS(obj, indent = '  ') {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return JSON.stringify(obj)
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map(v => toJS(v, indent + '  '))
    if (items.every(i => i.length < 40)) return `[${items.join(', ')}]`
    return `[\n${indent + '  '}${items.join(`,\n${indent + '  '}`)},\n${indent}]`
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    const items = keys.map(k => {
      const val = toJS(obj[k], indent + '  ')
      return `${indent}  ${k}: ${val}`
    })
    return `{\n${items.join(',\n')},\n${indent}}`
  }
  return String(obj)
}

async function main() {
  const seen = new Set()
  const results = []

  for (let code = 97; code <= 122; code++) {
    const letter = String.fromCharCode(code)
    const url = `${BASE}/search.php?f=${letter}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (!data.drinks) {
        console.error(`[${letter}] no results`)
        continue
      }
      let added = 0
      for (const drink of data.drinks) {
        if (seen.has(drink.idDrink)) continue
        seen.add(drink.idDrink)
        results.push(toOurCocktail(drink))
        added++
      }
      console.error(`[${letter}] ${data.drinks.length} fetched, ${added} new, total: ${results.length}`)
    } catch (err) {
      console.error(`[${letter}] error: ${err.message}`)
    }
  }

  console.error(`\nTotal unique cocktails: ${results.length}`)

  const output = `// Auto-generated from TheCocktailDB API (${new Date().toISOString().split('T')[0]})
// ${results.length} unique cocktails
export const apiCocktails = ${toJS(results)}
`
  process.stdout.write(output)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
