import { useCallback, useEffect, useRef, useState } from 'react'
import { getCocktailResponse } from '@/lib/bartender/engine.js'
import { unlockCocktailId } from '@/lib/storage/codex-unlocks.js'
import { createTimerRegistry } from '@/lib/timing/timer-registry.js'
import type { CocktailData, Expression, Message } from '@/types.js'
import { useBarbotSession } from './useBarbotSession.js'
import { useRecommendationSession } from './useRecommendationSession.js'

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
  const timerRegistry = useRef(createTimerRegistry())

  const {
    preference,
    unlockedIds,
    setUnlockedIds,
    ingestUserMessage,
    resetNight,
  } = useBarbotSession()
  const { resetRecommendation, resolveRecommendation } = useRecommendationSession()

  const clearPendingWork = useCallback(() => {
    timerRegistry.current.clearAll()
    setInteractionStatus('idle')
    setScreenShake(false)
  }, [])

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
      }, text.length * 15 + 400)
    },
    [],
  )

  const handleEnter = useCallback(() => {
    clearPendingWork()
    setErrorMessage(null)
    setScene('inside')
    setMessages([
      {
        role: 'bartender',
        text: '어? 손님이 먼저 찾아오셨네요.\nRe:Station입니다. 편하게 앉으세요. 의자는 아직 퇴근 전이니까요.',
      },
    ])
  }, [clearPendingWork])

  const handleExit = useCallback(() => {
    clearPendingWork()
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
  }, [bartenderReply, clearPendingWork, resetRecommendation])

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
      timerRegistry.current.schedule(() => {
        try {
          const recommendation = resolveRecommendation(text, preference)
          const fallback = getCocktailResponse(text, messages)
          const reply = recommendation?.reply ?? fallback.response
          const nextExpression = recommendation?.expression ?? fallback.expression
          const cocktail = recommendation?.cocktail ?? null

          if (cocktail) {
            setScreenShake(true)
            timerRegistry.current.schedule(() => setScreenShake(false), 500)
            const ids = unlockCocktailId(cocktail.id)
            setUnlockedIds(ids)
          }

          bartenderReply(reply, nextExpression, cocktail)
        } catch {
          setExpression('idle')
          setInteractionStatus('idle')
          setErrorMessage('잠깐 잔을 놓쳤네요. 다시 한 번 말씀해 주세요.')
        }
      }, 800 + Math.random() * 600)
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
    ],
  )

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
    handleEnter,
    handleExit,
    handleResetNight,
    handleSend,
    setServedCocktail,
    setSidebarOpen,
  }
}
