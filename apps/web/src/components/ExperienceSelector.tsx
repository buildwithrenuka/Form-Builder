import { useState, useEffect } from 'react';

type Props = {
  onSelectTempleRun: () => void;
  onSelectGlobe:     () => void;
  onBack:            () => void;
};

export function ExperienceSelector({ onSelectTempleRun, onSelectGlobe, onBack }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  const tHov = hovered === 'temple';
  const gHov = hovered === 'globe';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 20%, #0a0020 0%, #03001c 50%, #000 100%)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.5s',
    }}>
      {/* Background ambient particles */}
      {['🏃','🌍','💰','✈️','🔥','🗺️','💎','🌎','⚡','🌏'].map((p, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: 20 + (i % 3) * 8, left: `${(i * 11.3) % 92}%`, top: `${(i * 8.7) % 88}%`, opacity: 0.05, animation: `drift ${6 + (i % 5)}s ease-in-out infinite alternate`, animationDelay: `${i * 0.4}s`, userSelect: 'none', pointerEvents: 'none' }}>{p}</div>
      ))}

      {/* Back + header */}
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'system-ui, sans-serif', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}>
          ← Home
        </button>
        <div>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: '0.04em' }}>Choose Your Experience</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2, letterSpacing: '0.1em' }}>Two worlds. One form builder.</div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 40px 40px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

        {/* ── TEMPLE RUN CARD — Gamified ── */}
        <div
          onClick={onSelectTempleRun}
          onMouseEnter={() => setHovered('temple')}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: tHov
              ? 'radial-gradient(ellipse at 50% 0%, #4a1500 0%, #1c0700 60%, #0a0000 100%)'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${tHov ? 'rgba(255,140,0,0.55)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 20,
            padding: '0 0 32px',
            cursor: 'pointer',
            maxWidth: 380,
            width: '100%',
            boxShadow: tHov ? '0 0 50px rgba(255,140,0,0.25), 0 0 100px rgba(255,140,0,0.1)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            transform: tHov ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Fire particle strip */}
          <div style={{ height: 46, background: tHov ? 'rgba(200,60,0,0.22)' : 'rgba(100,30,0,0.12)', borderBottom: `1px solid ${tHov ? 'rgba(255,140,0,0.25)' : 'rgba(255,140,0,0.1)'}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 16, transition: 'all 0.3s', overflow: 'hidden' }}>
            {['🏃','💰','🌿','💎','🔥','⚡','🏆'].map((p, i) => (
              <span key={i} style={{ opacity: tHov ? 0.7 : 0.2, transition: 'opacity 0.3s', transitionDelay: `${i * 0.03}s` }}>{p}</span>
            ))}
          </div>

          <div style={{ padding: '26px 32px 0' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Experience 01 — Gamified Adventure</span>
            </div>

            {/* Emoji */}
            <div style={{ fontSize: 60, marginBottom: 14, filter: tHov ? 'drop-shadow(0 0 24px rgba(255,140,0,0.8))' : 'none', transition: 'filter 0.3s', lineHeight: 1 }}>🏃</div>

            {/* Title — Cinzel Decorative for the game */}
            <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 4px', lineHeight: 1.1 }}>Temple Run</h3>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", color: '#ff8c00', fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: '0.1em' }}>The Original Quest</div>

            {/* Desc */}
            <p style={{ fontFamily: "'Rajdhani', sans-serif", color: 'rgba(255,240,200,0.6)', fontSize: 14, lineHeight: 1.65, margin: '0 0 18px', letterSpacing: '0.02em' }}>
              Choose your runner. Pick a world. Build forms inside cinematic jungle temples, frozen ruins, and volcanic hellscapes — with ambient audio and story cinematics.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
              {['11 legendary avatars', '9 themed worlds', 'Cinematic door transitions', 'World story cinematics', 'Mission map'].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Rajdhani', sans-serif", color: 'rgba(255,240,200,0.6)', fontSize: 13 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff8c00', flexShrink: 0, boxShadow: tHov ? '0 0 6px #ff8c00' : 'none', transition: 'box-shadow 0.3s' }} />
                  {feat}
                </div>
              ))}
            </div>

            {/* CTA — game style */}
            <button className="tr-btn" style={{ width: '100%', background: tHov ? 'linear-gradient(135deg, #5c1a00, #b84500, #ffd700)' : 'rgba(255,140,0,0.12)', border: `1px solid ${tHov ? 'rgba(255,215,0,0.6)' : 'rgba(255,140,0,0.3)'}`, color: tHov ? '#1a0800' : '#ff8c00', fontSize: 14, padding: '13px 20px', letterSpacing: '0.12em', textAlign: 'center', fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s', boxShadow: tHov ? '0 0 20px rgba(255,215,0,0.3)' : 'none' }}>
              {tHov ? '🏃 ENTER TEMPLE RUN' : 'Select Experience'}
            </button>
          </div>
        </div>

        {/* ── GLOBE EXPLORER CARD — Travel & Exploration ── */}
        <div
          onClick={onSelectGlobe}
          onMouseEnter={() => setHovered('globe')}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: gHov
              ? 'radial-gradient(ellipse at 50% 0%, #1c1408 0%, #0e0e18 60%, #03001c 100%)'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${gHov ? 'rgba(201,168,76,0.52)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 20,
            padding: '32px 32px',
            cursor: 'pointer',
            maxWidth: 380,
            width: '100%',
            boxShadow: gHov ? '0 0 50px rgba(201,168,76,0.2), 0 0 100px rgba(201,168,76,0.07)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            transform: gHov ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Gold accent bar at top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gHov ? 'linear-gradient(90deg, transparent, #c9a84c, transparent)' : 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)', transition: 'all 0.3s' }} />

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
            <span style={{ fontFamily: "'Exo 2', sans-serif", color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Experience 02 — Travel & Exploration</span>
          </div>

          {/* Emoji */}
          <div style={{ fontSize: 56, marginBottom: 14, lineHeight: 1, filter: gHov ? 'drop-shadow(0 0 18px rgba(201,168,76,0.5))' : 'none', transition: 'filter 0.3s' }}>✈️</div>

          {/* Title */}
          <h3 style={{ fontFamily: "'Exo 2', sans-serif", color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.01em' }}>Globe Explorer</h3>
          <div style={{ fontFamily: "'Exo 2', sans-serif", color: '#c9a84c', fontSize: 13, fontWeight: 600, marginBottom: 14, letterSpacing: '0.04em' }}>Every destination. Every journey.</div>

          {/* Desc — classy travel copy */}
          <p style={{ fontFamily: "'Exo 2', sans-serif", color: 'rgba(235,220,185,0.52)', fontSize: 14, lineHeight: 1.75, margin: '0 0 18px' }}>
            Choose a destination. Build elegant forms for your journey — visa applications, customs declarations, travel itineraries. Each country opens with landmark cinematics and local flair.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
            {['12 global travel destinations', 'Visa & customs form templates', 'Landmark cinematics per country', 'Currency & locale formatting', 'Share forms with your travel party'].map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Exo 2', sans-serif", color: 'rgba(235,220,185,0.5)', fontSize: 13 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
                {feat}
              </div>
            ))}
          </div>

          {/* CTA — gold travel button */}
          <button
            style={{
              width: '100%',
              background: gHov ? 'linear-gradient(135deg, #1a1208, #3a2810, #c9a84c)' : 'rgba(201,168,76,0.08)',
              border: `1px solid ${gHov ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.2)'}`,
              color: gHov ? '#1a0e00' : '#c9a84c',
              fontSize: 14, fontWeight: 700, padding: '13px 20px',
              letterSpacing: '0.04em', textAlign: 'center',
              fontFamily: "'Exo 2', sans-serif",
              borderRadius: 8, cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: gHov ? '0 0 18px rgba(201,168,76,0.28)' : 'none',
            }}
          >
            {gHov ? '✈️ Begin Your Journey →' : 'Select Experience'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          from { transform: translateY(0) rotate(-3deg); }
          to   { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
