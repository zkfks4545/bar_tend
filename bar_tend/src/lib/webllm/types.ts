export type WebLLMStatus = 'unloaded' | 'loading' | 'ready' | 'generating' | 'error'

export interface WebLLMEventCallbacks {
  onLoadProgress?: (progress: number, text: string) => void
  onStatusChange?: (status: WebLLMStatus) => void
  onToken?: (delta: string, fullText: string) => void
  onError?: (error: string) => void
}

export interface WebLLMGenerateOptions {
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  timeoutMs?: number
}

export interface WebLLMMetrics {
  e2eLatencyMs: number
  firstTokenMs: number
  tokensPerSecond: number
  totalTokens: number
  prefillTokensPerSecond: number
  decodeTokensPerSecond: number
}

export interface EvaluationResult {
  modelId: string
  loadTimeMs: number
  warmupFirstTokenMs: number
  warmupTokensPerSecond: number
  benchmarkMetrics: WebLLMMetrics
  karuaResults: KaruaModelResult[]
  autoHardFailRate: number
  manualScore: number | null
}

export interface KaruaModelResult {
  caseId: string
  output: string
  sentenceCount: number
  hardFailures: { code: string; detail: string }[]
  passed: boolean
}
