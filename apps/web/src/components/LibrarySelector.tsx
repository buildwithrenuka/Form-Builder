import { useState, useEffect } from 'react';
import { LIBRARY_WORLDS, type LibraryWorld } from '../libraryData';

type Props = {
  onSelect: (world: LibraryWorld) => void;
  onBack: () => void;
};

const WORLD_BG: Record<string, string> = {
  mythology: 'radial-gradient(ellipse at 50% 0%, #3d2800 0%, #1a1000 60%, #000 100%)',
  history:   'radial-gradient(ellipse at 50% 0%, #2d1a00 0%, #1a0f00 60%, #000 100%)',
  scifi:     'radial-gradient(ellipse at 50% 0%, #001a2d 0%, #00040f 60%, #000 100%)',
  fictional: 'radial-gradient(ellipse at 50% 0%, #1e0030 0%, #0d0018 60%, #000 100%)',
};

export function LibrarySelector({ onSelect, onBack }: Props) {
  const [hovered, setHovered]   = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [entered, setEntered]   = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  function handleSelect(w: LibraryWorld) {
    setSelected(w.id);
    setTimeout(() => onSelect(w), 500);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 20%, #100020 0%, #050010 60%, #000 100%)',
      overflow: 'auto',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.5s',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Ambient floating books */}
      {['📚', '📖', '📜', '✨', '🔮', '⚡', '🚀', '🪄'].map((b, i) => (
        <div key={i} style={{
          position: 'fixed',
          fontSize: 22 + (i % 3) * 8,
          left: `${(i * 12.5 + 2) % 96}%`,
          top: `${(i * 9.3 + 4) % 92}%`,
          opacity: 0.04,
          userSelect: 'none', pointerEvents: 'none',
          animation: `drift ${5 + i % 4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.4}s`,
        }}>{b}</div>
      ))}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', borderRadius: 10, padding: '8px 18px',
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>← Back</button>

        <div>
          <div style={{
            fontFamily: "'Georgia', serif", color: '#f59e0b',
            fontWeight: 700, fontSize: 18, letterSpacing: '0.04em',
          }}>📚 The Grand Library</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
            Choose your world — four realms of knowledge await
          </div>
        </div>
      </div>

      {/* World grid */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 28px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
      }}>
        {LIBRARY_WORLDS.map((world) => {
          const isHov = hovered === world.id;
          const isSel = selected === world.id;

          return (
            <div
              key={world.id}
              onClick={() => handleSelect(world)}
              onMouseEnter={() => setHovered(world.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov || isSel
                  ? WORLD_BG[world.id]
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHov || isSel ? world.color + '66' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 20,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isHov ? `0 0 48px ${world.glowColor}, 0 0 90px ${world.glowColor}55` : 'none',
                transform: isSel ? 'scale(1.03)' : isHov ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                position: 'relative',
              }}
            >
              {/* Glow top accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: isHov || isSel
                  ? `linear-gradient(90deg, transparent, ${world.color}, transparent)`
                  : `linear-gradient(90deg, transparent, ${world.color}33, transparent)`,
                transition: 'all 0.3s',
              }} />

              {/* World emoji header */}
              <div style={{
                padding: '28px 24px 20px',
                textAlign: 'center',
                background: isHov
                  ? `radial-gradient(ellipse at 50% 0%, ${world.color}22 0%, transparent 70%)`
                  : 'transparent',
                transition: 'background 0.3s',
              }}>
                <div style={{
                  fontSize: 60, lineHeight: 1, marginBottom: 12,
                  filter: isHov ? `drop-shadow(0 0 24px ${world.glowColor})` : 'none',
                  transition: 'filter 0.3s',
                }}>{world.emoji}</div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: `${world.color}14`, border: `1px solid ${world.color}33`,
                  borderRadius: 20, padding: '3px 12px', marginBottom: 14,
                }}>
                  <span style={{ color: world.accentColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {world.genre}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Georgia', serif",
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  margin: '0 0 6px', lineHeight: 1.2,
                }}>{world.name}</h3>

                <div style={{
                  color: world.accentColor, fontSize: 12,
                  fontStyle: 'italic', marginBottom: 14, opacity: 0.8,
                }}>{world.tagline}</div>
              </div>

              {/* Divider */}
              <div style={{
                height: 1, margin: '0 24px',
                background: `linear-gradient(90deg, transparent, ${world.color}33, transparent)`,
              }} />

              {/* Lore text */}
              <div style={{ padding: '16px 24px 20px' }}>
                <p style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: 13,
                  lineHeight: 1.7, margin: '0 0 16px',
                }}>{world.lore}</p>

                {/* Cinematic panels count */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                  {world.cinematic.map((c, ci) => (
                    <div key={ci} style={{
                      background: `${world.color}10`, border: `1px solid ${world.color}25`,
                      borderRadius: 6, padding: '4px 8px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ fontSize: 12 }}>{c.icon}</span>
                      <span style={{ fontSize: 10, color: `${world.accentColor}99`, fontWeight: 600 }}>{c.title}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button style={{
                  width: '100%',
                  background: isHov || isSel
                    ? `linear-gradient(135deg, ${world.color}cc, ${world.accentColor})`
                    : `${world.color}12`,
                  border: `1px solid ${isHov || isSel ? world.color + '88' : world.color + '30'}`,
                  color: isHov || isSel ? '#000' : world.accentColor,
                  borderRadius: 10, padding: '12px 16px',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.06em', transition: 'all 0.3s',
                  boxShadow: isHov ? `0 0 20px ${world.glowColor}` : 'none',
                  pointerEvents: 'none', // click handled by parent div
                }}>
                  {isSel ? '✓ Entering…' : `Enter ${world.name} →`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes drift {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-16px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
