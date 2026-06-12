import { useCallback, useState } from 'react'
import { getCocktailResponse } from '@/lib/bartender/engine.js'
import { unlockCocktailId } from '@/lib/storage/codex-unlocks.js'
import type { CocktailData, Expression, Message } from '@/types.js'
import { useBarbotSession } from './useBarbotSession.js'
import { useRecommendationSession } from './useRecommendationSession.js'

export function useRestationController() {
  const [scene, setScene] = useState<'outside' | 'inside'>('outside')
  const [messages, setMessages] = useState<Message[]>([])
  const [expression, setExpression] = useState<Expression>('idle')
  const [isBartenderTyping, setIsBartenderTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [servedCocktail, setServedCocktail] = useState<CocktailData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [screenShake, setScreenShake] = useState(false)

  const {
    preference,
    unlockedIds,
    setUnlockedIds,
    ingestUserMessage,
    resetNight,
  } = useBarbotSession()
  const { resetRecommendation, resolveRecommendation } = useRecommendationSession()

  const bartenderReply = useCallback(
    (text: string, exp: Expression, cocktail?: CocktailData | null) => {
      setIsBartenderTyping(true)
      setExpression('talk')
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bartender', text }])
        setIsBartenderTyping(false)
        setExpression(exp)
        setIsProcessing(false)
        if (cocktail) {
          setTimeout(() => setServedCocktail(cocktail), 600)
        }
      }, text.length * 15 + 400)
    },
    [],
  )

  const handleEnter = useCallback(() => {
    setScene('inside')
    setMessages([
      {
        role: 'bartender',
        text: '어? 손님이 먼저 찾아오셨네요.\nRe:Station입니다. 편하게 앉으세요. 의자는 아직 퇴근 전이니까요.',
      },
    ])
  }, [])

  const handleExit = useCallback(() => {
    setIsProcessing(true)
    bartenderReply('벌써 가세요? 또 오세요, 기다리고 있을게요. 알바니까요.', 'idle')
    setTimeout(() => {
      setScene('outside')
      setMessages([])
      setExpression('idle')
      setIsProcessing(false)
      setSidebarOpen(false)
      resetRecommendation()
    }, 2000)
  }, [bartenderReply, resetRecommendation])

  const handleResetNight = useCallback(() => {
    resetNight()
    setMessages([])
    setExpression('idle')
    setIsProcessing(false)
    setIsBartenderTyping(false)
    setServedCocktail(null)
    resetRecommendation()
    bartenderReply(
      '새로운 밤이에요.\n기억은 리셋됐는데... 도감에 모은 칵테일은 건드리지 않았어요.\n(알바생에게 그런 권한은 없거든요.)',
      'idle',
    )
  }, [resetNight, resetRecommendation, bartenderReply])

  const handleSend = useCallback(
    (text: string) => {
      if (isProcessing) return
      setIsProcessing(true)
      setMessages((prev) => [...prev, { role: 'user', text }])
      ingestUserMessage(text)

      if (/나갈게|갈게|바이|끝|잘 있어|다음에|안녕히/.test(text.toLowerCase())) {
        handleExit()
        return
      }

      setExpression('thinking')
      setTimeout(() => {
        const recommendation = resolveRecommendation(text, preference)
        const fallback = getCocktailResponse(text, messages)
        const reply = recommendation?.reply ?? fallback.response
        const nextExpression = recommendation?.expression ?? fallback.expression
        const cocktail = recommendation?.cocktail ?? null

        if (cocktail) {
          setScreenShake(true)
          setTimeout(() => setScreenShake(false), 500)
          const ids = unlockCocktailId(cocktail.id)
          setUnlockedIds(ids)
        }

        bartenderReply(reply, nextExpression, cocktail)
      }, 800 + Math.random() * 600)
    },
    [
      isProcessing,
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
    isBartenderTyping,
    isProcessing,
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
