import { useState, useEffect, useRef } from 'react';
import { COUNTRIES, CONTINENTS, type Country } from '../globeData';

type Props = {
  onSelect: (country: Country) => void;
  onBack: () => void;
};

export function GlobeSelector({ onSelect, onBack }: Props) {
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Country | null>(null);
  const [entered, setEntered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  // Slow auto-rotation
  useEffect(() => {
    setEntered(true);
    const animate = (ts: number) => {
      const dt = ts - lastRef.current;
      lastRef.current = ts;
      setRotation(r => (r + dt * 0.008) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(t => { lastRef.current = t; rafRef.current = requestAnimationFrame(animate); });
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const filtered = filter === 'all'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.continent === filter);

  function handleCountryClick(c: Country) {
    setSelected(c);
    // short delay for selection animation then transition
    setTimeout(() => onSelect(c), 600);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 20%, #0a1628 0%, #03001c 60%, #000 100%)',
      overflow: 'hidden',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.6s',
    }}>
      {/* Stars */}
      {Array.from({ length: 80 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
          height: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
          background: '#fff',
          borderRadius: '50%',
          left: `${(i * 13.7) % 100}%`,
          top: `${(i * 9.3) % 100}%`,
          opacity: 0.2 + (i % 7) * 0.08,
          animation: `tw ${2 + (i % 4)}s ease-in-out infinite alternate`,
          animationDelay: `${(i % 8) * 0.25}s`,
        }} />
      ))}

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ← Back
        </button>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>
            🌍 Globe Explorer
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
            Select a country to begin building
          </div>
        </div>
      </div>

      {/* Globe visual */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 520, height: 520,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 35% 35%, rgba(0,160,255,0.18) 0%, transparent 50%),
          radial-gradient(circle at 65% 65%, rgba(0,80,180,0.12) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(0,50,120,0.6) 0%, rgba(0,20,60,0.9) 70%, rgba(0,0,20,1) 100%)
        `,
        boxShadow: '0 0 80px rgba(0,100,255,0.2), inset 0 0 60px rgba(0,0,80,0.5)',
        border: '1px solid rgba(0,150,255,0.15)',
        zIndex: 1,
      }}>
        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`lat-${i}`} style={{
            position: 'absolute',
            left: '5%', right: '5%',
            top: `${10 + i * 10}%`,
            height: 1,
            background: 'rgba(0,150,255,0.08)',
            borderRadius: 1,
          }} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`lon-${i}`} style={{
            position: 'absolute',
            top: '5%', bottom: '5%',
            left: `${10 + i * 10}%`,
            width: 1,
            background: 'rgba(0,150,255,0.08)',
          }} />
        ))}

        {/* Country pins on globe */}
        {filtered.map(c => {
          const isHovered   = hovered === c.id;
          const isSelected  = selected?.id === c.id;

          return (
            <div
              key={c.id}
              title={c.name}
              onClick={() => handleCountryClick(c)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'absolute',
                left: `${c.x}%`,
                top: `${c.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isHovered || isSelected ? 20 : 5,
                transition: 'all 0.2s',
              }}
            >
              {/* Glow ring */}
              <div style={{
                position: 'absolute',
                inset: isHovered ? -8 : 0,
                borderRadius: '50%',
                background: c.glowColor,
                filter: 'blur(6px)',
                opacity: isHovered ? 1 : 0.4,
                transition: 'all 0.2s',
              }} />

              {/* Pin dot */}
              <div style={{
                width: isHovered ? 28 : 20,
                height: isHovered ? 28 : 20,
                borderRadius: '50%',
                background: isSelected
                  ? '#fff'
                  : `radial-gradient(circle at 35% 35%, ${c.color}ff, ${c.color}88)`,
                border: `2px solid ${isHovered ? '#fff' : c.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isHovered ? 16 : 12,
                boxShadow: `0 0 ${isHovered ? 16 : 8}px ${c.glowColor}`,
                transition: 'all 0.2s',
                position: 'relative',
              }}>
                {isHovered || isSelected ? c.emoji : '●'}
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.92)',
                  border: `1px solid ${c.color}55`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 30,
                }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                    {c.emoji} {c.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                    {c.capital} · {c.currencySymbol}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continent filter */}
      <div style={{
        position: 'absolute',
        bottom: 90, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
        zIndex: 10,
        padding: '0 20px',
        maxWidth: 680,
      }}>
        {CONTINENTS.map(cont => (
          <button
            key={cont.id}
            onClick={() => setFilter(cont.id)}
            style={{
              background: filter === cont.id
                ? 'rgba(0,229,255,0.2)'
                : 'rgba(255,255,255,0.06)',
              border: `1px solid ${filter === cont.id ? '#00e5ff' : 'rgba(255,255,255,0.12)'}`,
              color: filter === cont.id ? '#00e5ff' : 'rgba(255,255,255,0.7)',
              borderRadius: 20,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {cont.emoji} {cont.name}
          </button>
        ))}
      </div>

      {/* Country cards row */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 80,
        display: 'flex', alignItems: 'center',
        gap: 10, padding: '0 20px',
        overflowX: 'auto',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => handleCountryClick(c)}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              flexShrink: 0,
              background: hovered === c.id
                ? `linear-gradient(135deg, ${c.color}33, rgba(0,0,0,0.6))`
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${hovered === c.id ? c.color : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#fff',
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 22 }}>{c.emoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{c.continent}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Globe orbit ring */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 580, height: 580,
        transform: 'translate(-50%, -50%)',
        border: '1px solid rgba(0,150,255,0.06)',
        borderRadius: '50%',
        animation: 'orbitRing 20s linear infinite',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 640, height: 280,
        transform: `translate(-50%, -50%) rotateX(75deg) rotateZ(${rotation}deg)`,
        border: '1px solid rgba(0,200,255,0.08)',
        borderRadius: '50%',
        zIndex: 0,
      }} />

      <style>{`
        @keyframes tw {
          from { opacity: 0.1; }
          to   { opacity: 0.7; }
        }
        @keyframes orbitRing {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
