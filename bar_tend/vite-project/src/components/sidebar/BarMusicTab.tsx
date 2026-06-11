import { useCallback, useEffect, useRef, useState } from 'react'
import { BGM_PRESETS, type BgmPreset } from '@/data/bgm-presets.js'

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          height: string
          width: string
          videoId: string
          playerVars?: Record<string, number | string>
          events?: { onReady?: (e: { target: YtPlayer }) => void }
        },
      ) => YtPlayer
      PlayerState: { PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YtPlayer {
  playVideo: () => void
  pauseVideo: () => void
  loadVideoById: (id: string) => void
  getPlayerState: () => number
}

let apiLoading: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoading) return apiLoading

  apiLoading = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return apiLoading
}

export default function BarMusicTab() {
  const playerHostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initPlayer = useCallback(async (preset: BgmPreset) => {
    setError(null)
    try {
      await loadYouTubeApi()
      if (!playerHostRef.current || !window.YT) return

      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(playerHostRef.current, {
          height: '0',
          width: '0',
          videoId: preset.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (e) => {
              playerRef.current = e.target
              setReady(true)
              e.target.playVideo()
            },
          },
        })
      } else {
        playerRef.current.loadVideoById(preset.youtubeId)
        playerRef.current.playVideo()
      }
      setActiveId(preset.id)
    } catch {
      setError('유튜브 플레이어를 불러오지 못했습니다.')
    }
  }, [])

  const togglePreset = useCallback(
    (preset: BgmPreset) => {
      if (activeId === preset.id && playerRef.current) {
        const state = playerRef.current.getPlayerState()
        if (state === window.YT?.PlayerState.PLAYING) {
          playerRef.current.pauseVideo()
          setActiveId(null)
        } else {
          playerRef.current.playVideo()
        }
        return
      }
      void initPlayer(preset)
    },
    [activeId, initPlayer],
  )

  useEffect(() => {
    return () => {
      playerRef.current = null
    }
  }, [])

  return (
    <div className="music-panel">
      <p className="sidebar-muted music-panel__hint">
        배경음만 재생됩니다. 영상 UI는 숨겨져 있어요.
      </p>
      <div ref={playerHostRef} className="music-player-host" aria-hidden />
      <ul className="music-track-list">
        {BGM_PRESETS.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              className={`music-track ${activeId === preset.id ? 'music-track--active' : ''}`}
              onClick={() => togglePreset(preset)}
            >
              <span className="music-track__title">{preset.title}</span>
              <span className="music-track__sub">{preset.subtitle}</span>
              <span className="music-track__state">
                {activeId === preset.id ? (ready ? '▶ ON' : '…') : '○'}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="sidebar-error">{error}</p>}
    </div>
  )
}
