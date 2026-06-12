import {
  CreateWebWorkerMLCEngine,
  deleteModelAllInfoInCache,
  type ChatCompletion,
  type WebWorkerMLCEngine,
} from '@mlc-ai/web-llm'
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm'
import type { WebLLMStatus, WebLLMEventCallbacks, WebLLMGenerateOptions, WebLLMMetrics } from './types.js'

const DEFAULT_TIMEOUT_MS = 5_000
const DEFAULT_MAX_TOKENS = 64
const DEFAULT_TEMPERATURE = 0.8
const DEFAULT_TOP_P = 0.9
const MAX_HISTORY_LENGTH = 4

let worker: Worker | null = null
let engine: WebWorkerMLCEngine | null = null
let _status: WebLLMStatus = 'unloaded'
let statusListeners: Array<(status: WebLLMStatus) => void> = []
let loadAttempt = 0

function setStatus(newStatus: WebLLMStatus) {
  _status = newStatus
  for (const listener of statusListeners) {
    try { listener(newStatus) } catch { /* ignore */ }
  }
}

export function getStatus(): WebLLMStatus {
  return _status
}

export function onStatusChange(listener: (status: WebLLMStatus) => void): () => void {
  statusListeners.push(listener)
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener)
  }
}

function createWorker(): Worker {
  if (worker) worker.terminate()
  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  return worker
}

export async function loadModel(
  modelId: string,
  callbacks?: WebLLMEventCallbacks,
): Promise<void> {
  if (engine) return

  const attempt = ++loadAttempt
  setStatus('loading')
  callbacks?.onStatusChange?.('loading')

  const w = createWorker()
  try {
    const loadedEngine = await CreateWebWorkerMLCEngine(w, modelId, {
      initProgressCallback: (report) => {
        if (attempt === loadAttempt) {
          callbacks?.onLoadProgress?.(report.progress, report.text)
        }
      },
    })
    if (attempt !== loadAttempt) {
      try { await loadedEngine.unload() } catch { /* cancelled load cleanup */ }
      throw new Error('Model load cancelled.')
    }
    engine = loadedEngine
    setStatus('ready')
    callbacks?.onStatusChange?.('ready')
  } catch (err) {
    if (worker === w) {
      worker.terminate()
      worker = null
    }
    if (attempt !== loadAttempt) throw err
    engine = null
    setStatus('error')
    const msg = err instanceof Error ? err.message : String(err)
    callbacks?.onError?.(msg)
    callbacks?.onStatusChange?.('error')
    throw err
  }
}

export async function reloadModel(
  modelId: string,
  callbacks?: WebLLMEventCallbacks,
): Promise<void> {
  await unloadModel()
  await loadModel(modelId, callbacks)
}

export async function generate(
  userInput: string,
  history?: Array<{ role: 'user' | 'bartender'; text: string }>,
  options?: WebLLMGenerateOptions,
  callbacks?: WebLLMEventCallbacks,
): Promise<string> {
  if (!engine) throw new Error('Model not loaded. Call loadModel() first.')
  if (_status === 'generating') throw new Error('Already generating.')

  setStatus('generating')
  callbacks?.onStatusChange?.('generating')

  const systemPrompt = options?.systemPrompt

  const messages: ChatCompletionMessageParam[] = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  if (history) {
    const recent = history.slice(-MAX_HISTORY_LENGTH)
    for (const msg of recent) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })
    }
  }

  messages.push({ role: 'user', content: userInput })

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS
  const temperature = options?.temperature ?? DEFAULT_TEMPERATURE
  const topP = options?.topP ?? DEFAULT_TOP_P

  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    engine?.interruptGenerate()
  }, timeoutMs)

  try {
    const asyncIterable = await engine.chat.completions.create({
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      extra_body: { enable_thinking: false },
    }) as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>

    let fullText = ''
    for await (const chunk of asyncIterable) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        fullText += delta
        callbacks?.onToken?.(delta, fullText)
      }
    }

    setStatus('ready')
    callbacks?.onStatusChange?.('ready')
    return fullText.trim()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const interrupted = timedOut || /interrupt|cancel|abort/i.test(msg)
    const nextStatus: WebLLMStatus = interrupted ? 'ready' : 'error'
    setStatus(nextStatus)
    callbacks?.onError?.(msg)
    callbacks?.onStatusChange?.(nextStatus)
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function unloadModel(): Promise<void> {
  loadAttempt += 1
  const activeEngine = engine
  engine = null
  try {
    await activeEngine?.unload()
  } catch { /* ignore */ }
  if (worker) {
    worker.terminate()
    worker = null
  }
  setStatus('unloaded')
}

export async function generateNonStreaming(
  userInput: string,
  systemPrompt?: string,
): Promise<{ text: string; metrics: WebLLMMetrics }> {
  if (!engine) throw new Error('Model not loaded.')

  const messages: ChatCompletionMessageParam[] = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: userInput })

  const startTime = performance.now()
  const response = await engine.chat.completions.create({
    messages,
    stream: false,
    max_tokens: 150,
    temperature: 0.8,
    top_p: 0.9,
    extra_body: { enable_thinking: false },
  }) as ChatCompletion

  const text = response.choices[0]?.message?.content ?? ''
  const usage = response.usage?.extra
  const e2eMs = (performance.now() - startTime)

  return {
    text: text.trim(),
    metrics: {
      e2eLatencyMs: usage ? usage.e2e_latency_s * 1000 : e2eMs,
      firstTokenMs: usage ? usage.time_to_first_token_s * 1000 : e2eMs,
      tokensPerSecond: usage ? usage.decode_tokens_per_s : 0,
      totalTokens: response.usage?.completion_tokens ?? 0,
      prefillTokensPerSecond: usage ? usage.prefill_tokens_per_s : 0,
      decodeTokensPerSecond: usage ? usage.decode_tokens_per_s : 0,
    },
  }
}

export function interruptGeneration(): void {
  engine?.interruptGenerate()
}

export async function clearModelCache(modelIds: readonly string[]): Promise<void> {
  await unloadModel()
  for (const modelId of modelIds) {
    await deleteModelAllInfoInCache(modelId)
  }
}
