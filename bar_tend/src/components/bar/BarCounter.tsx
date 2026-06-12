export default function BarCounter() {
  const fillLevels = [42, 63, 35, 56, 48]

  return (
    <div className="relative w-full max-w-2xl">
      {/* Gold under-glow */}
      <div
        className="absolute -top-1 left-0 right-0 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
          filter: 'blur(4px)',
          animation: 'glow-gold-box 3s ease-in-out infinite alternate',
        }}
      />

      {/* Counter top */}
      <div
        className="relative h-3 rounded-sm"
        style={{
          background: 'linear-gradient(to bottom, #3a2a1e, #2a1a12, #1a100a)',
          borderTop: '1px solid rgba(196, 163, 90, 0.12)',
          borderBottom: '1px solid rgba(0,0,0,0.5)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      />

      {/* Shot glasses row */}
      <div className="flex justify-center gap-4 -mt-2" style={{ perspective: '200px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative"
            style={{
              width: 14, height: 20,
              transform: `rotateX(10deg) translateY(${Math.sin(i) * 2}px)`,
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '80%',
                background: 'linear-gradient(to bottom, rgba(200,200,220,0.12), rgba(200,200,220,0.04))',
                border: '1px solid rgba(255,255,255,0.06)',
                borderTop: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '0 0 2px 2px',
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: `${fillLevels[i]}%`,
                background: i % 2 === 0
                  ? 'linear-gradient(to bottom, rgba(196,163,90,0.3), rgba(196,163,90,0.1))'
                  : 'linear-gradient(to bottom, rgba(255,200,50,0.25), rgba(255,200,50,0.08))',
                borderRadius: '0 0 1px 1px',
              }}
            />
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 2,
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '1px 1px 0 0',
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom glow reflection */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(196, 163, 90, 0.06), transparent)',
          filter: 'blur(6px)',
        }}
      />
    </div>
  )
}
