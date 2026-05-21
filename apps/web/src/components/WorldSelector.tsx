import { useState } from 'react';
import { WorldTheme, Avatar } from '../types';
import { WORLDS } from '../themes';
import { ParticleBackground } from './ParticleBackground';

type Props = {
  avatar: Avatar;
  currentWorld?: WorldTheme | null;
  onSelect: (world: WorldTheme) => void;
  onBack: () => void;
};

function WorldCard({
  world,
  selected,
  onClick,
  index,
}: {
  world: WorldTheme;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const active = selected || hovered;
  const cardBackground = active
    ? `linear-gradient(180deg, ${world.primaryColor}18 0%, ${world.cardBg} 34%, rgba(5,5,10,0.96) 100%)`
    : `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, ${world.cardBg} 38%, rgba(5,5,10,0.94) 100%)`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="tr-card"
      style={{
        background: cardBackground,
        border: `2px solid ${selected ? world.accentColor : hovered ? world.borderColor : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '18px',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: world.textColor,
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        animation: `card-enter 0.4s ease-out ${index * 0.1}s both`,
        boxShadow: selected
          ? `0 0 28px ${world.glowColor}88, 0 0 56px ${world.glowColor}44, inset 0 0 30px rgba(255,255,255,0.04)`
          : hovered
          ? `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${world.glowColor}44`
          : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.25s ease',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        transform: selected ? 'translateY(-4px) scale(1.015)' : hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${world.glowColor}${active ? '44' : '16'} 0%, transparent 52%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${world.accentColor}, transparent)`,
          opacity: active ? 1 : 0.5,
        }}
      />

      {/* Selected badge */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: world.accentColor,
            color: '#000',
            fontSize: '9px',
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 900,
            padding: '4px 10px',
            borderRadius: '4px',
            letterSpacing: '0.1em',
            zIndex: 2,
          }}
        >
          ✓ SELECTED
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, flex: 1, padding: '24px 20px 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: `${world.accentColor}14`,
                border: `1px solid ${world.accentColor}2f`,
                borderRadius: '999px',
                padding: '4px 10px',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '11px' }}>{world.emoji}</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', fontWeight: 800, color: world.accentColor, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Temple Theme
              </span>
            </div>

            {/* World name */}
            <div
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '15px',
                fontWeight: 700,
                color: active ? world.accentColor : '#f2eee4',
                marginBottom: '4px',
                lineHeight: 1.2,
                textShadow: active ? `0 0 12px ${world.glowColor}` : 'none',
                transition: 'color 0.2s ease',
              }}
            >
              {world.name}
            </div>

            {/* Tagline */}
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: world.mutedColor,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              {world.tagline}
            </div>
          </div>

          {/* World emoji */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${world.accentColor}24 0%, transparent 70%)`,
              border: `1px solid ${world.accentColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: active ? `0 0 22px ${world.glowColor}55` : 'none',
            }}
          >
            <div
              style={{
                fontSize: '34px',
                filter: selected ? `drop-shadow(0 0 16px ${world.glowColor})` : undefined,
                animation: selected ? 'float 3s ease-in-out infinite' : undefined,
              }}
            >
              {world.emoji}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: `linear-gradient(90deg, ${world.borderColor}00, ${world.borderColor}55, transparent)`, marginBottom: '14px' }} />

        <div
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '12px',
            color: active ? world.textColor : 'rgba(232,232,232,0.68)',
            lineHeight: 1.55,
            transition: 'color 0.2s ease',
            minHeight: '74px',
            flex: 1,
          }}
        >
          {world.description}
        </div>

        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {world.particles.slice(0, 4).map((p, i) => (
              <span
                key={i}
                style={{
                  fontSize: '18px',
                  opacity: active ? 1 : 0.42,
                  animation: active ? `bounce 1.2s ease-in-out ${i * 0.15}s infinite` : undefined,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {p}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 800, color: active ? world.accentColor : 'rgba(255,255,255,0.34)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {selected ? 'Ready to enter' : 'Preview realm'}
          </div>
        </div>
      </div>

      {/* Bottom glow line when selected */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${world.accentColor}, transparent)`,
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      )}
    </button>
  );
}

export function WorldSelector({ avatar, currentWorld = null, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<WorldTheme | null>(currentWorld);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #050510 0%, #0d0d25 40%, #100520 80%, #060510 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground
        particles={selected ? selected.particles : ['✨', '💫', '⭐', '🌟']}
        count={20}
      />

      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          padding: '20px 32px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          className="tr-btn"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#ccc',
            fontSize: '13px',
            padding: '10px 20px',
            border: '1px solid rgba(255,255,255,0.15)',
            letterSpacing: '0.1em',
          }}
        >
          ← BACK
        </button>

        <div style={{ textAlign: 'center' }}>
          {/* Avatar chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${avatar.color}55`,
              borderRadius: '20px',
              padding: '4px 12px 4px 6px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{avatar.emoji}</span>
            <span
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '12px',
                color: avatar.color,
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              {avatar.name}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(14px, 2.5vw, 24px)',
              fontWeight: 900,
              color: '#ffe08a',
              background: 'linear-gradient(135deg, #ffd700, #ffec70, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 12px rgba(49, 24, 0, 0.3)',
              filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.35))',
            }}
          >
            Choose Your World
          </div>
        </div>

        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="tr-btn"
          style={{
            background: selected
              ? selected.buttonGradient
              : 'rgba(255,255,255,0.06)',
            color: selected ? selected.buttonText : 'rgba(255,255,255,0.3)',
            fontSize: '13px',
            padding: '10px 20px',
            border: selected ? 'none' : '1px solid rgba(255,255,255,0.1)',
            letterSpacing: '0.1em',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? `0 0 16px ${selected.glowColor}66` : 'none',
          }}
        >
          ENTER →
        </button>
      </div>

      {/* World grid */}
      <div
        className="tr-scroll"
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          padding: '20px 32px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '16px',
          alignContent: 'start',
        }}
      >
        {WORLDS.map((world, i) => (
          <WorldCard
            key={world.id}
            world={world}
            selected={selected?.id === world.id}
            onClick={() => setSelected(world)}
            index={i}
          />
        ))}
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          padding: '10px',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.15em',
          flexShrink: 0,
        }}
      >
        {selected
          ? `🌍 ${selected.name} — ${selected.tagline}`
          : '👆 Pick a world to begin your adventure'}
      </div>
    </div>
  );
}
