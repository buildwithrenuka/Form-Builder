import { useState, useEffect, useRef } from 'react';

type Props = { onEnter: () => void; onTutorial: () => void };

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#03001c',
  purple:   '#7c3aed',
  purpleL:  '#a78bfa',
  cyan:     '#00e5ff',
  cyanD:    '#06b6d4',
  magenta:  '#ff0080',
  magentaL: '#f472b6',
  gold:     '#ffd700',
  teal:     '#14b8a6',
  tealL:    '#5eead4',
  slate:    '#94a3b8',
};

// ── Temple Run worlds ─────────────────────────────────────────────────────────
const WORLDS = [
  { emoji: '🌴', name: 'Jungle',     tagline: 'Where Legends Begin',  color: '#22c55e', bg: 'rgba(5,25,8,0.95)',   glow: 'rgba(34,197,94,0.14)',   desc: 'Ancient idol stolen. Demon guardians awakened. The vines are already moving.' },
  { emoji: '❄️', name: 'Snow',       tagline: 'Frozen in Time',        color: '#67e8f9', bg: 'rgba(4,10,28,0.95)',  glow: 'rgba(103,232,249,0.12)', desc: 'Ice temples. Three centuries of patience. Now it\'s all aimed at you.' },
  { emoji: '🏜️', name: 'Desert',    tagline: 'Sands of Eternity',     color: '#fbbf24', bg: 'rgba(24,10,0,0.95)',  glow: 'rgba(251,191,36,0.14)',  desc: "Pharaoh's fury. Five thousand years of concentrated rage. You just walked into it." },
  { emoji: '🚀', name: 'Space',      tagline: 'Beyond the Stars',      color: '#00e5ff', bg: 'rgba(2,0,14,0.95)',   glow: 'rgba(0,229,255,0.12)',   desc: 'Zero gravity. Alien constructs. Earth is a dot.' },
  { emoji: '🌊', name: 'Underwater', tagline: 'Depths of Mystery',     color: '#38bdf8', bg: 'rgba(0,6,20,0.95)',   glow: 'rgba(56,189,248,0.12)',  desc: 'Twelve thousand meters down. Something massive is rising.' },
  { emoji: '🌋', name: 'Volcano',    tagline: 'Born in Fire',          color: '#f97316', bg: 'rgba(18,3,0,0.95)',   glow: 'rgba(249,115,22,0.14)',  desc: 'The mountain is alive. Furious. And it has decided you are in the way.' },
  { emoji: '☁️', name: 'Heaven',    tagline: 'Touched by Light',      color: '#c4b5fd', bg: 'rgba(8,4,28,0.95)',   glow: 'rgba(196,181,253,0.14)', desc: 'The gates opened 0.3 seconds. You barely made it.' },
  { emoji: '😈', name: 'Hell',       tagline: 'No Exit',               color: '#ef4444', bg: 'rgba(18,0,0,0.95)',   glow: 'rgba(239,68,68,0.14)',   desc: 'Wrong turn. Several, actually. The demons look genuinely happy to see you.' },
  { emoji: '🌸', name: 'Flower',     tagline: 'Bloom or Doom',         color: '#f472b6', bg: 'rgba(14,2,10,0.95)', glow: 'rgba(244,114,182,0.14)', desc: 'Paradise. Then the blooms turned. Every petal is a trap.' },
];

// ── Travel destinations ─────────────────────────────────────────────────────────
const COUNTRIES = [
  { emoji: '🇮🇳', name: 'India',     fields: 'Taj Mahal · ₹ Rupee',       color: '#f59e0b' },
  { emoji: '🇺🇸', name: 'USA',       fields: 'Statue of Liberty · $',     color: '#60a5fa' },
  { emoji: '🇬🇧', name: 'UK',        fields: 'Big Ben · £ Sterling',      color: '#818cf8' },
  { emoji: '🇩🇪', name: 'Germany',   fields: 'Brandenburg Gate · €',      color: '#6ee7b7' },
  { emoji: '🇯🇵', name: 'Japan',     fields: 'Mount Fuji · ¥ Yen',        color: '#f43f5e' },
  { emoji: '🇧🇷', name: 'Brazil',    fields: 'Amazon River · R$',          color: '#22c55e' },
  { emoji: '🇦🇪', name: 'UAE',       fields: 'Burj Khalifa · د.إ',        color: '#f59e0b' },
  { emoji: '🇦🇺', name: 'Australia', fields: 'Sydney Opera · A$',          color: '#c4b5fd' },
  { emoji: '🇨🇳', name: 'China',     fields: 'Great Wall · ¥ Yuan',        color: '#ef4444' },
  { emoji: '🇫🇷', name: 'France',    fields: 'Eiffel Tower · € Euro',      color: '#93c5fd' },
  { emoji: '🇨🇦', name: 'Canada',    fields: 'CN Tower · C$ Dollar',       color: '#fb923c' },
  { emoji: '🇿🇦', name: 'S. Africa', fields: 'Table Mountain · R Rand',    color: '#34d399' },
];

// ── Globe travel features ────────────────────────────────────────────────────────
const GLOBE_FEATURES = [
  { icon: '✈️', title: 'Travel Form Templates',  desc: 'Visa applications, customs declarations, hotel registrations — pre-built for every destination.' },
  { icon: '🏛️', title: 'Destination Cinematics', desc: 'Each country opens with a stunning visual intro — landmarks, capital city, culture, atmosphere.' },
  { icon: '💱', title: 'Currency & Locale',       desc: 'Automatic currency symbols and locale-aware number formatting per destination.' },
  { icon: '📋', title: 'Itinerary Builder',       desc: 'Pre-built form flows for trip planning, group travel, accommodation, and transportation.' },
  { icon: '🗺️', title: '12 Global Destinations', desc: 'Asia, Europe, Americas, Africa, Middle East — every region, crafted with native elegance.' },
  { icon: '🔗', title: 'Share With Your Party',  desc: 'Send forms to any traveler. One link, fills in-browser. No account required.' },
];

// ── Temple Run features ───────────────────────────────────────────────────────
const TEMPLE_FEATURES = [
  { icon: '🦊', title: '11 Avatar Runners',     desc: 'Each avatar has unique traits, quotes, and a world-entry line. Pick your legend.' },
  { icon: '🚪', title: 'Cinematic World Doors', desc: 'Massive themed doors swing open with a dramatic transition into your chosen world.' },
  { icon: '🔊', title: 'Ambient Soundscapes',   desc: 'Jungle chirps, space drones, volcanic rumbles — synthesised audio per world.' },
  { icon: '🗺️', title: 'Mission Map',          desc: 'Pick your form\'s purpose on an interactive map. Fields scaffold automatically.' },
  { icon: '🕐', title: 'Version History',        desc: 'Name snapshots, publish versions, restore any point in one click.' },
  { icon: '📦', title: 'Import / Export',        desc: 'Save your form as .trform.json or import any template instantly.' },
];

const STARS = Array.from({ length: 5 }, (_, i) => ({
  top: `${10 + i * 16}%`, left: `${-12 - i * 6}%`,
  delay: `${i * 2.4}s`, dur: `${3.8 + i * 0.6}s`, width: `${90 + i * 28}px`,
}));

export function HomePage({ onEnter, onTutorial }: Props) {
  const [heroVisible,   setHeroVisible]   = useState(false);
  const [glitching,     setGlitching]     = useState(false);
  const [runnerX,       setRunnerX]       = useState(-140);
  const [tick,          setTick]          = useState(0);
  const [hovWorld,      setHovWorld]      = useState<number | null>(null);
  const [hovCountry,    setHovCountry]    = useState<number | null>(null);
  const [hovTFeat,      setHovTFeat]      = useState<number | null>(null);
  const [hovGFeat,      setHovGFeat]      = useState<number | null>(null);
  const [statsVisible,  setStatsVisible]  = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 600);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRunnerX(x => (x > window.innerWidth + 160 ? -160 : x + 5));
      setTick(t => t + 1);
    }, 38);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', overflowX: 'hidden' }}>

      {/* ── Aurora background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 180% 100% at 50% -20%, #1a0040 0%, #0a0025 35%, ${C.bg} 70%)` }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)' }} />
        <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '55vw', height: '55vw', background: `radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)`, filter: 'blur(80px)', animation: 'aurora-shift 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-8%', width: '45vw', height: '45vw', background: `radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 65%)`, filter: 'blur(80px)', animation: 'aurora-shift 13s ease-in-out infinite 2s' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '25%', width: '50vw', height: '28vw', background: `radial-gradient(ellipse, rgba(20,184,166,0.05) 0%, transparent 65%)`, filter: 'blur(70px)', animation: 'aurora-shift 18s ease-in-out infinite 6s' }} />
        {STARS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: s.top, left: s.left, width: s.width, height: '1.5px', background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? C.cyan : C.purpleL}, transparent)`, opacity: 0.5, animation: `shooting-star ${s.dur} linear ${s.delay} infinite`, borderRadius: '2px' }} />
        ))}
      </div>

      {/* ── Runner bar ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '48px', background: 'rgba(3,0,28,0.94)', borderTop: `1px solid rgba(124,58,237,0.18)`, zIndex: 50, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: runnerX, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '24px', filter: `drop-shadow(0 0 12px ${C.cyan})` }}>
          🏃{tick % 2 === 0 ? '💨' : '\u00a0\u00a0'}
        </div>
        {[0.1, 0.25, 0.44, 0.62, 0.79].map((frac, i) => (
          <div key={i} style={{ position: 'absolute', left: `${frac * 100}%`, fontSize: '12px', opacity: 0.25, animation: `bounce ${0.9 + i * 0.14}s ease-in-out infinite ${i * 0.2}s`, color: C.cyan }}>✦</div>
        ))}
        <div style={{ position: 'absolute', right: '14px', display: 'flex', gap: '8px' }}>
          {['🌴','🚀','🌊','🌋','😈','🌸'].map((e, i) => (
            <span key={i} style={{ fontSize: '14px', opacity: 0.22, animation: `bounce ${1 + i * 0.2}s ease-in-out infinite` }}>{e}</span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(3,0,20,0.94)', backdropFilter: 'blur(28px)', borderBottom: `1px solid rgba(124,58,237,0.12)`, padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px', animation: 'neon-flicker 8s ease-in-out infinite' }}>🏛️</span>
          <div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '14px', fontWeight: 900, background: `linear-gradient(135deg, ${C.purple}, ${C.cyan}, ${C.magenta})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.06em' }}>Form Quest</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: 'rgba(167,139,250,0.35)', letterSpacing: '0.22em' }}>CINEMATIC FORM BUILDER</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[['#temple', '⚡ TEMPLE RUN'], ['#globe', '🌍 GLOBE'], ['#how', '🗺️ HOW IT WORKS']].map(([href, label]) => (
            <a key={label} href={href} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(167,139,250,0.5)', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 10px', borderRadius: '6px', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.cyan; e.currentTarget.style.background = 'rgba(0,229,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(167,139,250,0.5)'; e.currentTarget.style.background = 'transparent'; }}
            >{label}</a>
          ))}
          <div style={{ width: '1px', height: '24px', background: 'rgba(124,58,237,0.2)', margin: '0 6px' }} />
          <button onClick={onTutorial} style={{ background: 'transparent', border: `1px solid rgba(124,58,237,0.25)`, borderRadius: '7px', color: `rgba(167,139,250,0.65)`, fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '7px 14px', cursor: 'pointer', letterSpacing: '0.12em', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.purpleL; e.currentTarget.style.borderColor = `rgba(124,58,237,0.6)`; e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(167,139,250,0.65)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
            🧭 HOW TO PLAY
          </button>
          <button onClick={onEnter} className="tr-btn" style={{ background: `linear-gradient(135deg, #3b0764, #7c3aed, #00e5ff)`, color: '#fff', fontSize: '11px', padding: '9px 20px', letterSpacing: '0.12em', boxShadow: `0 0 20px rgba(124,58,237,0.5)`, marginLeft: '6px' }}>
            🚀 EXPLORE
          </button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.15s' }}>
          <div style={{ width: '44px', height: '1px', background: `linear-gradient(90deg, transparent, ${C.cyan})` }} />
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.38em', textTransform: 'uppercase', background: `linear-gradient(90deg, ${C.cyan}, ${C.purpleL}, ${C.magentaL})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ TWO EXPERIENCES · ONE FORM BUILDER ✦</span>
          <div style={{ width: '44px', height: '1px', background: `linear-gradient(90deg, ${C.magenta}, transparent)` }} />
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(42px, 10vw, 108px)', fontWeight: 900, lineHeight: 1.05, marginBottom: '16px', background: `linear-gradient(135deg, ${C.purple} 0%, ${C.cyan} 40%, ${C.magenta} 70%, ${C.purpleL} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.04em', opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.2s', animation: glitching ? 'glitch 0.6s steps(1) forwards' : 'none', cursor: 'default' }}
          onMouseEnter={() => { setGlitching(true); setTimeout(() => setGlitching(false), 600); }}>
          Form Quest
        </h1>

        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(15px, 2.2vw, 20px)', color: 'rgba(200,185,255,0.6)', maxWidth: '640px', lineHeight: 1.75, marginBottom: '36px', letterSpacing: '0.02em', opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
          A cinematic form builder with two radically different experiences.<br />
          <strong style={{ color: C.gold }}>Temple Run</strong> — gamified worlds, avatars & epic adventure.<br />
          <strong style={{ color: '#c9a84c' }}>Globe Explorer</strong> — classy travel forms for every destination on Earth.
        </p>

        {/* Dual experience CTAs */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '28px', opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.45s' }}>
          {/* Temple Run CTA — game style */}
          <button onClick={onEnter} className="tr-btn" style={{ background: `linear-gradient(135deg, #5c1a00, #b84500, ${C.gold})`, color: '#1a0800', fontSize: '13px', fontWeight: 900, padding: '16px 34px', letterSpacing: '0.14em', boxShadow: `0 0 32px rgba(255,215,0,0.3), 0 6px 24px rgba(0,0,0,0.5)` }}>
            🏃 TEMPLE RUN EXPERIENCE
          </button>
          {/* Globe CTA — classy travel */}
          <button onClick={onEnter}
            style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2e2010 55%, #c9a84c 100%)', color: '#1a0e00', fontSize: '14px', fontWeight: 700, padding: '16px 34px', letterSpacing: '0.05em', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 0 28px rgba(201,168,76,0.28), 0 6px 24px rgba(0,0,0,0.5)', fontFamily: "'Exo 2', sans-serif", transition: 'filter 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            ✈️ Globe Explorer
          </button>
        </div>

        {/* Scroll indicator */}
        <a href="#temple" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textDecoration: 'none', opacity: heroVisible ? 0.35 : 0, transition: 'opacity 0.8s ease 0.9s', animation: 'float-slow 3s ease-in-out infinite' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: C.purpleL, letterSpacing: '0.24em' }}>DISCOVER BOTH EXPERIENCES</span>
          <span style={{ color: C.purpleL, fontSize: '18px' }}>↓</span>
        </a>
      </section>

      {/* ══════════ EXPERIENCE 01 — TEMPLE RUN ══════════ */}
      <section id="temple" style={{ padding: '80px 20px 72px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 70% at 50% 50%, rgba(200,80,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '44px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '20px', padding: '4px 14px', marginBottom: '14px' }}>
                <span>🎮</span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: C.gold, textTransform: 'uppercase' }}>Experience 01 — Gamified Adventure</span>
              </div>
              <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, color: '#fff', marginBottom: '10px', lineHeight: 1.1 }}>Temple Run</h2>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', color: 'rgba(200,185,255,0.5)', lineHeight: 1.7, maxWidth: '520px' }}>
                Choose your runner. Open a cinematic world door. Pick your mission on an interactive map — then forge your form inside a legendary themed world with ambient audio and story cinematics.
              </p>
            </div>
            <button onClick={onEnter} className="tr-btn" style={{ background: `linear-gradient(135deg, #6b2e00, #c45800, ${C.gold})`, color: '#1a0800', fontSize: '12px', padding: '13px 26px', letterSpacing: '0.14em', whiteSpace: 'nowrap', boxShadow: `0 0 20px rgba(255,215,0,0.28)`, alignSelf: 'center' }}>
              🏃 ENTER TEMPLE RUN
            </button>
          </div>

          {/* Worlds preview — small chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '8px', marginBottom: '40px' }}>
            {WORLDS.map((w, i) => {
              const isH = hovWorld === i;
              return (
                <div key={w.name} onMouseEnter={() => setHovWorld(i)} onMouseLeave={() => setHovWorld(null)}
                  style={{ background: isH ? `${w.color}18` : 'rgba(255,255,255,0.02)', border: `1px solid ${isH ? w.color + '55' : 'rgba(124,58,237,0.1)'}`, borderRadius: '12px', padding: '14px 8px', textAlign: 'center', cursor: 'default', transition: 'all 0.22s', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? `0 8px 20px rgba(0,0,0,0.4), 0 0 16px ${w.color}20` : 'none', animation: `card-enter 0.4s ease-out ${i * 0.045}s both` }}>
                  <div style={{ fontSize: '26px', marginBottom: '5px', filter: isH ? `drop-shadow(0 0 10px ${w.color}aa)` : 'none', transition: 'filter 0.22s' }}>{w.emoji}</div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, color: isH ? w.color : 'rgba(200,185,255,0.4)', letterSpacing: '0.06em', transition: 'color 0.22s' }}>{w.name}</div>
                  {isH && <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', lineHeight: 1.4 }}>{w.desc}</div>}
                </div>
              );
            })}
          </div>

          {/* Temple features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {TEMPLE_FEATURES.map((f, i) => {
              const isH = hovTFeat === i;
              const accent = [C.gold, C.magenta, C.purpleL, C.cyan, C.gold, C.magentaL][i];
              return (
                <div key={i} onMouseEnter={() => setHovTFeat(i)} onMouseLeave={() => setHovTFeat(null)}
                  style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: isH ? `${accent}08` : 'rgba(255,255,255,0.015)', border: `1px solid ${isH ? accent + '35' : 'rgba(124,58,237,0.08)'}`, borderRadius: '13px', padding: '16px 14px', transition: 'all 0.22s', animation: `card-enter 0.4s ease-out ${i * 0.06}s both` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${accent}12`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', fontWeight: 700, color: isH ? accent : 'rgba(200,185,255,0.8)', marginBottom: '4px', transition: 'color 0.22s' }}>{f.title}</div>
                    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: 'rgba(167,139,250,0.38)', lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ DIVIDER ══════════ */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), rgba(201,168,76,0.2), rgba(124,58,237,0.18), transparent)' }} />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
          <span style={{ fontSize: '16px' }}>🏃</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(167,139,250,0.4)', letterSpacing: '0.2em' }}>vs</span>
          <span style={{ fontSize: '16px' }}>✈️</span>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), rgba(201,168,76,0.2), rgba(124,58,237,0.18), transparent)' }} />
      </div>

      {/* ══════════ EXPERIENCE 02 — GLOBE EXPLORER ══════════ */}
      <section id="globe" style={{ padding: '72px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 70% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '44px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '20px', padding: '4px 14px', marginBottom: '14px' }}>
                <span>✈️</span>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#c9a84c', textTransform: 'uppercase' }}>Experience 02 — Travel & Exploration</span>
              </div>
              {/* Globe title — clean, elegant, travel-focused */}
              <h2 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: '#fff', marginBottom: '10px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Globe Explorer</h2>
              <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '15px', color: 'rgba(230,215,185,0.55)', lineHeight: 1.75, maxWidth: '540px' }}>
                Choose a destination. Build elegant forms for your journey — visa applications, customs declarations, travel itineraries, hotel registrations. Every country comes alive with landmark cinematics, local currency, and a classy travel aesthetic.
              </p>
            </div>
            <button onClick={onEnter}
              style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2e2010 55%, #c9a84c 100%)', color: '#1a0e00', fontSize: '13px', fontWeight: 700, padding: '13px 26px', letterSpacing: '0.06em', border: '1px solid rgba(201,168,76,0.5)', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 0 20px rgba(201,168,76,0.22)', whiteSpace: 'nowrap', alignSelf: 'center', fontFamily: "'Exo 2', sans-serif", transition: 'filter 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              ✈️ Begin Your Journey →
            </button>
          </div>

          {/* Countries — clean professional cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '40px' }}>
            {COUNTRIES.map((co, i) => {
              const isH = hovCountry === i;
              return (
                <div key={co.name} onMouseEnter={() => setHovCountry(i)} onMouseLeave={() => setHovCountry(null)}
                  style={{ background: isH ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isH ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '13px 13px', cursor: 'default', transition: 'all 0.2s', transform: isH ? 'translateY(-3px)' : 'none', boxShadow: isH ? '0 6px 20px rgba(0,0,0,0.3)' : 'none', animation: `card-enter 0.4s ease-out ${i * 0.04}s both` }}>
                  <div style={{ fontSize: '22px', marginBottom: '5px' }}>{co.emoji}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '12px', fontWeight: 700, color: isH ? '#fff' : 'rgba(220,230,255,0.7)', marginBottom: '3px', transition: 'color 0.2s' }}>{co.name}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: isH ? co.color : 'rgba(148,163,184,0.45)', letterSpacing: '0.03em', lineHeight: 1.4, transition: 'color 0.2s' }}>{co.fields}</div>
                </div>
              );
            })}
          </div>

          {/* Globe features — travel themed, warm gold palette */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {GLOBE_FEATURES.map((f, i) => {
              const isH = hovGFeat === i;
              return (
                <div key={i} onMouseEnter={() => setHovGFeat(i)} onMouseLeave={() => setHovGFeat(null)}
                  style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: isH ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isH ? 'rgba(201,168,76,0.28)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '16px 14px', transition: 'all 0.2s', animation: `card-enter 0.4s ease-out ${i * 0.06}s both` }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: isH ? 'rgba(201,168,76,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isH ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'all 0.2s' }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '13px', fontWeight: 700, color: isH ? '#e8c97a' : 'rgba(240,230,205,0.82)', marginBottom: '4px', transition: 'color 0.2s' }}>{f.title}</div>
                    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: 'rgba(200,185,155,0.52)', lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <div ref={statsRef} style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.4)', borderTop: `1px solid rgba(124,58,237,0.08)`, borderBottom: `1px solid rgba(124,58,237,0.08)`, padding: '44px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '24px', textAlign: 'center' }}>
          {[
            { label: 'Field Types',     value: '17',    icon: '⚡', color: C.cyan },
            { label: 'Adventure Worlds',value: '9',     icon: '🌴', color: C.gold },
            { label: 'Destinations',    value: '12',    icon: '✈️', color: '#c9a84c' },
            { label: 'Avatar Runners',  value: '11',    icon: '🦊', color: C.magentaL },
            { label: 'Forms Built',     value: '2847+', icon: '📋', color: C.purpleL },
          ].map((s, i) => (
            <div key={i} style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(200,185,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how" style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, color: C.cyan, letterSpacing: '0.3em', marginBottom: '10px' }}>🗺️ THE FLOW</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, color: C.purpleL }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🎮', color: C.magenta,  title: 'Choose an Experience',  desc: 'Temple Run for a gamified adventure, or Globe Explorer for a classy travel form experience.' },
              { icon: '🔑', color: C.gold,     title: 'Login or Register',     desc: 'Create an account or continue as a guest. Your forms are saved to your profile.' },
              { icon: '🌍', color: C.cyan,     title: 'Pick Your Arena',       desc: 'Select from 9 adventure worlds, or explore 12 travel destinations on the globe.' },
              { icon: '🗺️', color: '#34d399', title: 'Map Your Purpose',      desc: 'Use the mission map to pick a form type. Fields are scaffolded for you automatically.' },
              { icon: '🔨', color: C.purpleL,  title: 'Build Your Form',       desc: '17 field types, smart validation, locale presets, section dividers, half-width grids.' },
              { icon: '🔗', color: C.cyanD,    title: 'Share the Link',        desc: 'One public or unlisted link. Anyone fills the form in-browser. Version history included.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.015)', border: `1px solid rgba(124,58,237,0.08)`, borderRadius: '15px', padding: '20px 18px', animation: `card-enter 0.4s ease-out ${i * 0.08}s both`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.45), 0 0 18px ${s.color}14`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'absolute', top: '4px', right: '12px', fontFamily: "'Cinzel Decorative', serif", fontSize: '48px', fontWeight: 900, color: `${s.color}06`, lineHeight: 1, userSelect: 'none' }}>{i + 1}</div>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${s.color}10`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', fontWeight: 700, color: s.color, marginBottom: '5px', letterSpacing: '0.04em' }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: 'rgba(200,185,255,0.42)', lineHeight: 1.6, letterSpacing: '0.02em' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ padding: '28px 32px 68px', background: 'rgba(0,0,0,0.88)', borderTop: `1px solid rgba(124,58,237,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🏛️</span>
          <div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', fontWeight: 700, background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Form Quest</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: 'rgba(167,139,250,0.22)', letterSpacing: '0.2em' }}>9 WORLDS · 12 COUNTRIES · INFINITE FORMS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {WORLDS.map((w, i) => <span key={i} style={{ fontSize: '14px', opacity: 0.15 }}>{w.emoji}</span>)}
          <span style={{ fontSize: '12px', opacity: 0.2, margin: '0 6px' }}>·</span>
          {COUNTRIES.slice(0, 6).map((c, i) => <span key={i} style={{ fontSize: '14px', opacity: 0.15 }}>{c.emoji}</span>)}
        </div>
        <button onClick={onEnter} className="tr-btn" style={{ background: `linear-gradient(135deg, #3b0764, ${C.cyan})`, color: '#fff', fontSize: '10px', padding: '8px 18px', letterSpacing: '0.12em' }}>
          🚀 EXPLORE NOW
        </button>
      </footer>

    </div>
  );
}
