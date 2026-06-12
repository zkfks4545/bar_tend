import BarExterior from '@/components/outside/BarExterior.jsx'
import BarInterior from '@/components/inside/BarInterior.jsx'
import BartenderSprite from '@/components/inside/BartenderSprite.jsx'
import BarCounter from '@/components/inside/BarCounter.jsx'
import DialogueBox from '@/components/inside/DialogueBox.jsx'
import ChatInput from '@/components/inside/ChatInput.jsx'
import CocktailCard from '@/components/inside/CocktailCard.jsx'
import Sidebar from '@/components/sidebar/Sidebar.jsx'
import { useRestationController } from '@/hooks/useRestationController.js'

export default function App() {
  const {
    scene,
    messages,
    expression,
    isBartenderTyping,
    isProcessing,
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
  } = useRestationController()

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
            {errorMessage && (
              <p className="px-6 pb-3 text-xs text-red-300" role="alert">
                {errorMessage}
              </p>
            )}
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
