import { useState } from 'react'
import {
  DEFAULT_WEBLLM_MODEL_ID,
  WEBLLM_MODEL_CANDIDATES,
} from '@/lib/webllm/models.js'
import type { WebLLMStatus } from '@/lib/webllm/types.js'

interface WebLLMControlsProps {
  status: WebLLMStatus
  loadedModelId: string | null
  loadProgress: number
  loadMessage: string
  error: string | null
  onLoad: (modelId: string) => void
  onUnload: () => void
}

export default function WebLLMControls({
  status,
  loadedModelId,
  loadProgress,
  loadMessage,
  error,
  onLoad,
  onUnload,
}: WebLLMControlsProps) {
  const [modelId, setModelId] = useState<string>(DEFAULT_WEBLLM_MODEL_ID)
  const busy = status === 'loading' || status === 'generating'

  return (
    <details className="relative text-[10px]">
      <summary className="cursor-pointer select-none tracking-wider" style={{ color: '#b088d0' }}>
        WebLLM: {status === 'ready' ? 'READY' : status.toUpperCase()}
      </summary>
      <div
        className="absolute right-0 top-6 z-50 w-72 space-y-2 rounded border p-3"
        style={{
          color: '#d9c8e8',
          background: 'rgba(13,10,7,0.98)',
          borderColor: 'rgba(180,136,208,0.3)',
        }}
      >
        <p>모델은 자동 선택되지 않습니다. 최초 로드 시 큰 다운로드가 발생합니다.</p>
        <select
          value={modelId}
          disabled={busy}
          onChange={(event) => setModelId(event.target.value)}
          className="w-full rounded border bg-black/60 p-2"
          aria-label="WebLLM 모델 선택"
        >
          {WEBLLM_MODEL_CANDIDATES.map((candidate) => (
            <option key={candidate} value={candidate}>{candidate}</option>
          ))}
        </select>
        {status === 'loading' && (
          <p>{Math.round(loadProgress * 100)}% {loadMessage}</p>
        )}
        {loadedModelId && <p className="break-all">로드됨: {loadedModelId}</p>}
        {error && <p className="text-red-300">로드 실패: {error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onLoad(modelId)}
            className="rounded border px-2 py-1 disabled:opacity-40"
          >
            모델 로드
          </button>
          <button
            type="button"
            disabled={busy || status === 'unloaded'}
            onClick={onUnload}
            className="rounded border px-2 py-1 disabled:opacity-40"
          >
            언로드
          </button>
        </div>
      </div>
    </details>
  )
}
