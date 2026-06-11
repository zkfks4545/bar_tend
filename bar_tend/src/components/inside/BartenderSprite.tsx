import characterImg from '../../lib/bartender/character.png'
import type { Expression } from '../../types.js'

export default function BartenderSprite({ expression }: { expression: Expression }) {
  return (
    <div
      className={`bartender-sprite bartender-sprite--${expression} flex flex-col items-center justify-end`}
      style={{ height: 'min(340px, 48vh)' }}
      data-expression={expression}
    >
      {/* Bartender behind the counter */}
      <div className="float" style={{ height: 'min(250px, 38vh)', marginBottom: -10 }}>
        <img
          src={characterImg}
          alt="bartender"
          className="relative"
          style={{ height: '100%', width: 'auto', objectFit: 'contain', zIndex: 5 }}
        />
      </div>

      {/* Bar counter (customer facing view) */}
      <div className="relative w-full flex flex-col items-center" style={{ marginTop: -18, zIndex: 10 }}>
        {/* Counter top surface (perspective) */}
        <div
          className="rounded-sm relative flex items-center justify-center"
          style={{
            width: 'min(540px, 96vw)',
            height: 44,
            background: 'linear-gradient(to bottom, #5a3d2a, #4a3020 30%, #3a2518 70%, #2a1a10)',
            borderTop: '2px solid rgba(196,163,90,0.2)',
            boxShadow: '0 -2px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
            borderRadius: 3,
          }}
        >
          {/* Wood grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)',
              borderRadius: 3,
            }}
          />
          {/* Coaster (elliptical, perspective view) */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 36, height: 28,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 40% 35%, #2a1e14, #1a120a)',
              border: '1px solid rgba(196,163,90,0.12)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Coaster ring detail */}
            <div
              style={{
                width: 26, height: 20,
                borderRadius: '50%',
                border: '1px solid rgba(196,163,90,0.06)',
              }}
            />
          </div>
        </div>
        {/* Counter front face */}
        <div
          style={{
            width: 'min(540px, 96vw)',
            height: 24,
            background: 'linear-gradient(to bottom, #2a1a10, #1a0e08 60%, #120a05)',
            borderBottom: '1px solid rgba(0,0,0,0.6)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  )
}
