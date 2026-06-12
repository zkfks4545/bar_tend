import { useState, type FormEvent } from 'react'
import type { FilterQuestion } from '@/lib/akinator/engine.js'
import type { RecommendationState } from '@/types/recommendation.js'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
  activeQuestion?: FilterQuestion | null
  onCancelRecommendation?: () => void
  recommendationState?: RecommendationState
  onRemoveSignal?: (index: number) => void
}

export default function ChatInput({
  onSend,
  disabled,
  activeQuestion,
  onCancelRecommendation,
  recommendationState,
  onRemoveSignal,
}: ChatInputProps) {
  const [val, setVal] = useState('')
  const placeholder = disabled ? '대답을 기다리는 중...' : '바텐더에게 말을 걸어보세요...'

  const handleChoiceClick = (label: string) => {
    if (disabled) return
    onSend(label)
  }

  const handleSkipClick = () => {
    if (disabled || !activeQuestion) return
    onSend('카루아에게 맡길게요.')
  }

  return (
    <div className="flex flex-col w-full">
      {/* Active Recommendation Signals (Filter Chips) */}
      {recommendationState && recommendationState.signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-black/10">
          {recommendationState.signals.map((signal, i) => (
            <div
              key={i}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors"
              style={{
                background: 'rgba(180, 136, 208, 0.05)',
                borderColor: 'rgba(180, 136, 208, 0.2)',
                color: '#b088d0',
              }}
            >
              <span>{signal.evidence || String(signal.value)}</span>
              <button
                type="button"
                onClick={() => onRemoveSignal?.(i)}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label="제거"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* activeQuestion Choice Buttons */}
      {activeQuestion && (
        <div
          className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-t border-white/5 bg-black/20"
          style={{
            borderColor: 'rgba(196,163,90,0.05)',
            background: 'linear-gradient(to right, rgba(80,40,120,0.03), rgba(13,10,7,0.8))',
          }}
        >
          {activeQuestion.choices.map((choice, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleChoiceClick(choice.label)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border duration-200 cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: '#C4A35A',
                background: 'rgba(196,163,90,0.04)',
                borderColor: 'rgba(196,163,90,0.15)',
              }}
            >
              {choice.label}
            </button>
          ))}

          {/* 카루아에게 맡기기 */}
          <button
            type="button"
            disabled={disabled}
            onClick={handleSkipClick}
            className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border duration-200 cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: '#a0aec0',
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            카루아에게 맡기기
          </button>

          {/* 추천 취소 */}
          {onCancelRecommendation && (
            <button
              type="button"
              disabled={disabled}
              onClick={onCancelRecommendation}
              className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border duration-200 cursor-pointer select-none active:scale-95 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: '#b088d0',
                background: 'rgba(120,80,180,0.06)',
                borderColor: 'rgba(180,136,208,0.2)',
              }}
            >
              추천 취소
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          if (val.trim()) {
            onSend(val.trim())
            setVal('')
          }
        }}
        className="p-4 bg-black/40 border-t border-white/5 flex items-center gap-2"
        style={{ borderColor: 'rgba(196,163,90,0.05)' }}
      >
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all text-sm"
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(180, 136, 208, 0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '')}
        />
      </form>
    </div>
  )
}
