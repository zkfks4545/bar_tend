import { useCallback, useEffect, useRef, useState } from 'react'
import { detectSafetyConcern, getCocktailResponse } from '@/lib/bartender/engine.js'
import { unlockCocktailId } from '@/lib/storage/codex-unlocks.js'
import { createTimerRegistry } from '@/lib/timing/timer-registry.js'
import {
  buildKaruaRecommendationPrompt,
  KARUA_RUNTIME_SYSTEM_PROMPT,
} from '@/lib/webllm/prompts/character-prompts.js'
import type { CocktailData, Expression, Message } from '@/types.js'
import { useBarbotSession } from './useBarbotSession.js'
import { useRecommendationSession } from './useRecommendationSession.js'
import { useWebLLMRuntime } from './useWebLLMRuntime.js'
import { DEFAULT_WEBLLM_MODEL_ID } from '@/lib/webllm/models.js'
import type { EntranceMode } from '@/components/outside/BarExterior.js'

type InteractionStatus = 'idle' | 'processing' | 'typing' | 'exiting'

export function useRestationController() {
  const [scene, setScene] = useState<'outside' | 'inside'>('outside')
  const [messages, setMessages] = useState<Message[]>([])
  const [expression, setExpression] = useState<Expression>('idle')
  const [interactionStatus, setInteractionStatus] = useState<InteractionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [servedCocktail, setServedCocktail] = useState<CocktailData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [accessMode, setAccessMode] = useState<EntranceMode>('survey')
  const [isClearingCache, setIsClearingCache] = useState(false)
  const timerRegistry = useRef(createTimerRegistry())
  const responseSequence = useRef(0)

  const {
    preference,
    unlockedIds,
    setUnlockedIds,
    ingestUserMessage,
    resetNight,
  } = useBarbotSession()
  const {
    activeQuestion,
    recommendationState,
    resetRecommendation,
    resolveRecommendation,
    removeSignal,
  } = useRecommendationSession()
  const webllm = useWebLLMRuntime()

  const clearPendingWork = useCallback(() => {
    timerRegistry.current.clearAll()
    responseSequence.current += 1
    webllm.interrupt()
    setInteractionStatus('idle')
    setScreenShake(false)
  }, [webllm])

  useEffect(() => () => timerRegistry.current.clearAll(), [])

  const bartenderReply = useCallback(
    (
      text: string,
      exp: Expression,
      cocktail?: CocktailData | null,
      finishStatus: InteractionStatus = 'idle',
    ) => {
      setInteractionStatus('typing')
      setExpression('talk')
      timerRegistry.current.schedule(() => {
        setMessages((prev) => [...prev, { role: 'bartender', text }])
        setExpression(exp)
        setInteractionStatus(finishStatus)
        if (cocktail) {
          timerRegistry.current.schedule(() => setServedCocktail(cocktail), 600)
        }
      }, 100)
    },
    [],
  )

  const replaceLatestBartenderMessage = useCallback((text: string) => {
    setMessages((prev) => {
      const next = [...prev]
      for (let index = next.length - 1; index >= 0; index--) {
        if (next[index].role === 'bartender') {
          next[index] = { ...next[index], text }
          break
        }
      }
      return next
    })
  }, [])

  const handleEnter = useCallback((mode: EntranceMode) => {
    clearPendingWork()
    setErrorMessage(null)
    setAccessMode(mode)
    setScene('inside')
    setMessages([
      {
        role: 'bartender',
        text: mode === 'ai'
          ? '어? 손님이 먼저 찾아오셨네요.\nAI 바텐더를 준비하는 동안 추천 설문이나 레시피북부터 둘러보세요.'
          : '오늘은 레시피북과 추천 설문만 열어둘게요. 조용한 날도 바에는 필요하니까요.',
      },
    ])
    if (mode === 'ai') void webllm.load(DEFAULT_WEBLLM_MODEL_ID)
  }, [clearPendingWork, webllm])

  const handleExit = useCallback(() => {
    clearPendingWork()
    void webllm.unload()
    setErrorMessage(null)
    setInteractionStatus('exiting')
    bartenderReply('벌써 가세요? 또 오세요, 기다리고 있을게요. 알바니까요.', 'idle', null, 'exiting')
    timerRegistry.current.schedule(() => {
      setScene('outside')
      setMessages([])
      setExpression('idle')
      setInteractionStatus('idle')
      setSidebarOpen(false)
      setServedCocktail(null)
      resetRecommendation()
    }, 2000)
  }, [bartenderReply, clearPendingWork, resetRecommendation, webllm])

  const handleResetNight = useCallback(() => {
    clearPendingWork()
    resetNight()
    setMessages([])
    setExpression('idle')
    setErrorMessage(null)
    setServedCocktail(null)
    resetRecommendation()
    bartenderReply(
      '새로운 밤이에요.\n기억은 리셋됐는데... 도감에 모은 칵테일은 건드리지 않았어요.\n(알바생에게 그런 권한은 없거든요.)',
      'idle',
    )
  }, [clearPendingWork, resetNight, resetRecommendation, bartenderReply])

  const handleCancelRecommendation = useCallback(() => {
    clearPendingWork()
    resetRecommendation()
    setExpression('idle')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: '[ 추천 취소 ]' },
      { role: 'bartender', text: '알겠어요. 추천은 접어두고 그냥 이야기나 나누죠. 어떤 이야기 해줄까요?' },
    ])
  }, [clearPendingWork, resetRecommendation])

  const handleSend = useCallback(
    (text: string) => {
      if (interactionStatus !== 'idle') return
      setErrorMessage(null)
      setInteractionStatus('processing')
      setMessages((prev) => [...prev, { role: 'user', text }])
      ingestUserMessage(text)

      if (/나갈게|갈게|바이|끝|잘 있어|다음에|안녕히/.test(text.toLowerCase())) {
        handleExit()
        return
      }

      setExpression('thinking')
      const sequence = ++responseSequence.current
      timerRegistry.current.schedule(async () => {
        try {
          const recommendation = resolveRecommendation(text, preference)
          const fallback = getCocktailResponse(text, messages)
          const fallbackReply = recommendation?.reply ?? fallback.response
          const nextExpression = recommendation?.expression ?? fallback.expression
          const cocktail = recommendation?.cocktail ?? null
          const systemPrompt = recommendation?.decision
            ? buildKaruaRecommendationPrompt(recommendation.decision)
            : KARUA_RUNTIME_SYSTEM_PROMPT
          const shouldGenerate = !recommendation || Boolean(recommendation.decision)

          if (cocktail) {
            setScreenShake(true)
            timerRegistry.current.schedule(() => setScreenShake(false), 500)
            const ids = unlockCocktailId(cocktail.id)
            setUnlockedIds(ids)
          }

          const canGenerate = webllm.status === 'ready' &&
            !detectSafetyConcern(text) &&
            shouldGenerate

          if (!canGenerate) {
            bartenderReply(fallbackReply, nextExpression, cocktail)
            return
          }

          setMessages((prev) => [...prev, { role: 'bartender', text: fallbackReply }])
          setExpression('talk')
          setInteractionStatus('typing')
          if (cocktail) setServedCocktail(cocktail)

          const generatedReply = await webllm.generateText(
            text,
            recommendation?.decision ? [] : messages.slice(-4),
            {
              systemPrompt,
              maxTokens: recommendation?.decision ? 96 : 64,
              timeoutMs: 5_000,
            },
            {
              onToken: (_delta, fullText) => {
                if (responseSequence.current === sequence) {
                  replaceLatestBartenderMessage(fullText)
                }
              },
            },
          )

          if (responseSequence.current !== sequence) return
          if (generatedReply) replaceLatestBartenderMessage(generatedReply)
          setExpression(nextExpression)
          setInteractionStatus('idle')
        } catch {
          setExpression('idle')
          setInteractionStatus('idle')
          setErrorMessage('잠깐 잔을 놓쳤네요. 다시 한 번 말씀해 주세요.')
        }
      }, 80)
    },
    [
      interactionStatus,
      ingestUserMessage,
      handleExit,
      resolveRecommendation,
      preference,
      messages,
      setUnlockedIds,
      bartenderReply,
      replaceLatestBartenderMessage,
      webllm,
    ],
  )
  const handleStartSurvey = useCallback(() => {
    handleSend('칵테일 추천해줘')
  }, [handleSend])

  const handleClearModelCache = useCallback(async () => {
    if (!window.confirm('저장된 AI 모델 캐시를 삭제할까요? 다음 AI 이용 시 다시 다운로드해야 합니다.')) {
      return
    }
    clearPendingWork()
    setIsClearingCache(true)
    try {
      await webllm.clearCache()
      setAccessMode('survey')
      setMessages((prev) => [
        ...prev,
        { role: 'bartender', text: 'AI 모델 캐시를 지웠어요. 이제 레시피북과 추천 설문만 이용할 수 있습니다.' },
      ])
    } catch {
      setErrorMessage('AI 모델 캐시를 지우지 못했습니다. 브라우저의 사이트 데이터 설정을 확인해 주세요.')
    } finally {
      setIsClearingCache(false)
    }
  }, [clearPendingWork, webllm])

  return {
    scene,
    messages,
    expression,
    isBartenderTyping: interactionStatus === 'typing',
    isProcessing: interactionStatus !== 'idle',
    errorMessage,
    servedCocktail,
    sidebarOpen,
    screenShake,
    unlockedIds,
    activeQuestion,
    recommendationState,
    webllm,
    accessMode,
    isClearingCache,
    handleEnter,
    handleExit,
    handleResetNight,
    handleCancelRecommendation,
    handleStartSurvey,
    handleClearModelCache,
    handleSend,
    removeSignal,
    setServedCocktail,
    setSidebarOpen,
  }
}
