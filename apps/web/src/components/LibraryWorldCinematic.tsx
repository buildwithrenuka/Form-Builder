import { useEffect, useState } from 'react';
import type { LibraryWorld } from '../libraryData';

type Props = {
  world: LibraryWorld;
  onComplete: () => void;
  onBack: () => void;
};

export function LibraryWorldCinematic({ world, onComplete, onBack }: Props) {
  const [panel, setPanel] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 90);
    return () => window.clearTimeout(timer);
  }, []);

  function advance() {
    setLeaving(true);
    window.setTimeout(() => {
      if (panel < world.cinematic.length - 1) {
        setPanel((value) => value + 1);
        setLeaving(false);
        setVisible(false);
        window.setTimeout(() => setVisible(true), 70);
      } else {
        onComplete();
      }
    }, 340);
  }

  const currentPanel = world.cinematic[panel];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: world.bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={advance}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onBack();
        }}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 6,
          background: 'rgba(0,0,0,0.32)',
          border: `1px solid ${world.color}44`,
          borderRadius: 10,
          color: '#fff',
          padding: '9px 14px',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        ← Back
      </button>

      {world.particles.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{
            position: 'absolute',
            fontSize: 18 + (index % 3) * 8,
            left: `${(index * 17.3 + 6) % 94}%`,
            top: `${(index * 19.1 + 8) % 88}%`,
            opacity: 0.08 + (index % 4) * 0.03,
            animation: `library-cinematic-drift ${4 + (index % 3)}s ease-in-out infinite alternate`,
            animationDelay: `${index * 0.22}s`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {item}
        </div>
      ))}

      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${world.glowColor} 0%, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{
        position: 'absolute',
        top: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(0,0,0,0.34)',
        border: `1px solid ${world.color}44`,
        borderRadius: 999,
        padding: '8px 18px 8px 12px',
      }}>
        <span style={{ fontSize: 28 }}>{world.emoji}</span>
        <div>
          <div style={{ color: world.accentColor, fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>{world.name.toUpperCase()}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{world.genre} · {world.tagline}</div>
        </div>
      </div>

      <div style={{
        maxWidth: 560,
        textAlign: 'center',
        padding: '0 36px',
        opacity: visible && !leaving ? 1 : 0,
        transform: leaving ? 'translateY(-28px) scale(0.96)' : visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transition: 'all 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5,
      }}>
        <div style={{ fontSize: 76, marginBottom: 24, filter: `drop-shadow(0 0 24px ${world.glowColor})`, lineHeight: 1 }}>
          {currentPanel.icon}
        </div>

        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 18px', lineHeight: 1.2, textShadow: `0 0 30px ${world.glowColor}` }}>
          {currentPanel.title}
        </h2>

        <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>
          {currentPanel.text}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, position: 'absolute', bottom: 60 }}>
        {world.cinematic.map((_, index) => (
          <div key={index} style={{ width: index === panel ? 28 : 8, height: 8, borderRadius: 4, background: index === panel ? world.accentColor : 'rgba(255,255,255,0.18)', transition: 'all 0.3s', boxShadow: index === panel ? `0 0 8px ${world.glowColor}` : 'none' }} />
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 28, color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
        {panel < world.cinematic.length - 1 ? 'tap to continue' : 'tap to build'}
      </div>

      <style>{`
        @keyframes library-cinematic-drift {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-18px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}