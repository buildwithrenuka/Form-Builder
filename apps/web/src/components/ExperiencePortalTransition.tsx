import { useEffect, useState } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { playWhoosh } from '../soundEngine';

type Props = {
  bg: string;
  accentColor: string;
  glowColor: string;
  emoji: string;
  title: string;
  subtitle: string;
  particles?: string[];
  onComplete: () => void;
  onBack: () => void;
};

export function ExperiencePortalTransition({ bg, accentColor, glowColor, emoji, title, subtitle, particles = [], onComplete, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);

  useEffect(() => {
    const timer1 = window.setTimeout(() => {
      setOpen(true);
      playWhoosh();
    }, 180);
    const timer2 = window.setTimeout(() => setLabelVisible(true), 560);
    const timer3 = window.setTimeout(() => onComplete(), 2450);
    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: bg }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 12,
          background: 'rgba(0,0,0,0.34)',
          border: `1px solid ${accentColor}55`,
          borderRadius: 10,
          color: '#fff',
          padding: '9px 14px',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          boxShadow: `0 0 18px ${glowColor}22`,
        }}
      >
        ← Back
      </button>

      <ParticleBackground particles={particles} count={16} />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: labelVisible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        <div style={{ fontSize: 'clamp(52px, 10vw, 96px)', filter: `drop-shadow(0 0 28px ${glowColor})`, marginBottom: 18 }}>
          {emoji}
        </div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(18px, 3.6vw, 34px)', fontWeight: 900, color: accentColor, letterSpacing: '0.16em', textTransform: 'uppercase', textShadow: `0 0 28px ${glowColor}` }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(10px, 1.6vw, 14px)', color: `${accentColor}bb`, letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: 12 }}>
          {subtitle}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        background: `linear-gradient(160deg, rgba(0,0,0,0.94) 0%, rgba(18,18,24,0.98) 35%, rgba(36,36,48,0.98) 70%, rgba(0,0,0,0.94) 100%)`,
        transform: open ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 1.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10,
        boxShadow: open ? 'none' : `inset -4px 0 20px rgba(0,0,0,0.7), 4px 0 40px rgba(0,0,0,0.92)`,
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: 6, height: '100%', background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`, boxShadow: `0 0 18px ${glowColor}` }} />
      </div>

      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        background: `linear-gradient(200deg, rgba(0,0,0,0.94) 0%, rgba(18,18,24,0.98) 35%, rgba(36,36,48,0.98) 70%, rgba(0,0,0,0.94) 100%)`,
        transform: open ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 1.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10,
        boxShadow: open ? 'none' : `inset 4px 0 20px rgba(0,0,0,0.7), -4px 0 40px rgba(0,0,0,0.92)`,
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 6, height: '100%', background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`, boxShadow: `0 0 18px ${glowColor}` }} />
      </div>
    </div>
  );
}