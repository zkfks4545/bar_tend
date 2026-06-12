import { useCallback, useState } from 'react'
import type { Message } from '@/types.js'
import type {
  WebLLMEventCallbacks,
  WebLLMGenerateOptions,
  WebLLMStatus,
} from '@/lib/webllm/types.js'
import { WEBLLM_MODEL_CANDIDATES } from '@/lib/webllm/models.js'

const importClient = () => import('@/lib/webllm/client.js')

export function useWebLLMRuntime() {
  const [status, setStatus] = useState<WebLLMStatus>('unloaded')
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadMessage, setLoadMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (modelId: string) => {
    const trimmedModelId = modelId.trim()
    if (!trimmedModelId || status === 'loading' || status === 'generating') return

    setError(null)
    setLoadProgress(0)
    setLoadMessage('모델 준비 중')

    const callbacks = {
      onLoadProgress: (progress: number, text: string) => {
        setLoadProgress(progress)
        setLoadMessage(text)
      },
      onStatusChange: setStatus,
      onError: setError,
    }

    try {
      const client = await importClient()
      if (loadedModelId && loadedModelId !== trimmedModelId) {
        await client.reloadModel(trimmedModelId, callbacks)
      } else {
        await client.loadModel(trimmedModelId, callbacks)
      }
      setLoadedModelId(trimmedModelId)
      setLoadProgress(1)
      setLoadMessage('준비 완료')
    } catch (err) {
      setLoadedModelId(null)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [loadedModelId, status])

  const unload = useCallback(async () => {
    const client = await importClient()
    await client.unloadModel()
    setStatus('unloaded')
    setLoadedModelId(null)
    setLoadProgress(0)
    setLoadMessage('')
    setError(null)
  }, [])

  const interrupt = useCallback(() => {
    void importClient().then((client) => client.interruptGeneration())
  }, [])

  const clearCache = useCallback(async () => {
    const client = await importClient()
    await client.clearModelCache(WEBLLM_MODEL_CANDIDATES)
    setStatus('unloaded')
    setLoadedModelId(null)
    setLoadProgress(0)
    setLoadMessage('')
    setError(null)
  }, [])

  const generateText = useCallback(async (
    input: string,
    history: Message[],
    options: WebLLMGenerateOptions,
    callbacks?: Pick<WebLLMEventCallbacks, 'onToken'>,
  ): Promise<string | null> => {
    const client = await importClient()
    if (client.getStatus() !== 'ready') return null

    try {
      setStatus('generating')
      const text = await client.generate(input, history, options, callbacks)
      setStatus('ready')
      return text || null
    } catch {
      setStatus('ready')
      return null
    }
  }, [])

  return {
    status,
    loadedModelId,
    loadProgress,
    loadMessage,
    error,
    load,
    unload,
    interrupt,
    clearCache,
    generateText,
  }
}
