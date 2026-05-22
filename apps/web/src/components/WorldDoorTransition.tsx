import { useEffect, useState } from 'react';
import { WorldTheme } from '../types';
import { ParticleBackground } from './ParticleBackground';
import { playWhoosh } from '../soundEngine';

// Per-world door skin
const DOOR_SKIN: Record<string, {
  doorGradient: string;
  hingeColor: string;
  panelBorder: string;
  crackGlow: string;
  label: string;
}> = {
  jungle: {
    doorGradient: 'linear-gradient(160deg, #1c0a00 0%, #3d1800 45%, #5c2a00 70%, #3d1800 100%)',
    hingeColor: '#6b3a00',
    panelBorder: 'rgba(140,80,0,0.55)',
    crackGlow: '#a85000',
    label: 'THE JUNGLE AWAITS',
  },
  snow: {
    doorGradient: 'linear-gradient(160deg, #040e1c 0%, #0c1e38 45%, #1a3a5c 70%, #0c1e38 100%)',
    hingeColor: '#3a6090',
    panelBorder: 'rgba(100,160,220,0.4)',
    crackGlow: '#5aacee',
    label: 'THE BLIZZARD CALLS',
  },
  desert: {
    doorGradient: 'linear-gradient(160deg, #200c00 0%, #4a2200 45%, #7a3a00 70%, #4a2200 100%)',
    hingeColor: '#8a5a00',
    panelBorder: 'rgba(180,120,0,0.5)',
    crackGlow: '#c87a00',
    label: 'THE PHARAOH BECKONS',
  },
  space: {
    doorGradient: 'linear-gradient(160deg, #020008 0%, #0d0020 45%, #220040 70%, #0d0020 100%)',
    hingeColor: '#4a00a0',
    panelBorder: 'rgba(100,0,200,0.45)',
    crackGlow: '#9900ff',
    label: 'THE VOID OPENS',
  },
  underwater: {
    doorGradient: 'linear-gradient(160deg, #000810 0%, #001528 45%, #003050 70%, #001528 100%)',
    hingeColor: '#006688',
    panelBorder: 'rgba(0,120,170,0.45)',
    crackGlow: '#00bbdd',
    label: 'THE DEPTHS CALL',
  },
  volcano: {
    doorGradient: 'linear-gradient(160deg, #0a0000 0%, #2a0000 45%, #550000 70%, #2a0000 100%)',
    hingeColor: '#880000',
    panelBorder: 'rgba(200,40,0,0.5)',
    crackGlow: '#ff3300',
    label: 'THE MOUNTAIN ERUPTS',
  },
  heaven: {
    doorGradient: 'linear-gradient(160deg, #0d1e3a 0%, #1e3a6e 45%, #3a6aae 70%, #1e3a6e 100%)',
    hingeColor: '#5aaaee',
    panelBorder: 'rgba(180,220,255,0.4)',
    crackGlow: '#aaddff',
    label: 'THE GATES OPEN',
  },
  hell: {
    doorGradient: 'linear-gradient(160deg, #060000 0%, #180000 45%, #380000 70%, #180000 100%)',
    hingeColor: '#660000',
    panelBorder: 'rgba(160,10,10,0.55)',
    crackGlow: '#cc2200',
    label: 'HELL WELCOMES YOU',
  },
  flower: {
    doorGradient: 'linear-gradient(160deg, #0e0008 0%, #2c0018 45%, #520038 70%, #2c0018 100%)',
    hingeColor: '#8a1a50',
    panelBorder: 'rgba(200,40,100,0.45)',
    crackGlow: '#e91e8c',
    label: 'THE GARDEN AWAKENS',
  },
};

type Props = { world: WorldTheme; onComplete: () => void; onBack: () => void };

export function WorldDoorTransition({ world, onComplete, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);

  const skin = DOOR_SKIN[world.id] ?? DOOR_SKIN.jungle;

  useEffect(() => {
    // Brief pause so doors render closed first, then swing open
    const t1 = setTimeout(() => {
      setOpen(true);
      playWhoosh();
    }, 180);
    // Label fades in just after doors start moving
    const t2 = setTimeout(() => setLabelVisible(true), 600);
    // Call onComplete after doors are fully open and user has a moment to see world behind
    const t3 = setTimeout(() => onComplete(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hinge = (top: string) => (
    <div style={{
      position: 'absolute',
      top,
      width: '22px',
      height: '32px',
      background: `linear-gradient(135deg, ${skin.hingeColor}, #222)`,
      borderRadius: '4px',
      border: `1px solid ${skin.panelBorder}`,
      boxShadow: `0 2px 8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)`,
    }} />
  );

  const panelInset = (top: string, height: string) => (
    <div style={{
      position: 'absolute',
      left: '12%',
      right: '12%',
      top,
      height,
      border: `1px solid ${skin.panelBorder}`,
      borderRadius: '3px',
      boxShadow: `inset 0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04)`,
    }} />
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      background: world.bg,
    }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          zIndex: 30,
          background: 'rgba(0,0,0,0.42)',
          border: `1px solid ${skin.panelBorder}`,
          borderRadius: '8px',
          color: world.accentColor,
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          padding: '9px 14px',
          cursor: 'pointer',
          boxShadow: `0 0 18px ${skin.crackGlow}22`,
        }}
      >
        ← Back
      </button>
      {/* World revealed behind the doors */}
      <ParticleBackground particles={world.particles} count={18} />

      {/* World name label — fades in as doors open */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        pointerEvents: 'none',
        opacity: labelVisible && open ? 1 : 0,
        transition: 'opacity 0.7s ease',
      }}>
        <div style={{
          fontSize: 'clamp(48px, 10vw, 88px)',
          filter: `drop-shadow(0 0 28px ${world.glowColor})`,
          marginBottom: '18px',
          animation: 'idol-pulse 2s ease-in-out infinite',
        }}>
          {world.emoji}
        </div>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 'clamp(18px, 3.5vw, 36px)',
          fontWeight: 900,
          color: world.accentColor,
          letterSpacing: '0.18em',
          textShadow: `0 0 30px ${world.glowColor}, 0 0 60px ${world.glowColor}40`,
          textTransform: 'uppercase',
        }}>
          {world.name}
        </div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(10px, 1.6vw, 14px)',
          color: `${world.accentColor}99`,
          letterSpacing: '0.4em',
          marginTop: '10px',
          textTransform: 'uppercase',
        }}>
          {skin.label}
        </div>
      </div>

      {/* ── LEFT DOOR PANEL ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        background: skin.doorGradient,
        transform: open ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 1.35s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        boxShadow: open ? 'none' : `inset -4px 0 20px rgba(0,0,0,0.6), 4px 0 40px rgba(0,0,0,0.9)`,
      }}>
        {/* Hinges — on the left (outer) edge */}
        <div style={{ position: 'absolute', left: '8px', top: '14%' }}>{hinge('0')}</div>
        <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}>{hinge('0')}</div>
        <div style={{ position: 'absolute', left: '8px', bottom: '14%' }}>{hinge('0')}</div>

        {/* Panel insets */}
        {panelInset('8%', '30%')}
        {panelInset('45%', '12%')}
        {panelInset('62%', '28%')}

        {/* Vertical centre trim */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '6px',
          height: '100%',
          background: `linear-gradient(180deg, ${skin.crackGlow}00, ${skin.crackGlow}cc 20%, ${skin.crackGlow}ff 50%, ${skin.crackGlow}cc 80%, ${skin.crackGlow}00)`,
          boxShadow: `0 0 18px ${skin.crackGlow}, 0 0 40px ${skin.crackGlow}88`,
        }} />

        {/* World emoji — left half */}
        <div style={{
          position: 'absolute',
          right: '18%',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(36px, 7vw, 64px)',
          opacity: 0.25,
          filter: `drop-shadow(0 0 12px ${world.glowColor})`,
        }}>
          {world.emoji}
        </div>
      </div>

      {/* ── RIGHT DOOR PANEL ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        background: skin.doorGradient,
        transform: open ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 1.35s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 20,
        boxShadow: open ? 'none' : `inset 4px 0 20px rgba(0,0,0,0.6), -4px 0 40px rgba(0,0,0,0.9)`,
      }}>
        {/* Hinges — on the right (outer) edge */}
        <div style={{ position: 'absolute', right: '8px', top: '14%' }}>{hinge('0')}</div>
        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>{hinge('0')}</div>
        <div style={{ position: 'absolute', right: '8px', bottom: '14%' }}>{hinge('0')}</div>

        {/* Panel insets */}
        {panelInset('8%', '30%')}
        {panelInset('45%', '12%')}
        {panelInset('62%', '28%')}

        {/* Vertical centre trim */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '6px',
          height: '100%',
          background: `linear-gradient(180deg, ${skin.crackGlow}00, ${skin.crackGlow}cc 20%, ${skin.crackGlow}ff 50%, ${skin.crackGlow}cc 80%, ${skin.crackGlow}00)`,
          boxShadow: `0 0 18px ${skin.crackGlow}, 0 0 40px ${skin.crackGlow}88`,
        }} />

        {/* World emoji — right half */}
        <div style={{
          position: 'absolute',
          left: '18%',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(36px, 7vw, 64px)',
          opacity: 0.25,
          filter: `drop-shadow(0 0 12px ${world.glowColor})`,
        }}>
          {world.emoji}
        </div>
      </div>

      {/* Centre seam glow — visible when doors are still closed */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '100%',
        background: `linear-gradient(180deg, transparent 0%, ${skin.crackGlow}aa 15%, ${skin.crackGlow} 50%, ${skin.crackGlow}aa 85%, transparent 100%)`,
        boxShadow: `0 0 24px ${skin.crackGlow}, 0 0 60px ${skin.crackGlow}66`,
        zIndex: 25,
        opacity: open ? 0 : 1,
        transition: 'opacity 0.6s ease 0.4s',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
