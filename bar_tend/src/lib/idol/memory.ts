export type IdolSentiment = 'neutral' | 'warm' | 'melancholy' | 'excited'

export interface IdolMemorySlot {
  sentiment: IdolSentiment
  lastTopics: string[]
  exchangeCount: number
  userName?: string
}

export function updateIdolFromMessage(
  slot: IdolMemorySlot,
  userText: string,
): IdolMemorySlot {
  const lower = userText.toLowerCase()
  let sentiment = slot.sentiment

  if (/\b(슬프|우울|힘들|외로|지쳤)\b/.test(lower)) sentiment = 'melancholy'
  else if (/\b(기쁘|행복|좋아|신나|설레)\b/.test(lower)) sentiment = 'excited'
  else if (/\b(고마|감사|따뜻|편안)\b/.test(lower)) sentiment = 'warm'

  const topics = [...slot.lastTopics]
  if (/\b(달콤|쓰|신맛|도수|탄산)\b/.test(lower) && !topics.includes('taste'))
    topics.push('taste')
  if (/\b(추천|칵테일)\b/.test(lower) && !topics.includes('cocktail'))
    topics.push('cocktail')
  if (topics.length > 6) topics.shift()

  return {
    ...slot,
    sentiment,
    lastTopics: topics,
    exchangeCount: slot.exchangeCount + 1,
  }
}
