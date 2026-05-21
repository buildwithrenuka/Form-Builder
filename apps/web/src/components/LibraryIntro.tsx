import { useEffect, useRef, useState } from 'react';

type Props = { onComplete: () => void; onBack: () => void };

const PANELS = [
  {
    icon: '📚',
    title: 'The Grand Library',
    text: 'Ancient scrolls. Leather-bound tomes. Starship manifests. Every story ever told was, at its heart, a structured collection of data.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: '🌌',
    title: 'Four Worlds Await',
    text: 'Mythology. History. Sci-Fi. Fiction. Four realms of knowledge — each with its own language, its own forms, its own truth.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.3)',
  },
  {
    icon: '✍️',
    title: 'Write Your Chapter',
    text: 'Choose a world. Build forms that belong to it. Every field is a sentence. Every form is a story. What will yours say?',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.3)',
  },
];

const FLOATING_ITEMS = ['📚', '📖', '📜', '🔮', '⚡', '🚀', '🪄', '📋', '✨', '🐉', '🏛️', '🌌'];

export function LibraryIntro({ onComplete, onBack }: Props) {
  const [panel, setPanel]     = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  function queueTimeout(callback: () => void, delay: number) {
    const timeoutId = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.push(timeoutId);
  }

  useEffect(() => {
    queueTimeout(() => setVisible(true), 80);
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        advance();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function advance() {
    setLeaving(true);
    queueTimeout(() => {
      if (panel < PANELS.length - 1) {
        setPanel(p => p + 1);
        setLeaving(false);
        setVisible(false);
        queueTimeout(() => setVisible(true), 60);
      } else {
        onComplete();
      }
    }, 350);
  }

  const p = PANELS[panel];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #120820 0%, #05010f 65%, #000 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: 'pointer',
      }}
      onClick={advance}
      role="presentation"
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onBack();
        }}
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          zIndex: 10,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 9,
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '0.08em',
        }}
      >
        ← Back
      </button>

      {/* Animated particles */}
      {FLOATING_ITEMS.map((item, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: 16 + (i % 4) * 6,
          left: `${(i * 8.7 + 3) % 95}%`,
          top: `${(i * 7.3 + 5) % 90}%`,
          opacity: 0.04 + (i % 5) * 0.02,
          animation: `drift ${5 + (i % 5) * 1.5}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.35}s`,
          userSelect: 'none', pointerEvents: 'none',
          filter: `blur(${i % 3 === 0 ? 1 : 0}px)`,
        }}>{item}</div>
      ))}

      {/* Shelves decorative lines */}
      {[15, 40, 65, 88].map((top, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: `${top}%`,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.06), rgba(168,85,247,0.06), transparent)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Glow orb */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        top: '50%', left: '50%',
        pointerEvents: 'none',
        transition: 'background 0.8s',
      }} />

      {/* Panel content */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        maxWidth: 540, padding: '0 32px',
        opacity: visible && !leaving ? 1 : 0,
        transform: `translateY(${visible && !leaving ? 0 : leaving ? -20 : 20}px)`,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {/* Large icon */}
        <div style={{
          fontSize: 80, marginBottom: 24,
          filter: `drop-shadow(0 0 32px ${p.glow})`,
          lineHeight: 1,
        }}>{p.icon}</div>

        {/* Decorative line */}
        <div style={{
          width: 80, height: 2, margin: '0 auto 20px',
          background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
        }} />

        {/* Title */}
        <h2 style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          color: p.color, fontSize: 28, fontWeight: 700,
          margin: '0 0 16px', letterSpacing: '0.04em',
          textShadow: `0 0 24px ${p.glow}`,
        }}>{p.title}</h2>

        {/* Text */}
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          color: 'rgba(255,255,255,0.6)', fontSize: 16,
          lineHeight: 1.8, margin: '0 0 36px',
        }}>{p.text}</p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {PANELS.map((_, i) => (
            <div key={i} style={{
              width: i === panel ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === panel ? p.color : 'rgba(255,255,255,0.15)',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: i === panel ? `0 0 8px ${p.glow}` : 'none',
            }} />
          ))}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              advance();
            }}
            style={{ background: `linear-gradient(135deg, ${p.color}, #ffffff1a)`, border: `1px solid ${p.color}66`, color: '#fff', borderRadius: 999, padding: '12px 24px', fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 0 24px ${p.glow}` }}
          >
            {panel < PANELS.length - 1 ? 'Continue' : 'Enter Library'}
          </button>
          <div style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            Click, tap, or press Enter
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
