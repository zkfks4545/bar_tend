import { buildChatPrompt } from './prompts.js'
import type { Message } from '../../types.js'

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'

export async function generateWithOpenAI(input: string, history: Message[], apiKey: string): Promise<string> {
  const prompt = buildChatPrompt(input, history)

  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system' as const, content: prompt },
          { role: 'user' as const, content: input },
        ],
        temperature: 0.7,
      }),
    })

    if (!res.ok) throw new Error(`OpenAI responded with ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || '...죄송합니다. 다시 한 번 말씀해주시겠어요?'
  } catch (err) {
    console.error('OpenAI error:', err)
    throw err
  }
}
