/**
 * One-off: fetch TheCocktailDB data and print enriched cocktails JSON.
 * Run: node scripts/enrich-database.mjs
 */

const BASE = 'https://www.thecocktaildb.com/api/json/v1/1'

const API_SEARCH = {
  'mojito': 'Mojito',
  'old-fashioned': 'Old Fashioned',
  'french-75': 'French 75',
  'ramos-gin-fizz': 'Ramos Gin Fizz',
  'negroni': 'Negroni',
  'margarita': 'Margarita',
  'cosmopolitan': 'Cosmopolitan',
  'martini': 'Martini',
  'daiquiri': 'Daiquiri',
  'whiskey-sour': 'Whiskey Sour',
  'pina-colada': 'Pina Colada',
  'espresso-martini': 'Espresso Martini',
  'mint-julep': 'Mint Julep',
  'bloody-mary': 'Bloody Mary',
  'sidecar': 'Sidecar',
  'manhattan': 'Manhattan',
  'caipirinha': 'Caipirinha',
  'sazerac': 'Sazerac',
  'singapore-sling': 'Singapore Sling',
  'tom-collins': 'Tom Collins',
  'bellini': 'Bellini',
  'moscow-mule': 'Moscow Mule',
  'mai-tai': 'Mai Tai',
  'aperol-spritz': 'Aperol Spritz',
  'pisco-sour': 'Pisco Sour',
  'painkiller': 'Painkiller',
  'clover-club': 'Clover Club',
  'bramble': 'Bramble',
}

const INGREDIENT_MAP = {
  tequila: '데킬라', mezcal: '메스칼', vodka: '보드카', gin: '진',
  rum: '럼', 'light rum': '럼', 'dark rum': '럼', 'spiced rum': '럼',
  whiskey: '위스키', whisky: '위스키', bourbon: '버번', scotch: '스카치',
  'rye whiskey': '라이 위스키', 'rye bourbon': '라이 위스키', brandy: '브랜디', cognac: '코냑',
  campari: '캄파리', 'sweet vermouth': '스위트 베르무트', 'dry vermouth': '드라이 베르무트',
  'red vermouth': '스위트 베르무트', vermouth: '베르무트',
  'triple sec': '트리플 섹', cointreau: '쿠앵트로', 'blue curacao': '블루 큐라소',
  lime: '라임', lemon: '레몬', 'lime juice': '라임 주스', 'lemon juice': '레몬 주스',
  'simple syrup': '설탕 시럽', sugar: '설탕', 'powdered sugar': '설탕',
  'coconut cream': '코코넛 크림', 'egg white': '달걀 흰자', 'soda water': '소다수', 'club soda': '소다수',
  'ginger beer': '진저 비어', 'cranberry juice': '크랜베리 주스', 'pineapple juice': '파인애플 주스',
  'orange juice': '오렌지 주스', 'tomato juice': '토마토 주스', grenadine: '그레나딘', mint: '민트',
  prosecco: '프로세코', champagne: '샴페인', coffee: '커피', cream: '크림', absinthe: '압생트',
  'angostura bitters': '앙고스투라 비터', bitters: '비터',
  pisco: '피스코', cachaca: '카샤사', 'ginger ale': '진저 에일',
  aperol: '아페롤', kahlua: '깔루아', 'coffee liqueur': '커피 리큐어',
  'orange bitters': '오렌지 비터', 'peychaud bitters': '페요 비터',
  'cherry brandy': '체리 브랜디', 'raspberry syrup': '라즈베리 시럽',
  'creme de mure': '크렘 드 뮤르', 'creme de cassis': '크렘 드 카시스',
  'orange curacao': '오렌지 퀴라소', 'orgeat syrup': '오르젯 시럽',
  nutmeg: '육두구', salt: '소금', pepper: '후추', tabasco: '타바스코',
  'worcestershire sauce': '우스터 소스', water: '물', ice: '얼음',
  'peach puree': '복숭아 퓌레', 'peach schnapps': '복숭아 슈냅스',
  'maraschino cherry': '체리', cherry: '체리',
}

function translateIngredient(name) {
  if (!name) return ''
  const key = name.trim().toLowerCase()
  return INGREDIENT_MAP[key] || name.trim()
}

function getRecipeItems(drink) {
  const items = []
  for (let i = 1; i <= 15; i++) {
    const name = drink[`strIngredient${i}`]
    if (!name) continue
    items.push({
      ingredient: translateIngredient(name),
      measure: (drink[`strMeasure${i}`] || '').trim(),
    })
  }
  return items
}

function inferTaste(drink, recipeItems) {
  const eng = []
  for (let i = 1; i <= 15; i++) {
    if (drink[`strIngredient${i}`]) eng.push(drink[`strIngredient${i}`].toLowerCase())
  }
  const all = [...recipeItems.map(r => r.ingredient).join(' ').toLowerCase(), ...eng.join(' ')]

  const hasSweet = /sugar|syrup|simple|sweet|honey|grenadine|triple|cointreau|curacao|cream|coconut|pineapple|orange|grape|cherry|berry|chocolate|peach|orgeat/.test(all)
  const hasSour = /lemon|lime|grapefruit|citrus|sour|tomato/.test(all)
  const hasBitter = /bitter|campari|tonic|angostura|aperol|vermouth/.test(all)
  const hasSavory = /worcestershire|tabasco|salt|pepper|tomato/.test(all)
  const measures = []
  for (let i = 1; i <= 15; i++) {
    const m = drink[`strMeasure${i}`]
    if (m) measures.push(m.toLowerCase())
  }
  const measureText = measures.join(' ')
  const hasCarbonated = /soda|cola|tonic|sparkling|champagne|prosecco|ginger beer|ginger ale|club soda|소다수|샴페인|프로세코|진저/.test(all + measureText)
    || /French 75|Collins|Spritz|Sling|Mule|Bellini|Fizz|Mojito/i.test(drink.strDrink)
  const isAlcoholic = drink.strAlcoholic === 'Alcoholic'

  return {
    sweet: hasSweet ? (drink.strDrink?.includes('Colada') || /cream|coconut|peach/.test(all) ? 4 : 3) : 2,
    sour: hasSour ? 3 : 1,
    bitter: hasBitter ? (drink.strDrink?.includes('Negroni') || /campari|aperol/.test(all) ? 4 : 3) : 1,
    savory: hasSavory ? 3 : 1,
    alcohol: !isAlcoholic ? 1 : drink.strCategory === 'Shot' ? 5 : /martini|manhattan|old fashioned|sazerac|negroni/i.test(drink.strDrink) ? 4 : 3,
    carbonated: hasCarbonated,
  }
}

function inferBase(recipeItems) {
  const first = recipeItems[0]?.ingredient?.toLowerCase() || ''
  if (/데킬라/.test(first)) return '데킬라'
  if (/보드카/.test(first)) return '보드카'
  if (/진/.test(first)) return '진'
  if (/럼|카샤사/.test(first)) return '럼'
  if (/위스키|버번|스카치|라이/.test(first)) return '위스키'
  if (/브랜디|코냑|피스코/.test(first)) return '브랜디'
  if (/아페롤|캄파리|리큐르/.test(first)) return '리큐르'
  return '리큐르'
}

async function searchDrink(name) {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(name)}`)
  const data = await res.json()
  if (!data.drinks?.length) return null
  const exact = data.drinks.find(d => d.strDrink.toLowerCase() === name.toLowerCase())
  return exact || data.drinks[0]
}

// Load local cocktails from database - parse minimally via dynamic import
const { cocktails } = await import('../src/lib/cocktails/database.js')

const report = []

for (const local of cocktails) {
  const searchName = API_SEARCH[local.id]
  if (!searchName) {
    report.push({ id: local.id, status: 'no mapping' })
    continue
  }

  let drink = await searchDrink(searchName)
  if (!drink && searchName !== searchName.replace(' ', '')) {
    drink = await searchDrink(searchName.replace(/\s+/g, ''))
  }

  if (!drink) {
    report.push({ id: local.id, searchName, status: 'not found' })
    continue
  }

  const recipe = getRecipeItems(drink)
  const taste = inferTaste(drink, recipe)
  const base = inferBase(recipe)

  const enriched = {
    ...local,
    nameEn: drink.strDrink,
    taste,
    base,
    ingredients: recipe.map(r => r.ingredient),
    recipe,
    recipeText: (drink.strInstructions || '').replace(/[\r\n]+/g, ' ').trim(),
    image: drink.strDrinkThumb || undefined,
    glass: drink.strGlass || undefined,
    category: drink.strCategory || undefined,
    alcoholic: drink.strAlcoholic || undefined,
    apiId: drink.idDrink,
  }

  report.push({
    id: local.id,
    status: 'ok',
    apiName: drink.strDrink,
    enriched,
  })

  await new Promise(r => setTimeout(r, 120))
}

const failed = report.filter(r => r.status !== 'ok')
const ok = report.filter(r => r.status === 'ok')

console.log(JSON.stringify({ failed, ok: ok.map(r => ({ id: r.id, apiName: r.apiName })) }, null, 2))

// Write enriched data for next step
import { writeFileSync } from 'fs'
writeFileSync(
  'scripts/enriched-output.json',
  JSON.stringify(ok.map(r => r.enriched), null, 2),
  'utf8'
)
console.log(`\nWrote ${ok.length} cocktails to scripts/enriched-output.json`)
if (failed.length) console.error('Failed:', failed)
