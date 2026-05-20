import { useState, FormEvent } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { login, register, loginAsGuest } from '../auth';

type Props = {
  onLogin: (name: string) => void;
  theme?: 'temple-run' | 'globe';
};

const JUNGLE_PARTICLES = ['🌿', '🍃', '🦋', '🌺', '🐦', '✨', '🪙', '🗿'];
const GLOBE_PARTICLES  = ['🌍', '🌎', '🌏', '✈️', '🗺️', '⭐', '🔭', '💫', '🌐', '🛸'];

function Torch({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      style={{
        position: 'absolute',
        [side]: 'clamp(20px, 5vw, 80px)',
        top: '28%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 4,
        animation: 'float-slow 5s ease-in-out infinite',
        pointerEvents: 'none',
      }}
    >
      {/* Flame */}
      <div
        style={{
          fontSize: '38px',
          animation: 'torch-flicker 0.65s ease-in-out infinite',
          filter: 'drop-shadow(0 0 14px #ff6b00) drop-shadow(0 0 28px #ff440066)',
          transformOrigin: 'bottom center',
        }}
      >
        🔥
      </div>
      {/* Bowl */}
      <div
        style={{
          width: '28px',
          height: '14px',
          background: 'linear-gradient(180deg, #5c3200, #2a1400)',
          borderRadius: '0 0 8px 8px',
          border: '1px solid #8b5200',
        }}
      />
      {/* Pole */}
      <div
        style={{
          width: '9px',
          height: '80px',
          background: 'linear-gradient(180deg, #3a1800, #5c3000, #2a1200)',
          borderRadius: '2px',
          boxShadow: '2px 0 6px rgba(0,0,0,0.6)',
        }}
      />
      {/* Base */}
      <div
        style={{
          width: '24px',
          height: '10px',
          background: 'linear-gradient(0deg, #1a0a00, #3a1800)',
          borderRadius: '3px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
        }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          animation: 'scan-line 8s linear infinite',
        }}
      />
    </div>
  );
}

export function LoginScreen({ onLogin, theme = 'temple-run' }: Props) {
  const isGlobe = theme === 'globe';

  // ── Theme tokens ──────────────────────────────────────────────────────
  const T = isGlobe ? {
    bg:            'linear-gradient(160deg, #000d1a 0%, #001428 35%, #001e3c 65%, #000d1a 100%)',
    particles:     GLOBE_PARTICLES,
    cardBg:        'rgba(0, 6, 20, 0.95)',
    cardBorder:    'rgba(0, 120, 220, 0.6)',
    activeBg:      'rgba(0, 18, 50, 0.95)',
    activeBorder:  '#00e5ff',
    inactiveBorder:'rgba(0, 80, 160, 0.4)',
    inputColor:    '#e0f0ff',
    logoGradient:  'linear-gradient(135deg, #0070cc 0%, #00aaff 30%, #00e5ff 55%, #80f0ff 70%, #00e5ff 85%, #0090dd 100%)',
    subtitleColor: '#4db8ff',
    tabActive:     'linear-gradient(135deg, #001850, #0050aa)',
    tabActiveColor:'#00e5ff',
    submitBtn:     'linear-gradient(135deg, #001850 0%, #0060cc 40%, #00e5ff 100%)',
    submitColor:   '#fff',
    icon:          '🌍',
    title:         (m: string) => m === 'login' ? 'ACCESS THE GLOBE' : 'JOIN THE GLOBE',
    submitTxt:     (m: string) => m === 'login' ? '🌍 ENTER GLOBE' : '✈️ BEGIN JOURNEY',
    loginTab:      '🌍 LOGIN',
    registerTab:   '✈️ REGISTER',
    footer:        '12 COUNTRIES · LOCALE FORMS · GLOBE BUILDER',
    guestColor:    'rgba(0,180,220,0.65)',
    guestHover:    '#00e5ff',
    divider:       'rgba(0,100,180,0.5)',
    dividerIcon:   '🌐',
    cornerIcon:    '🌍',
    cornerColor:   0.25,
    extraDecor:    '🌎',
    shadow:        '0 0 60px rgba(0,100,200,0.3), 0 24px 80px rgba(0,0,0,0.85)',
  } : {
    bg:            'linear-gradient(160deg, #040e02 0%, #0e2405 35%, #183f07 65%, #0d2205 100%)',
    particles:     JUNGLE_PARTICLES,
    cardBg:        'rgba(4, 16, 2, 0.93)',
    cardBorder:    'rgba(100, 60, 18, 0.7)',
    activeBg:      'rgba(18, 50, 8, 0.95)',
    activeBorder:  '#ffd700',
    inactiveBorder:'rgba(139, 90, 43, 0.45)',
    inputColor:    '#f0e8d0',
    logoGradient:  'linear-gradient(135deg, #6B2F0D 0%, #cd853f 25%, #ffd700 50%, #ffec70 65%, #ffd700 80%, #cd853f 100%)',
    subtitleColor: '#90c060',
    tabActive:     'linear-gradient(135deg, #5c2800, #cd853f)',
    tabActiveColor:'#ffd700',
    submitBtn:     'linear-gradient(135deg, #6B2F0D 0%, #cd853f 35%, #ffd700 65%, #f7931e 100%)',
    submitColor:   '#1a0800',
    icon:          '🗿',
    title:         (m: string) => m === 'login' ? 'ENTER THE TEMPLE' : 'JOIN THE QUEST',
    submitTxt:     (m: string) => m === 'login' ? '🏃 ENTER THE TEMPLE' : '⚔️ BEGIN THE QUEST',
    loginTab:      '🔑 LOGIN',
    registerTab:   '⚔️ REGISTER',
    footer:        '9 WORLDS · 11 AVATARS · INFINITE FORMS',
    guestColor:    'rgba(160,210,100,0.65)',
    guestHover:    '#a8d870',
    divider:       'rgba(139,90,43,0.5)',
    dividerIcon:   '🌿',
    cornerIcon:    '🗿',
    cornerColor:   0.3,
    extraDecor:    '🌴',
    shadow:        '0 0 0 1px rgba(255,215,0,0.06), 0 0 60px rgba(100,60,18,0.3), 0 24px 80px rgba(0,0,0,0.85)',
  };

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameActive, setNameActive] = useState(false);
  const [passActive, setPassActive] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function shake(msg: string) {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const result = login(name, password);
      if (!result.ok) { shake(result.error); return; }
      setSubmitting(true);
      setTimeout(() => onLogin(result.name), 600);
    } else {
      if (password !== confirm) { shake('Secret codes do not match!'); return; }
      const result = register(name, password);
      if (!result.ok) { shake(result.error); return; }
      setSubmitting(true);
      setTimeout(() => onLogin(name.trim()), 600);
    }
  };

  const handleGuest = () => {
    setSubmitting(true);
    setTimeout(() => onLogin(loginAsGuest()), 400);
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setPassword('');
    setConfirm('');
  };

  const inputStyle = (active: boolean): React.CSSProperties => ({
    width: '100%',
    background: active ? T.activeBg : T.cardBg,
    border: `2px solid ${active ? T.activeBorder : T.inactiveBorder}`,
    borderRadius: '8px',
    color: T.inputColor,
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    padding: '14px 16px 14px 46px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: active
      ? `0 0 18px ${T.activeBorder}44, inset 0 0 12px ${T.activeBorder}10`
      : 'inset 0 2px 8px rgba(0,0,0,0.4)',
    letterSpacing: '0.04em',
    boxSizing: 'border-box',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: submitting ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <ParticleBackground particles={T.particles} count={isGlobe ? 30 : 26} />
      <ScanLine />

      {/* Ground */}
      {!isGlobe && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #050200 0%, #200e00 55%, transparent 100%)', zIndex: 1 }} />}
      {isGlobe  && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #000010 0%, #000820 55%, transparent 100%)', zIndex: 1 }} />}

      {/* Temple run — stone path + runner */}
      {!isGlobe && <>
        <div style={{ position: 'absolute', bottom: '18px', left: 0, right: 0, height: '52px', display: 'flex', gap: '3px', overflow: 'hidden', zIndex: 2 }}>
          {Array.from({ length: 55 }, (_, i) => (
            <div key={i} style={{ flex: '0 0 52px', height: '46px', background: `rgba(${80 + (i % 3) * 12}, ${48 + (i % 4) * 6}, ${18 + (i % 2) * 8}, 0.55)`, border: '1px solid rgba(160, 100, 40, 0.28)', borderRadius: '2px' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '70px', fontSize: '44px', animation: 'runner 4.5s linear infinite', zIndex: 3, filter: 'drop-shadow(0 0 10px #ffd700)' }}>🏃</div>
        <Torch side="left" />
        <Torch side="right" />
      </>}

      {/* Globe — orbiting ring + spinning globe icon */}
      {isGlobe && <>
        <div style={{ position: 'absolute', bottom: '18px', left: 0, right: 0, height: '52px', display: 'flex', gap: '3px', overflow: 'hidden', zIndex: 2 }}>
          {Array.from({ length: 55 }, (_, i) => (
            <div key={i} style={{ flex: '0 0 52px', height: '46px', background: `rgba(0, ${18 + (i % 4) * 8}, ${40 + (i % 3) * 12}, 0.45)`, border: '1px solid rgba(0, 80, 180, 0.18)', borderRadius: '2px' }} />
          ))}
        </div>
        {/* Spinning globe bar */}
        <div style={{ position: 'absolute', bottom: '70px', fontSize: '44px', animation: 'runner 6s linear infinite', zIndex: 3, filter: 'drop-shadow(0 0 14px #00e5ff)' }}>🌍</div>
        {/* Side satellite decorations */}
        <div style={{ position: 'absolute', top: '20%', left: 'clamp(20px, 5vw, 80px)', fontSize: '36px', opacity: 0.25, animation: 'float-slow 5s ease-in-out infinite', zIndex: 3 }}>🛸</div>
        <div style={{ position: 'absolute', top: '20%', right: 'clamp(20px, 5vw, 80px)', fontSize: '36px', opacity: 0.25, animation: 'float-slow 5s ease-in-out 2s infinite', zIndex: 3 }}>🔭</div>
      </>}

      {/* ── LOGO ── */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: '16px', animation: 'title-entrance 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 4.5vw, 48px)', fontWeight: 900, background: T.logoGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 4px 14px rgba(0,200,255,0.25))', animation: 'text-glow 3.5s ease-in-out infinite' }}>
          {isGlobe ? '🌍 FORM QUEST 🌎' : '⚡ FORM QUEST ⚡'}
        </div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(9px, 1.4vw, 15px)', fontWeight: 700, color: T.subtitleColor, letterSpacing: '0.38em', marginTop: '5px', textTransform: 'uppercase' }}>
          {isGlobe ? 'Globe Explorer' : 'Form Builder'}
        </div>
      </div>

      {/* ── CARD ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative', zIndex: 5,
          background: T.cardBg,
          border: `2px solid ${T.cardBorder}`,
          borderRadius: '18px',
          padding: 'clamp(20px, 3.5vw, 36px) clamp(22px, 4vw, 44px)',
          width: 'min(440px, 92vw)',
          backdropFilter: 'blur(16px)',
          boxShadow: T.shadow,
          animation: shaking ? 'shake 0.5s ease-in-out' : 'login-entrance 0.65s ease-out 0.2s both',
        }}
      >
        {/* Corner ornaments */}
        {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((pos) => (
          <div key={pos} style={{ position: 'absolute', top: pos.startsWith('top') ? '-1px' : 'auto', bottom: pos.startsWith('bottom') ? '-1px' : 'auto', left: pos.endsWith('Left') ? '-1px' : 'auto', right: pos.endsWith('Right') ? '-1px' : 'auto', width: '18px', height: '18px', borderTop: pos.startsWith('top') ? `3px solid ${T.activeBorder}88` : 'none', borderBottom: pos.startsWith('bottom') ? `3px solid ${T.activeBorder}88` : 'none', borderLeft: pos.endsWith('Left') ? `3px solid ${T.activeBorder}88` : 'none', borderRight: pos.endsWith('Right') ? `3px solid ${T.activeBorder}88` : 'none', borderRadius: pos === 'topLeft' ? '16px 0 0 0' : pos === 'topRight' ? '0 16px 0 0' : pos === 'bottomLeft' ? '0 0 0 16px' : '0 0 16px 0' }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ fontSize: '40px', animation: 'idol-pulse 2.2s ease-in-out infinite', display: 'inline-block' }}>{T.icon}</div>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(12px, 2vw, 16px)', fontWeight: 700, color: T.tabActiveColor, letterSpacing: '0.14em', marginTop: '8px', filter: `drop-shadow(0 0 8px ${T.activeBorder}80)` }}>
            {T.title(mode)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${T.divider})` }} />
            <span style={{ fontSize: '13px', opacity: 0.5 }}>{T.dividerIcon}</span>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${T.divider}, transparent)` }} />
          </div>
        </div>

        {/* Login / Register tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} type="button" onClick={() => switchMode(m)}
              style={{ flex: 1, background: mode === m ? T.tabActive : 'transparent', border: 'none', borderRadius: '7px', color: mode === m ? T.tabActiveColor : `${T.tabActiveColor}44`, fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', padding: '9px', cursor: 'pointer', transition: 'all 0.22s', boxShadow: mode === m ? `0 0 12px ${T.activeBorder}30` : 'none' }}>
              {m === 'login' ? T.loginTab : T.registerTab}
            </button>
          ))}
        </div>

        {/* Name field */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>🏃</span>
          <input type="text" placeholder="Your explorer name..." value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onFocus={() => setNameActive(true)} onBlur={() => setNameActive(false)}
            style={inputStyle(nameActive)} maxLength={30} autoComplete="off" autoFocus />
        </div>

        {/* Password field */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>🔒</span>
          <input type="password" placeholder="Secret temple code..." value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onFocus={() => setPassActive(true)} onBlur={() => setPassActive(false)}
            style={inputStyle(passActive)} maxLength={64} />
        </div>

        {/* Confirm password (register only) */}
        {mode === 'register' && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>🔐</span>
            <input type="password" placeholder="Confirm your code..." value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              onFocus={() => setConfirmActive(true)} onBlur={() => setConfirmActive(false)}
              style={inputStyle(confirmActive)} maxLength={64} />
          </div>
        )}

        {/* Error */}
        <div style={{ height: '18px', marginBottom: '10px', textAlign: 'center' }}>
          {error && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: '#ff7070', letterSpacing: '0.08em', animation: 'fade-in 0.2s ease-out' }}>⚠️ {error}</span>}
        </div>

        <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${T.divider}, transparent)`, marginBottom: '16px' }} />

        {/* Submit */}
        <button type="submit" className="tr-btn" style={{ width: '100%', background: T.submitBtn, color: T.submitColor, fontSize: 'clamp(12px, 2vw, 15px)', padding: '15px', letterSpacing: '0.18em', fontWeight: 900, borderRadius: '8px', marginBottom: '10px', boxShadow: `0 0 24px ${T.activeBorder}44, 0 4px 16px rgba(0,0,0,0.5)` }}>
          {T.submitTxt(mode)}
        </button>

        {/* Guest */}
        <button type="button" onClick={handleGuest}
          style={{ width: '100%', background: 'transparent', border: `1px solid ${T.inactiveBorder}`, borderRadius: '8px', color: T.guestColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', padding: '10px', cursor: 'pointer', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = T.guestHover; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = T.guestColor; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
          👤 Continue as Guest Explorer
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: `${T.tabActiveColor}44`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ∴ {T.footer} ∴
          </span>
        </div>
      </form>

      {/* Corner decorations */}
      {[{ top: '18px', left: '22px', delay: '0s' }, { top: '18px', right: '22px', delay: '1s' }, { bottom: '130px', left: '18px', delay: '0.5s' }, { bottom: '130px', right: '18px', delay: '1.5s' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: '24px', opacity: T.cornerColor, animation: `float ${4 + i * 0.5}s ease-in-out ${pos.delay} infinite`, zIndex: 3, ...pos }}>{T.cornerIcon}</div>
      ))}
      <div style={{ position: 'absolute', bottom: '130px', left: '14px', fontSize: '32px', opacity: 0.2, animation: 'float-slow 6s ease-in-out infinite', zIndex: 3 }}>{T.extraDecor}</div>
      <div style={{ position: 'absolute', bottom: '130px', right: '14px', fontSize: '32px', opacity: 0.2, animation: 'float-slow 6s ease-in-out 2.5s infinite', zIndex: 3 }}>{T.extraDecor}</div>
    </div>
  );
}
