import { useState, useEffect } from 'react';
import type { HomeTheme } from './HomePage';
import { PremiumIcon } from './PremiumIcon';

type Props = {
  onSelectTempleRun: () => void;
  onSelectGlobe:     () => void;
  onSelectLibrary:   () => void;
  onLogout:          () => void;
  onDashboard?:      () => void;
  onAdmin?:          () => void;
  theme?:            HomeTheme;
};

const SURFACES: Record<HomeTheme, {
  bg: string;
  particle: string;
  backBg: string;
  backBorder: string;
  backColor: string;
  heading: string;
  subheading: string;
  dashboardBg: string;
  dashboardBorder: string;
  dashboardColor: string;
  cardIdle: string;
  cardBorder: string;
}> = {
  dark: {
    bg: 'radial-gradient(ellipse at 50% 20%, #0a0020 0%, #03001c 50%, #000 100%)',
    particle: '0.05',
    backBg: 'rgba(255,255,255,0.07)',
    backBorder: 'rgba(255,255,255,0.12)',
    backColor: '#fff',
    heading: '#fff',
    subheading: 'rgba(255,255,255,0.35)',
    dashboardBg: 'rgba(34,197,94,0.12)',
    dashboardBorder: 'rgba(34,197,94,0.35)',
    dashboardColor: '#4ade80',
    cardIdle: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg: 'radial-gradient(ellipse at 50% 20%, #fff7d6 0%, #fff8ef 45%, #ffe9c7 100%)',
    particle: '0.09',
    backBg: 'rgba(17,17,17,0.05)',
    backBorder: 'rgba(17,17,17,0.12)',
    backColor: '#111111',
    heading: '#111111',
    subheading: 'rgba(17,17,17,0.52)',
    dashboardBg: 'rgba(17,17,17,0.06)',
    dashboardBorder: 'rgba(17,17,17,0.16)',
    dashboardColor: '#111111',
    cardIdle: 'rgba(255,255,255,0.58)',
    cardBorder: 'rgba(17,17,17,0.1)',
  },
  rainbow: {
    bg: 'radial-gradient(ellipse at 50% 20%, #28003b 0%, #091a46 35%, #27114b 68%, #160016 100%)',
    particle: '0.08',
    backBg: 'linear-gradient(135deg, rgba(255,79,216,0.14), rgba(124,58,237,0.14), rgba(0,229,255,0.12))',
    backBorder: 'rgba(255,255,255,0.2)',
    backColor: '#fff8ff',
    heading: '#fff8ff',
    subheading: 'rgba(231,220,255,0.68)',
    dashboardBg: 'linear-gradient(135deg, rgba(255,79,216,0.16), rgba(0,229,255,0.12), rgba(156,255,0,0.1))',
    dashboardBorder: 'rgba(255,79,216,0.34)',
    dashboardColor: '#ffd9f7',
    cardIdle: 'linear-gradient(135deg, rgba(255,79,216,0.08), rgba(124,58,237,0.08), rgba(0,229,255,0.08))',
    cardBorder: 'rgba(255,255,255,0.14)',
  },
  firecracker: {
    bg: 'radial-gradient(ellipse at 50% 20%, #2a0500 0%, #120100 46%, #000 100%)',
    particle: '0.07',
    backBg: 'rgba(255,120,0,0.08)',
    backBorder: 'rgba(255,140,0,0.16)',
    backColor: '#fff3dd',
    heading: '#fff6ea',
    subheading: 'rgba(255,210,170,0.56)',
    dashboardBg: 'rgba(255,120,0,0.12)',
    dashboardBorder: 'rgba(255,140,0,0.26)',
    dashboardColor: '#ffd08f',
    cardIdle: 'rgba(255,255,255,0.035)',
    cardBorder: 'rgba(255,255,255,0.08)',
  },
  jugnu: {
    bg: 'radial-gradient(ellipse at 50% 20%, #0e1500 0%, #060b00 48%, #010300 100%)',
    particle: '0.06',
    backBg: 'rgba(255,214,92,0.08)',
    backBorder: 'rgba(255,214,92,0.18)',
    backColor: '#fff3bf',
    heading: '#fff7d6',
    subheading: 'rgba(255,235,178,0.58)',
    dashboardBg: 'rgba(255,214,92,0.1)',
    dashboardBorder: 'rgba(255,214,92,0.22)',
    dashboardColor: '#ffe98e',
    cardIdle: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
  },
};

export function ExperienceSelector({ onSelectTempleRun, onSelectGlobe, onSelectLibrary, onLogout, onDashboard, onAdmin, theme = 'dark' }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const T = SURFACES[theme];
  const isLight = theme === 'light';
  const isRainbow = theme === 'rainbow';
  const isFirecracker = theme === 'firecracker';
  const isJugnu = theme === 'jugnu';

  useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  const tHov = hovered === 'temple';
  const gHov = hovered === 'globe';
  const lHov = hovered === 'library';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.5s',
    }}>
      {isRainbow && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 20%, rgba(255,79,216,0.16), transparent 34%), radial-gradient(circle at 78% 18%, rgba(0,229,255,0.16), transparent 32%), radial-gradient(circle at 55% 78%, rgba(156,255,0,0.12), transparent 30%), radial-gradient(circle at 34% 68%, rgba(255,230,0,0.12), transparent 28%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        </>
      )}
      {isFirecracker && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 18%, rgba(255,90,0,0.18), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255,184,0,0.14), transparent 30%), radial-gradient(circle at 58% 72%, rgba(255,50,0,0.12), transparent 28%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,110,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,0.03) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        </>
      )}
      {isJugnu && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 20%, rgba(255,214,92,0.16), transparent 32%), radial-gradient(circle at 78% 18%, rgba(207,255,140,0.12), transparent 30%), radial-gradient(circle at 52% 74%, rgba(255,240,150,0.12), transparent 26%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,214,92,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(207,255,140,0.02) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        </>
      )}

      {/* Background ambient particles */}
      {['🏃','🌍','💰','✈️','🔥','🗺️','�','🌎','⚡','🪄','📜','🚀'].map((p, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: 20 + (i % 3) * 8, left: `${(i * 11.3) % 92}%`, top: `${(i * 8.7) % 88}%`, opacity: T.particle, animation: `drift ${6 + (i % 5)}s ease-in-out infinite alternate`, animationDelay: `${i * 0.4}s`, userSelect: 'none', pointerEvents: 'none' }}>{p}</div>
      ))}

      {/* Back + header */}
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", color: T.heading, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', background: isRainbow ? 'linear-gradient(135deg, #fff 0%, #ff8ae2 24%, #00e5ff 54%, #c3ff66 78%, #ffe95e 100%)' : isFirecracker ? 'linear-gradient(135deg, #fff6ea 0%, #ffb36b 24%, #ff7a00 60%, #ffe066 100%)' : isJugnu ? 'linear-gradient(135deg, #fff7d6 0%, #ffe98e 26%, #ffd65c 58%, #cfff8c 100%)' : undefined, WebkitBackgroundClip: isRainbow || isFirecracker || isJugnu ? 'text' : undefined, WebkitTextFillColor: isRainbow || isFirecracker || isJugnu ? 'transparent' : undefined, backgroundClip: isRainbow || isFirecracker || isJugnu ? 'text' : undefined }}>Choose Your Experience</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", color: T.subheading, fontSize: 12, marginTop: 2, letterSpacing: '0.1em' }}>Three worlds. One form builder.</div>
        </div>
        {onDashboard && (
          <button onClick={onDashboard} style={{ background: T.dashboardBg, border: `1px solid ${T.dashboardBorder}`, color: T.dashboardColor, borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = `0 0 16px ${T.dashboardBorder}`; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PremiumIcon token="📊" size={14} />Dashboard</span>
          </button>
        )}
        {onAdmin && (
          <button onClick={onAdmin} style={{ background: T.backBg, border: `1px solid ${T.backBorder}`, color: T.backColor, borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PremiumIcon token="🛠" size={14} />Admin</span>
          </button>
        )}
        <button onClick={onLogout} style={{ background: T.backBg, border: `1px solid ${T.backBorder}`, color: T.backColor, borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'system-ui, sans-serif', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
          Sign Out
        </button>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 680 }}>

          {/* ── REALM RUNNER ── */}
          <div
            onClick={onSelectTempleRun}
            onMouseEnter={() => setHovered('temple')}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: tHov ? (isLight ? 'radial-gradient(ellipse at 30% 50%, #ffe7bf 0%, #fff7eb 60%, #fffdf8 100%)' : isRainbow ? 'linear-gradient(135deg, rgba(255,140,0,0.18), rgba(255,79,216,0.12), rgba(124,58,237,0.14))' : isFirecracker ? 'linear-gradient(135deg, rgba(255,90,0,0.2), rgba(255,184,0,0.12), rgba(120,10,0,0.2))' : isJugnu ? 'linear-gradient(135deg, rgba(255,214,92,0.14), rgba(255,240,150,0.1), rgba(207,255,140,0.08))' : 'radial-gradient(ellipse at 30% 50%, #3a1000 0%, #1c0700 60%, #0a0000 100%)') : T.cardIdle,
              border: `1px solid ${tHov ? 'rgba(255,140,0,0.55)' : T.cardBorder}`,
              borderRadius: 16, padding: '20px 24px', cursor: 'pointer', width: '100%',
              boxShadow: tHov ? '0 0 32px rgba(255,140,0,0.2)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              transform: tHov ? 'translateX(4px)' : 'translateX(0)',
              display: 'flex', alignItems: 'center', gap: 20,
            }}
          >
            <div style={{ fontSize: 44, lineHeight: 1, filter: tHov ? 'drop-shadow(0 0 16px rgba(255,140,0,0.8))' : 'none', transition: 'filter 0.25s', flexShrink: 0 }}>🏃</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: isLight ? '#111111' : isJugnu ? '#fff7d6' : '#fff', fontSize: 18, fontWeight: 900, margin: 0, lineHeight: 1, textShadow: isRainbow ? '0 0 12px rgba(255,79,216,0.16)' : isFirecracker ? '0 0 12px rgba(255,122,0,0.16)' : isJugnu ? '0 0 10px rgba(255,214,92,0.12)' : 'none' }}>Realm Runner</h3>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", color: '#ffd700', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase' }}>Gamified</span>
              </div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", color: isLight ? 'rgba(17,17,17,0.62)' : isFirecracker ? 'rgba(255,225,190,0.62)' : isJugnu ? 'rgba(255,238,190,0.62)' : 'rgba(255,240,200,0.55)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                Choose your runner, pick a world, build forms inside cinematic jungle temples, frozen ruins &amp; volcanic hellscapes.
              </p>
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", color: tHov ? '#ffd700' : 'rgba(255,140,0,0.4)', fontSize: 20, flexShrink: 0, transition: 'color 0.25s' }}>→</div>
          </div>

          {/* ── GLOBE EXPLORER ── */}
          <div
            onClick={onSelectGlobe}
            onMouseEnter={() => setHovered('globe')}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: gHov ? (isLight ? 'radial-gradient(ellipse at 30% 50%, #fff3d6 0%, #fffaf0 60%, #fffdf8 100%)' : isRainbow ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,58,237,0.14), rgba(255,230,0,0.12))' : isFirecracker ? 'linear-gradient(135deg, rgba(255,184,0,0.16), rgba(255,90,0,0.12), rgba(80,16,0,0.18))' : isJugnu ? 'linear-gradient(135deg, rgba(255,240,150,0.12), rgba(255,214,92,0.12), rgba(207,255,140,0.08))' : 'radial-gradient(ellipse at 30% 50%, #1c1408 0%, #0e0e18 60%, #03001c 100%)') : T.cardIdle,
              border: `1px solid ${gHov ? 'rgba(201,168,76,0.52)' : T.cardBorder}`,
              borderRadius: 16, padding: '20px 24px', cursor: 'pointer', width: '100%',
              boxShadow: gHov ? '0 0 32px rgba(201,168,76,0.18)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              transform: gHov ? 'translateX(4px)' : 'translateX(0)',
              display: 'flex', alignItems: 'center', gap: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: gHov ? 'linear-gradient(90deg, transparent, #c9a84c, transparent)' : 'transparent', transition: 'all 0.25s' }} />
            <div style={{ fontSize: 44, lineHeight: 1, filter: gHov ? 'drop-shadow(0 0 14px rgba(201,168,76,0.6))' : 'none', transition: 'filter 0.25s', flexShrink: 0 }}>✈️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontFamily: "'Exo 2', sans-serif", color: isLight ? '#111111' : isJugnu ? '#fff7d6' : '#fff', fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1, textShadow: isRainbow ? '0 0 12px rgba(0,229,255,0.18)' : isFirecracker ? '0 0 12px rgba(255,184,0,0.16)' : isJugnu ? '0 0 10px rgba(255,214,92,0.12)' : 'none' }}>Globe Explorer</h3>
                <span style={{ fontFamily: "'Exo 2', sans-serif", color: '#c9a84c', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase' }}>Travel</span>
              </div>
              <p style={{ fontFamily: "'Exo 2', sans-serif", color: isLight ? 'rgba(17,17,17,0.62)' : isFirecracker ? 'rgba(255,225,190,0.62)' : isJugnu ? 'rgba(255,238,190,0.62)' : 'rgba(235,220,185,0.52)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                Pick a country, build visa &amp; travel forms with locale-specific templates and landmark cinematics.
              </p>
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", color: gHov ? '#c9a84c' : 'rgba(201,168,76,0.35)', fontSize: 20, flexShrink: 0, transition: 'color 0.25s' }}>→</div>
          </div>

          {/* ── THE LIBRARY ── */}
          <div
            onClick={onSelectLibrary}
            onMouseEnter={() => setHovered('library')}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: lHov ? (isLight ? 'radial-gradient(ellipse at 30% 50%, #f5e8ff 0%, #fff8ff 60%, #fffdf8 100%)' : isRainbow ? 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(255,79,216,0.14), rgba(0,229,255,0.1))' : isFirecracker ? 'linear-gradient(135deg, rgba(255,90,0,0.14), rgba(168,85,247,0.12), rgba(255,184,0,0.08))' : isJugnu ? 'linear-gradient(135deg, rgba(255,214,92,0.12), rgba(168,210,120,0.08), rgba(255,240,150,0.08))' : 'radial-gradient(ellipse at 30% 50%, #1e0030 0%, #0d0018 60%, #000 100%)') : T.cardIdle,
              border: `1px solid ${lHov ? 'rgba(168,85,247,0.55)' : T.cardBorder}`,
              borderRadius: 16, padding: '20px 24px', cursor: 'pointer', width: '100%',
              boxShadow: lHov ? '0 0 32px rgba(147,51,234,0.2)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              transform: lHov ? 'translateX(4px)' : 'translateX(0)',
              display: 'flex', alignItems: 'center', gap: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: lHov ? 'linear-gradient(90deg, transparent, #a855f7, transparent)' : 'transparent', transition: 'all 0.25s' }} />
            <div style={{ fontSize: 44, lineHeight: 1, filter: lHov ? 'drop-shadow(0 0 14px rgba(168,85,247,0.7))' : 'none', transition: 'filter 0.25s', flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontFamily: "'Georgia', serif", color: isLight ? '#111111' : isJugnu ? '#fff7d6' : '#fff', fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1, textShadow: isRainbow ? '0 0 12px rgba(168,85,247,0.2)' : isFirecracker ? '0 0 12px rgba(255,122,0,0.12)' : isJugnu ? '0 0 10px rgba(255,214,92,0.12)' : 'none' }}>The Library</h3>
                <span style={{ fontFamily: "'Exo 2', sans-serif", color: '#a855f7', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.22)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase' }}>Knowledge</span>
              </div>
              <p style={{ fontFamily: "'Exo 2', sans-serif", color: isLight ? 'rgba(17,17,17,0.62)' : isFirecracker ? 'rgba(255,225,190,0.62)' : isJugnu ? 'rgba(255,238,190,0.62)' : 'rgba(220,200,255,0.5)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                Mythology, History, Sci-Fi, Fictional — build forms inside four realms of human imagination.
              </p>
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", color: lHov ? '#a855f7' : 'rgba(168,85,247,0.35)', fontSize: 20, flexShrink: 0, transition: 'color 0.25s' }}>→</div>
          </div>

        </div>
      </div>  {/* end cards grid */}

      <style>{`
        @keyframes drift {
          from { transform: translateY(0) rotate(-3deg); }
          to   { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
