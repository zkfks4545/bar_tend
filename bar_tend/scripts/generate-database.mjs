import { readFileSync, writeFileSync } from 'fs'

const ORDER = [
  'mojito', 'old-fashioned', 'french-75', 'ramos-gin-fizz', 'negroni', 'margarita',
  'cosmopolitan', 'martini', 'daiquiri', 'whiskey-sour', 'pina-colada', 'espresso-martini',
  'mint-julep', 'bloody-mary', 'sidecar', 'manhattan', 'caipirinha', 'sazerac',
  'singapore-sling', 'tom-collins', 'bellini', 'moscow-mule', 'mai-tai', 'aperol-spritz',
  'pisco-sour', 'painkiller', 'clover-club', 'bramble',
]

const PAINKILLER_FALLBACK = {
  id: 'painkiller',
  name: '페인킬러',
  nameEn: 'Painkiller',
  taste: { sweet: 4, sour: 2, bitter: 1, savory: 1, alcohol: 2, carbonated: false },
  aroma: ['과일', '코코넛', '시트러스'],
  base: '럼',
  ingredients: ['럼', '파인애플 주스', '오렌지 주스', '코코넛 크림', '육두구'],
  recipe: [
    { ingredient: '럼', measure: '60 ml' },
    { ingredient: '파인애플 주스', measure: '120 ml' },
    { ingredient: '오렌지 주스', measure: '30 ml' },
    { ingredient: '코코넛 크림', measure: '30 ml' },
    { ingredient: '육두구', measure: 'garnish' },
  ],
  recipeText: 'Add rum, pineapple juice, orange juice, and coconut cream to a shaker with ice. Shake well and strain into a glass. Grate fresh nutmeg on top.',
  story: '페인킬러라는 이름처럼 "모든 고통을 잠재우는 칵테일"이라는 뜻이에요. 1970년대 버진 아일랜드에서 탄생했죠. 파인애플과 코코넛의 달콤함이 입안 가득 퍼지면서 스트레스까지 녹여주는 기분이에요.',
  vibe: '열대 섬의 달콤한 도피',
  glass: 'Highball glass',
  category: 'Cocktail',
  alcoholic: 'Alcoholic',
}

function esc(str) {
  return String(str)
    .replace(/\r\n/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\s+/g, ' ')
    .trim()
}

function fmt(obj) {
  const lines = []
  const p = (s) => lines.push(`    ${s}`)

  p(`id: '${esc(obj.id)}',`)
  p(`name: '${esc(obj.name)}',`)
  p(`nameEn: '${esc(obj.nameEn)}',`)
  p('taste: {')
  for (const [k, v] of Object.entries(obj.taste)) {
    lines.push(`      ${k}: ${v},`)
  }
  p('},')
  p(`aroma: [${obj.aroma.map(a => `'${esc(a)}'`).join(', ')}],`)
  p(`base: '${esc(obj.base)}',`)
  p(`ingredients: [${obj.ingredients.map(i => `'${esc(i)}'`).join(', ')}],`)
  p('recipe: [')
  for (const r of obj.recipe) {
    lines.push(`      { ingredient: '${esc(r.ingredient)}', measure: '${esc(r.measure || '')}' },`)
  }
  p('],')
  if (obj.recipeText) p(`recipeText: '${esc(obj.recipeText)}',`)
  p(`story: '${esc(obj.story)}',`)
  p(`vibe: '${esc(obj.vibe)}',`)
  if (obj.popCulture) p(`popCulture: '${esc(obj.popCulture)}',`)
  if (obj.image) p(`image: '${esc(obj.image)}',`)
  if (obj.glass) p(`glass: '${esc(obj.glass)}',`)
  if (obj.category) p(`category: '${esc(obj.category)}',`)
  if (obj.alcoholic) p(`alcoholic: '${esc(obj.alcoholic)}',`)
  if (obj.apiId) p(`apiId: '${esc(obj.apiId)}',`)

  return `  {\n${lines.join('\n')}\n  }`
}

const enriched = JSON.parse(readFileSync('scripts/enriched-output.json', 'utf8'))
const byId = Object.fromEntries(enriched.map(c => [c.id, c]))

const sorted = ORDER.map(id => {
  if (id === 'painkiller' && !byId.painkiller) return PAINKILLER_FALLBACK
  return byId[id]
}).filter(Boolean)

const file = `export const cocktails = [
${sorted.map(fmt).join(',\n')},
]

export function findCocktailByKeyword(keyword) {
  const lower = keyword.toLowerCase()
  for (const c of cocktails) {
    if (c.name.toLowerCase().includes(lower)) return c
    if (c.nameEn?.toLowerCase().includes(lower)) return c
    if (c.ingredients.some(i => i.toLowerCase().includes(lower))) return c
    if (c.aroma.some(a => lower.includes(a))) return c
  }
  return null
}

// 통합 검색: 로컬 DB 우선, 없으면 API 호출
export async function searchCocktail(query) {
  const local = findCocktailByKeyword(query)
  if (local) return local
  const { searchCocktails } = await import('./api.js')
  const results = await searchCocktails(query)
  return results.length > 0 ? results[0] : null
}

export async function getRandomCocktailWithAPI() {
  const { getRandomCocktail } = await import('./api.js')
  const api = await getRandomCocktail()
  if (api && Math.random() < 0.35) return api
  return cocktails[Math.floor(Math.random() * cocktails.length)]
}
`

writeFileSync('src/lib/cocktails/database.js', file, 'utf8')
console.log(`Wrote ${sorted.length} cocktails`)
