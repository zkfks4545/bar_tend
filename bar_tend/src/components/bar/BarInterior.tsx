const COLORS = ['#8B4513', '#B8860B', '#A0522D', '#6B4226', '#D2691E', '#2F4F4F', '#556B2F', '#8B0000']

function Bottle({ color, h, w }: { color: string; h: number; w: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: w }}>
      <div
        style={{
          height: h,
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          borderRadius: '1px 1px 3px 3px',
          opacity: 0.35,
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
            width: w * 0.4, height: 5,
            background: `${color}66`,
            borderRadius: '1px 1px 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '35%', left: '15%', right: '15%', height: '18%',
            background: 'rgba(255,255,200,0.05)',
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  )
}

export default function BarInterior() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Back wall - warm dark wood */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #1a1410, #0d0a07)' }} />

      {/* Wall panel grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 39px, rgba(196,163,90,0.15) 39px, rgba(196,163,90,0.15) 40px),
            linear-gradient(90deg, transparent 39px, rgba(196,163,90,0.15) 39px, rgba(196,163,90,0.15) 40px)
          `,
          backgroundSize: '80px 40px',
        }}
      />

      {/* Top shelf */}
      <div className="absolute left-0 right-0" style={{ top: '10%', height: 3, background: '#3a2518' }} />
      <div className="absolute flex justify-center gap-[3px] md:gap-1.5" style={{ top: '2%', left: '3%', right: '3%' }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <Bottle key={i} color={COLORS[i % COLORS.length]} h={28 + (i % 5) * 8} w={7 + (i % 3) * 1.5} />
        ))}
      </div>

      {/* Middle shelf */}
      <div className="absolute left-0 right-0" style={{ top: '28%', height: 3, background: '#3a2518' }} />
      <div className="absolute flex justify-center gap-[2px] md:gap-1" style={{ top: '20%', left: '5%', right: '5%' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Bottle key={i + 14} color={COLORS[(i + 3) % COLORS.length]} h={22 + (i % 4) * 6} w={6 + (i % 2) * 2} />
        ))}
      </div>

      {/* Lower shelf */}
      <div className="absolute left-0 right-0" style={{ top: '46%', height: 3, background: '#3a2518' }} />
      <div className="absolute flex justify-center gap-[3px] md:gap-1.5" style={{ top: '38%', left: '4%', right: '4%' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Bottle key={i + 30} color={COLORS[(i + 7) % COLORS.length]} h={32 + (i % 3) * 7} w={8 + (i % 4) * 1.5} />
        ))}
      </div>

      {/* Warm gold ambient light with purple undertone */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 15%, rgba(196,163,90,0.05), transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 80%, rgba(120,80,180,0.04), transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Warm pendant light glows */}
      <div
        className="absolute rounded-full"
        style={{
          left: '30%', top: '3%', width: 25, height: 25,
          background: 'radial-gradient(circle, rgba(255,200,100,0.06), transparent)',
          filter: 'blur(5px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          right: '30%', top: '3%', width: 25, height: 25,
          background: 'radial-gradient(circle, rgba(255,200,100,0.06), transparent)',
          filter: 'blur(5px)',
        }}
      />

      {/* Warm light strip at top */}
      <div
        className="absolute left-[20%] right-[20%]"
        style={{
          top: '1%', height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.1), rgba(196,163,90,0.2), rgba(196,163,90,0.1), transparent)',
          filter: 'blur(2px)',
        }}
      />

      {/* Bottom fade to dark */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
        }}
      />
    </div>
  )
}
