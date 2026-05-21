import { useState } from 'react';
import { Avatar } from '../types';
import { AVATARS } from '../themes';
import { ParticleBackground } from './ParticleBackground';
import { playClick, playCoin, playHover } from '../soundEngine';

type Props = {
  currentAvatar?: Avatar | null;
  onSelect: (avatar: Avatar) => void;
  onBack: () => void;
};

function StatBar({ value, color, animate }: { value: number; color: string; animate: boolean }) {
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: animate ? `${value * 10}%` : '0%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: '3px',
          transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}

function AvatarCard({
  avatar,
  selected,
  onClick,
  index,
}: {
  avatar: Avatar;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); if (!selected) playHover(); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active
          ? avatar.bgGradient
          : 'linear-gradient(160deg, #0e0e1e 0%, #1a1a2e 100%)',
        border: `2px solid ${selected ? avatar.color : hovered ? avatar.color + '66' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '16px',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: '#fff',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        animation: `card-enter 0.45s ease-out ${index * 0.07}s both`,
        boxShadow: selected
          ? `0 0 0 2px ${avatar.color}88, 0 0 40px ${avatar.color}55, 0 0 80px ${avatar.color}22, inset 0 0 30px rgba(255,255,255,0.04)`
          : hovered
          ? `0 16px 48px rgba(0,0,0,0.6), 0 0 24px ${avatar.color}33`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.25s ease',
        transform: selected ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'scale(1)',
        minHeight: '430px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Background shimmer on active */}
      {active && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)', borderRadius: '14px', pointerEvents: 'none' }} />
      )}

      {/* TRAIT badge */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px',
        background: selected ? avatar.color : `${avatar.color}22`,
        border: `1px solid ${avatar.color}66`,
        color: selected ? '#000' : avatar.color,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '9px', fontWeight: 900,
        padding: '3px 9px', borderRadius: '4px',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        transition: 'all 0.2s',
        zIndex: 2,
      }}>
        {avatar.trait}
      </div>

      {/* CHOSEN badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: avatar.color, color: '#000',
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: '8px', fontWeight: 900,
          padding: '3px 9px', borderRadius: '4px',
          letterSpacing: '0.1em', zIndex: 2,
        }}>
          ✓ CHOSEN
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '52px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Glow ring + emoji */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: `radial-gradient(circle, ${avatar.color}28 0%, transparent 65%)`,
            border: `2px solid ${active ? avatar.color + '88' : avatar.color + '33'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: active ? `0 0 30px ${avatar.color}55, 0 0 60px ${avatar.color}22` : 'none',
            animation: selected ? 'float 2.8s ease-in-out infinite' : 'none',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '44px', filter: active ? `drop-shadow(0 0 12px ${avatar.color})` : 'none' }}>
              {avatar.emoji}
            </span>
          </div>
        </div>

        {/* Name */}
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '14px', fontWeight: 700, color: active ? '#fff' : '#ddd', marginBottom: '2px', textAlign: 'center', lineHeight: 1.2 }}>
          {avatar.name}
        </div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, color: avatar.color, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
          {avatar.title}
        </div>

        {/* Description */}
        <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.58, marginBottom: '14px', textAlign: 'left', flex: 1 }}>
          {avatar.description}
        </p>

        {/* Special ability */}
        <div style={{
          background: `${avatar.color}12`,
          border: `1px solid ${avatar.color}33`,
          borderRadius: '7px', padding: '8px 12px', marginBottom: '14px',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>{avatar.abilityIcon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: avatar.color, letterSpacing: '0.18em', fontWeight: 700, marginBottom: '2px' }}>SPECIAL ABILITY</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>{avatar.ability}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {[
            { label: 'Speed', value: avatar.speed },
            { label: 'Power', value: avatar.power },
            { label: 'Agility', value: avatar.agility },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em' }}>
                <span>{label}</span>
                <span style={{ color: avatar.color, fontWeight: 700 }}>{value}</span>
              </div>
              <StatBar value={value} color={avatar.color} animate={active} />
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

export function AvatarSelector({ currentAvatar = null, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<Avatar | null>(currentAvatar);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, #0d0520 0%, #080818 40%, #050510 80%, #030308 100%)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <ParticleBackground particles={['⭐', '✨', '💫', '🌟', '🪙']} count={20} />

      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 55 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${(i * 17.3) % 100}%`,
            left: `${(i * 23.7) % 100}%`,
            width: `${1 + (i % 3) * 0.8}px`, height: `${1 + (i % 3) * 0.8}px`,
            borderRadius: '50%', background: '#fff',
            opacity: 0.25 + (i % 4) * 0.12,
            animation: `twinkle ${2.5 + (i % 5) * 0.8}s ease-in-out ${(i % 6) * 0.6}s infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 5, padding: '22px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button
          onClick={() => { playClick(); onBack(); }}
          className="tr-btn"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', fontSize: '12px', padding: '9px 18px', border: '1px solid rgba(255,255,255,0.14)', letterSpacing: '0.1em' }}
        >
          ← BACK
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(14px, 2.5vw, 24px)', fontWeight: 900, color: '#ffe08a', background: 'linear-gradient(135deg, #ffd700, #ffec70, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: '0 0 12px rgba(49, 24, 0, 0.3)', filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.35))' }}>
            Choose Your Runner
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginTop: '3px' }}>
            6 LEGENDARY CHARACTERS · SELECT ONE
          </div>
        </div>

        <button
          onClick={() => { if (selected) { playSuccess(); onSelect(selected); } }}
          className="tr-btn"
          disabled={!selected}
          style={{ background: selected ? 'linear-gradient(135deg, #8B4513, #cd853f, #ffd700)' : 'rgba(255,255,255,0.05)', color: selected ? '#1a0a00' : 'rgba(255,255,255,0.25)', fontSize: '12px', padding: '9px 18px', border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.1em', cursor: selected ? 'pointer' : 'not-allowed', boxShadow: selected ? '0 0 18px rgba(255,215,0,0.45)' : 'none', transition: 'all 0.25s' }}
        >
          CONTINUE →
        </button>
      </div>

      {/* Grid */}
      <div
        className="tr-scroll"
        style={{ position: 'relative', zIndex: 5, flex: 1, padding: '20px 28px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', alignContent: 'start', overflow: 'auto' }}
      >
        {AVATARS.map((avatar, i) => (
          <AvatarCard
            key={avatar.id}
            avatar={avatar}
            selected={selected?.id === avatar.id}
            onClick={() => { setSelected(avatar); playCoin(); }}
            index={i}
          />
        ))}
      </div>

      {/* Bottom status */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: selected ? selected.color : 'rgba(255,255,255,0.28)', letterSpacing: '0.16em', flexShrink: 0, transition: 'color 0.3s' }}>
        {selected ? `✨ ${selected.name} — ${selected.trait} · READY TO RUN` : '👆 SELECT YOUR RUNNER TO CONTINUE'}
      </div>
    </div>
  );
}

function playSuccess() {
  import('../soundEngine').then(m => m.playSuccess());
}
