import { buildChatPrompt } from './prompts.js'
import type { Message } from '../../types.js'

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate'
const DEFAULT_MODEL = 'llama3'

export async function generateWithOllama(input: string, history: Message[], model = DEFAULT_MODEL): Promise<string> {
  const prompt = buildChatPrompt(input, history)

  try {
    const res = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9 },
      }),
    })

    if (!res.ok) throw new Error(`Ollama responded with ${res.status}`)
    const data = await res.json()
    return data.response?.trim() || '...무슨 말씀인지 잘... 한 잔 더 하시겠어요?'
  } catch (err) {
    console.error('Ollama error:', err)
    throw err
  }
}
