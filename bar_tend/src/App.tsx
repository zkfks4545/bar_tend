import { useState, useCallback } from 'react'
import BarExterior from '@/components/outside/BarExterior.jsx'
import BarInterior from '@/components/inside/BarInterior.jsx'
import BartenderSprite from '@/components/inside/BartenderSprite.jsx'
import BarCounter from '@/components/inside/BarCounter.jsx'
import DialogueBox from '@/components/inside/DialogueBox.jsx'
import ChatInput from '@/components/inside/ChatInput.jsx'
import CocktailCard from '@/components/inside/CocktailCard.jsx'
import Sidebar from '@/components/sidebar/Sidebar.jsx'
import { getCocktailResponse } from '@/lib/bartender/engine.js'
import {
  findCocktailByName,
} from '@/lib/cocktails/database.js'
import {
  ingestTasteSignals,
  isRecommendationIntent,
  initCandidatePool,
  filterPool,
  nextFilterQuestion,
  pickFromPool,
  detectExpressedDimensions,
} from '@/lib/akinator/engine.js'
import { unlockCocktailId } from '@/lib/storage/codex-unlocks.js'
import { useBarbotSession } from '@/hooks/useBarbotSession.js'
import type { CocktailData, Message, Expression } from '@/types.js'

export default function App() {
  const [scene, setScene] = useState<'outside' | 'inside'>('outside')
  const [messages, setMessages] = useState<Message[]>([])
  const [expression, setExpression] = useState<Expression>('idle')
  const [isBartenderTyping, setIsBartenderTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [servedCocktail, setServedCocktail] = useState<CocktailData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [candidatePool, setCandidatePool] = useState<CocktailData[] | null>(null)
  const [filterCount, setFilterCount] = useState(0)

  const {
    preference,
    unlockedIds,
    setUnlockedIds,
    ingestUserMessage,
    resetNight,
  } = useBarbotSession()

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
        text: '어? 손님... 들어오시네요.\nRe:Station에 온 걸 환영합니다. 편하게 앉으세요.\n(추천 원하면 기분이나 취향을 말씀해 주세요. 농담도 받아요.)',
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
      setCandidatePool(null)
      setFilterCount(0)
    }, 2000)
  }, [bartenderReply])

  const handleResetNight = useCallback(() => {
    resetNight()
    setMessages([])
    setExpression('idle')
    setIsProcessing(false)
    setIsBartenderTyping(false)
    setServedCocktail(null)
    setCandidatePool(null)
    setFilterCount(0)
    bartenderReply(
      '새로운 밤이에요.\n기억은 리셋됐는데... 도감에 모은 칵테일은 건드리지 않았어요.\n(알바생에게 그런 권한은 없거든요.)',
      'idle',
    )
  }, [resetNight, bartenderReply])

  const handleSend = useCallback(
    (text: string) => {
      if (isProcessing) return
      setIsProcessing(true)
      setMessages((prev) => [...prev, { role: 'user', text }])
      ingestUserMessage(text)

      const lower = text.toLowerCase()
      if (/나갈게|갈게|바이|끝|잘 있어|다음에|안녕히/.test(lower)) {
        handleExit()
        return
      }

      setExpression('thinking')
      setTimeout(() => {
        const tasteSnapshot = ingestTasteSignals(text, preference)
        const { response, expression: exp } = getCocktailResponse(text, messages)

        let cocktail: CocktailData | null = null
        let finalReply = response
        let finalExp = exp
        const selectRecommendation = (record: CocktailData) => {
          cocktail = record
          setScreenShake(true)
          setTimeout(() => setScreenShake(false), 500)
          setCandidatePool(null)
          setFilterCount(0)

          finalReply = `취향을 좀 알 것 같네요.\n${cocktail.vibe}\n\n오늘의 추천: 「${cocktail.name}」\n${cocktail.story}\n\n마음에 드시면 좋고, 아니면... 또 찾아드릴게요.`
          finalExp = 'smirk'
        }
        // A named cocktail is the most specific intent, so it wins over preference search.
        const explicitCocktail = findCocktailByName(text)
        const isRecommendation = !explicitCocktail && (candidatePool !== null || isRecommendationIntent(text))

        if (isRecommendation) {
          const pool = candidatePool ?? initCandidatePool()

          if (candidatePool === null) {
            // ── First trigger ──────────────────────────────────
            const expressed = detectExpressedDimensions(text)
            const filtered = expressed.size > 0 ? filterPool(pool, text, 0) : pool
            setCandidatePool(filtered)
            const q = nextFilterQuestion(filtered, 0, expressed, text)
            if (q) {
              setFilterCount(q.index)
              finalReply = q.question.text
              finalExp = 'thinking'
            } else {
              const record = pickFromPool(filtered, tasteSnapshot)
              if (record) selectRecommendation(record)
            }
          } else {
            // ── Subsequent answer ──────────────────────────────
            const filtered = filterPool(pool, text, filterCount)
            const nextStart = filterCount + 1
            setCandidatePool(filtered)
            setFilterCount(nextStart)
            const nextQuestion = nextFilterQuestion(filtered, nextStart, undefined, text)

            if (!nextQuestion) {
              // All questions answered — recommend
              const record = pickFromPool(filtered, tasteSnapshot)
              if (record) selectRecommendation(record)
            } else {
              finalReply = nextQuestion.question.text
              finalExp = 'thinking'
            }
          }
        } else if (explicitCocktail) {
          // ── Not recommendation mode — serve named cocktail ──
          cocktail = explicitCocktail
          finalReply = `${explicitCocktail.vibe}\n\n「${explicitCocktail.name}」, 좋은 선택이에요.\n${explicitCocktail.story}`
          finalExp = 'smirk'
        }

        if (cocktail) {
          const ids = unlockCocktailId(cocktail.id)
          setUnlockedIds(ids)
        }

        bartenderReply(finalReply, finalExp, cocktail)
      }, 800 + Math.random() * 600)
    },
    [
      isProcessing,
      messages,
      handleExit,
      bartenderReply,
      ingestUserMessage,
      preference,
      candidatePool,
      filterCount,
      setUnlockedIds,
    ],
  )

  if (scene === 'outside') {
    return <BarExterior onEnter={handleEnter} />
  }

  return (
    <div
      className={`h-full restation-layout ${screenShake ? 'shake' : ''}`}
      style={{ background: '#0d0a07' }}
    >
      <div className="restation-main flex flex-col relative overflow-hidden">
        <BarInterior />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 120px 30px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        />
        <header
          className="relative flex items-center justify-between px-4 py-2 z-20"
          style={{
            borderBottom: '1px solid rgba(196,163,90,0.08)',
            background: 'linear-gradient(to bottom, rgba(13,10,7,0.95), transparent)',
          }}
        >
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
          >
            [ MENU ]
          </button>
          <div
            className="glow-gold text-sm font-bold tracking-widest flex-1 text-center"
            style={{ color: '#C4A35A' }}
          >
            Re:Station
          </div>
          <div className="w-[52px]" aria-hidden />
        </header>
        <div className="flex-1 flex flex-col min-h-0 relative z-20">
          <div className="restation-stage">
            <BartenderSprite expression={expression} />
            <BarCounter />
          </div>
          <div
            className="restation-chat-dock flex flex-col"
            style={{
              maxHeight: '35vh',
              minHeight: '200px',
              background:
                'linear-gradient(to top, rgba(13,10,7,0.9), rgba(13,10,7,0.3))',
              borderTop: '1px solid rgba(196,163,90,0.05)',
            }}
          >
            <DialogueBox messages={messages} isTyping={isBartenderTyping} />
            <ChatInput
              onSend={handleSend}
              disabled={isProcessing || isBartenderTyping}
            />
          </div>
          <div
            className="flex justify-end px-4 pb-3 pt-0.5"
            style={{
              background:
                'linear-gradient(to top, rgba(13,10,7,0.95), rgba(13,10,7,0.5))',
            }}
          >
            <button
              onClick={handleExit}
              className="text-xs transition-all duration-200 cursor-pointer select-none flex items-center gap-1"
              style={{
                color: '#b83838',
                textShadow: '0 0 6px rgba(184,56,56,0.25)',
                background: 'rgba(184,56,56,0.06)',
                border: '1px solid rgba(184,56,56,0.2)',
                padding: '4px 12px',
                fontFamily: 'inherit',
                letterSpacing: '0.12em',
              }}
            >
              <span className="opacity-60">[</span>
              나가기
              <span className="opacity-60">]</span>
            </button>
          </div>
        </div>
        {servedCocktail && (
          <CocktailCard
            cocktail={servedCocktail}
            onClose={() => setServedCocktail(null)}
          />
        )}
      </div>

      <Sidebar
        unlockedIds={unlockedIds}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onResetNight={handleResetNight}
        onViewCocktail={setServedCocktail}
      />
    </div>
  )
}
