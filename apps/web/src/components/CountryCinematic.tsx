import { useState, useEffect } from 'react';
import type { Country } from '../globeData';

type Props = {
  country: Country;
  onComplete: () => void;
  onBack: () => void;
};

export function CountryCinematic({ country, onComplete, onBack }: Props) {
  const [panel, setPanel]   = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const cinematicPanels = country.cinematic.length > 0
    ? country.cinematic
    : [{ icon: country.emoji, title: country.name, text: country.tagline }];
  const activePanel = cinematicPanels[Math.min(panel, cinematicPanels.length - 1)];

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    setPanel(0);
    setVisible(false);
    setLeaving(false);

    const timeoutId = window.setTimeout(() => setVisible(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, [country.id]);

  function advance() {
    setLeaving(true);
    setTimeout(() => {
      if (panel < cinematicPanels.length - 1) {
        setPanel(p => p + 1);
        setLeaving(false);
        setVisible(false);
        setTimeout(() => setVisible(true), 80);
      } else {
        onComplete();
      }
    }, 350);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: country.bgGradient,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
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
          border: `1px solid ${country.color}44`,
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

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${country.glowColor} 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Particle emitters */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: 18 + (i % 3) * 8,
          left: `${(i * 19.7) % 100}%`,
          top: `${(i * 13.1 + 5) % 90}%`,
          opacity: 0.08 + (i % 5) * 0.04,
          animation: `floatUp ${4 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${(i % 7) * 0.5}s`,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {country.emoji}
        </div>
      ))}

      {/* Flag stripe top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: country.color,
        boxShadow: `0 0 20px ${country.glowColor}`,
      }} />

      {/* Country badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 40,
        background: 'rgba(0,0,0,0.35)',
        border: `1px solid ${country.color}44`,
        borderRadius: 50,
        padding: '8px 20px 8px 12px',
      }}>
        <span style={{ fontSize: 28 }}>{country.emoji}</span>
        <div>
          <div style={{ color: country.accentColor, fontWeight: 800, fontSize: 14 }}>
            {country.name.toUpperCase()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            {country.capital} · {country.currency}
          </div>
        </div>
      </div>

      {/* Panel content */}
      <div style={{
        maxWidth: 540,
        textAlign: 'center',
        padding: '0 36px',
        opacity: visible && !leaving ? 1 : 0,
        transform: leaving
          ? 'translateY(-28px) scale(0.96)'
          : visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transition: 'all 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 5,
      }}>
        {/* Big icon */}
        <div style={{
          fontSize: 72,
          marginBottom: 24,
          filter: `drop-shadow(0 0 24px ${country.glowColor})`,
          lineHeight: 1,
        }}>
          {activePanel.icon}
        </div>

        <h2 style={{
          fontSize: 34,
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 18px',
          lineHeight: 1.2,
          textShadow: `0 0 30px ${country.glowColor}`,
        }}>
          {activePanel.title}
        </h2>

        <p style={{
          fontSize: 17,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {activePanel.text}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', gap: 10,
        position: 'absolute', bottom: 60,
      }}>
        {cinematicPanels.map((_, i) => (
          <div key={i} style={{
            width: i === panel ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: i === panel ? country.accentColor : 'rgba(255,255,255,0.18)',
            transition: 'all 0.3s',
            boxShadow: i === panel ? `0 0 8px ${country.glowColor}` : 'none',
          }} />
        ))}
      </div>

      {/* Tap hint */}
      <div style={{
        position: 'absolute', bottom: 28,
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}>
        {panel < cinematicPanels.length - 1 ? 'tap to continue' : 'tap to build'}
      </div>

      {/* Flag stripe bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
        background: country.color,
        boxShadow: `0 0 20px ${country.glowColor}`,
      }} />

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.06; }
          50%  { transform: translateY(-30px) rotate(10deg); opacity: 0.12; }
          100% { transform: translateY(0) rotate(0deg);   opacity: 0.06; }
        }
      `}</style>
    </div>
  );
}
