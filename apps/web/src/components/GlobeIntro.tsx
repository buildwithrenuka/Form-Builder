import { useEffect, useRef, useState } from 'react';

type Props = { onComplete: () => void; onBack: () => void };

const PANELS = [
  {
    icon: '🌍',
    title: 'One Planet',
    text: 'Eight billion people. 195 countries. Every single one of them needs a form.',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.3)',
  },
  {
    icon: '🗺️',
    title: 'Every Border a Story',
    text: 'Tax codes, phone formats, ID structures — every nation has its own data language.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.3)',
  },
  {
    icon: '📋',
    title: 'Your Mission',
    text: 'Spin the globe. Pick a country. Build a form that speaks its language perfectly.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
  },
];

export function GlobeIntro({ onComplete, onBack }: Props) {
  const [panel, setPanel]   = useState(0);
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
        background: 'radial-gradient(ellipse at 50% 30%, #0a1628 0%, #03001c 60%, #000000 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
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

      {/* Star field */}
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
          height: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
          background: '#fff',
          borderRadius: '50%',
          left: `${(i * 17.3) % 100}%`,
          top: `${(i * 11.7) % 100}%`,
          opacity: 0.3 + (i % 7) * 0.1,
          animation: `twinkle ${2 + (i % 4) * 0.8}s ease-in-out infinite alternate`,
          animationDelay: `${(i % 6) * 0.3}s`,
        }} />
      ))}

      {/* Spinning globe */}
      <div style={{
        fontSize: '120px',
        marginBottom: '40px',
        filter: `drop-shadow(0 0 40px ${p.glow})`,
        animation: 'spinGlobe 8s linear infinite',
        transition: 'filter 0.5s',
      }}>
        {p.icon}
      </div>

      {/* Panel content */}
      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        padding: '0 32px',
        opacity: visible && !leaving ? 1 : 0,
        transform: leaving ? 'translateY(-30px)' : visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          fontSize: 13,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: p.color,
          marginBottom: 16,
          fontFamily: 'monospace',
        }}>
          {`PANEL ${panel + 1} / ${PANELS.length}`}
        </div>

        <h2 style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 20px',
          lineHeight: 1.15,
          textShadow: `0 0 30px ${p.glow}`,
        }}>
          {p.title}
        </h2>

        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.78)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {p.text}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', gap: 10,
        marginTop: 52,
        position: 'absolute',
        bottom: 60,
      }}>
        {PANELS.map((_, i) => (
          <div key={i} style={{
            width: i === panel ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: i === panel ? p.color : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            advance();
          }}
          style={{ background: `linear-gradient(135deg, ${p.color}, #ffffff22)`, border: `1px solid ${p.color}66`, color: '#fff', borderRadius: 999, padding: '12px 24px', fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 0 24px ${p.glow}` }}
        >
          {panel < PANELS.length - 1 ? 'Continue' : 'Start Building'}
        </button>
        <div style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 12,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}>
          Click, tap, or press Enter
        </div>
      </div>

      <style>{`
        @keyframes spinGlobe {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        @keyframes twinkle {
          from { opacity: 0.2; }
          to   { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
