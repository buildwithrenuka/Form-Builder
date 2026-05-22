import { useState, FormEvent } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { saveSession } from '../auth';
import { trpc } from '../trpc';

type Props = {
  onLogin: (name: string) => void;
  onBack?: () => void;
  theme?: 'temple-run' | 'globe' | 'library' | 'formverse' | 'light' | 'rainbow' | 'firecracker' | 'jugnu';
  initialMode?: 'login' | 'register';
};

const JUNGLE_PARTICLES  = ['🌿', '🍃', '🦋', '🌺', '🐦', '✨', '🪙', '🗿'];
const GLOBE_PARTICLES   = ['🌍', '🌎', '🌏', '✈️', '🗺️', '⭐', '🔭', '💫', '🌐', '🛸'];
const LIBRARY_PARTICLES = ['📚', '📜', '🪄', '✨', '⚡', '🌟', '📖', '🔮', '🪶', '💫', '🌙', '⭐'];

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

export function LoginScreen({ onLogin, onBack, theme = 'temple-run', initialMode = 'login' }: Props) {
  const isGlobe    = theme === 'globe';
  const isLibrary  = theme === 'library';
  const isFormverse = theme === 'formverse';
  const isLightTheme = theme === 'light';
  const isRainbowTheme = theme === 'rainbow';
  const isFirecrackerTheme = theme === 'firecracker';
  const isJugnuTheme = theme === 'jugnu';
  const isCosmic = isFormverse || isLightTheme || isRainbowTheme || isFirecrackerTheme || isJugnuTheme;
  const isTemple = !isGlobe && !isLibrary && !isCosmic;
  const T = isLightTheme ? {
    bg:            'linear-gradient(160deg, #fff7d6 0%, #fff9ef 36%, #ffe7c2 68%, #fff2dc 100%)',
    particles:     ['☀️', '✨', '🌤️', '🕊️', '🌼', '📜', '🪄', '💫', '🌈', '⭐'],
    cardBg:        'rgba(255, 250, 240, 0.86)',
    cardBorder:    'rgba(25, 25, 25, 0.16)',
    activeBg:      'rgba(255, 255, 255, 0.96)',
    activeBorder:  '#111111',
    inactiveBorder:'rgba(17, 17, 17, 0.14)',
    inputColor:    '#111111',
    logoGradient:  'linear-gradient(135deg, #111111 0%, #2a2a2a 28%, #cc4400 58%, #ffb300 100%)',
    subtitleColor: 'rgba(17,17,17,0.62)',
    tabActive:     'linear-gradient(135deg, #111111, #3d3d3d)',
    tabActiveColor:'#fff7ef',
    submitBtn:     'linear-gradient(135deg, #111111 0%, #2f2f2f 28%, #cc4400 70%, #ffb300 100%)',
    submitColor:   '#fffdf8',
    icon:          '☀️',
    title:         (m: string) => m === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT',
    submitTxt:     (m: string) => m === 'login' ? 'ENTER FORMVERSE' : 'START YOUR QUEST',
    loginTab:      'LOGIN',
    registerTab:   'REGISTER',
    footer:        'LIGHT MODE · CLEAN FORMS · SHARED WORLDS',
    guestColor:    'rgba(17,17,17,0.56)',
    guestHover:    '#111111',
    divider:       'rgba(17,17,17,0.16)',
    dividerIcon:   '✦',
    cornerIcon:    '☀️',
    cornerColor:   0.16,
    extraDecor:    '✨',
    shadow:        '0 12px 42px rgba(0,0,0,0.12), 0 24px 70px rgba(204,68,0,0.14)',
  } : isRainbowTheme ? {
    bg:            'linear-gradient(160deg, #120024 0%, #001c3b 25%, #18204f 45%, #3a0f4f 68%, #24001a 100%)',
    particles:     ['🌈', '✨', '🪩', '💫', '🎨', '⭐', '🌟', '🎆', '🫧', '🎠'],
    cardBg:        'rgba(18, 8, 48, 0.84)',
    cardBorder:    'rgba(255, 255, 255, 0.2)',
    activeBg:      'rgba(32, 12, 74, 0.96)',
    activeBorder:  '#ff7ad9',
    inactiveBorder:'rgba(130, 110, 255, 0.28)',
    inputColor:    '#fff6ff',
    logoGradient:  'linear-gradient(135deg, #ff4fd8 0%, #7c3aed 24%, #00e5ff 48%, #9cff00 72%, #ffe600 88%, #ff7a00 100%)',
    subtitleColor: '#c9b8ff',
    tabActive:     'linear-gradient(135deg, #7c3aed, #ff4fd8)',
    tabActiveColor:'#fff8ff',
    submitBtn:     'linear-gradient(135deg, #7c3aed 0%, #ff4fd8 24%, #00e5ff 52%, #9cff00 78%, #ffe600 100%)',
    submitColor:   '#13041f',
    icon:          '🌈',
    title:         (m: string) => m === 'login' ? 'ENTER THE SPECTRUM' : 'JOIN THE SPECTRUM',
    submitTxt:     (m: string) => m === 'login' ? 'ENTER RAINBOW MODE' : 'BEGIN IN COLOR',
    loginTab:      'RAINBOW LOGIN',
    registerTab:   'COLOR REGISTER',
    footer:        'RAINBOW MODE · BOLD FORMS · CINEMATIC WORLDS',
    guestColor:    'rgba(226,211,255,0.68)',
    guestHover:    '#ffffff',
    divider:       'rgba(255, 122, 217, 0.3)',
    dividerIcon:   '🌈',
    cornerIcon:    '✨',
    cornerColor:   0.22,
    extraDecor:    '🪩',
    shadow:        '0 0 60px rgba(124,58,237,0.22), 0 0 80px rgba(255,79,216,0.18), 0 24px 80px rgba(0,0,0,0.82)',
  } : isFirecrackerTheme ? {
    bg:            'linear-gradient(160deg, #140100 0%, #290500 25%, #481000 52%, #2b0500 76%, #120100 100%)',
    particles:     ['🎆', '✨', '🔥', '💥', '🧨', '⭐', '🎇', '🌟', '⚡', '🪔'],
    cardBg:        'rgba(24, 4, 0, 0.88)',
    cardBorder:    'rgba(255, 110, 0, 0.42)',
    activeBg:      'rgba(58, 10, 0, 0.96)',
    activeBorder:  '#ff9a00',
    inactiveBorder:'rgba(255, 120, 0, 0.22)',
    inputColor:    '#fff2df',
    logoGradient:  'linear-gradient(135deg, #ff4d00 0%, #ff7a00 25%, #ffb000 52%, #ffe066 76%, #ff5e00 100%)',
    subtitleColor: '#ffbe73',
    tabActive:     'linear-gradient(135deg, #8a1f00, #ff7a00)',
    tabActiveColor:'#fff8ef',
    submitBtn:     'linear-gradient(135deg, #8a1f00 0%, #ff5a00 24%, #ff9a00 58%, #ffd84d 100%)',
    submitColor:   '#240500',
    icon:          '🎆',
    title:         (m: string) => m === 'login' ? 'ENTER THE FIRELIGHT' : 'JOIN THE FIRELIGHT',
    submitTxt:     (m: string) => m === 'login' ? 'IGNITE YOUR LOGIN' : 'START WITH A SPARK',
    loginTab:      'FIRE LOGIN',
    registerTab:   'SPARK REGISTER',
    footer:        'FIRECRACKER MODE · BRIGHT FORMS · FESTIVE GLOW',
    guestColor:    'rgba(255,190,115,0.68)',
    guestHover:    '#fff5dc',
    divider:       'rgba(255,120,0,0.28)',
    dividerIcon:   '✦',
    cornerIcon:    '🎇',
    cornerColor:   0.24,
    extraDecor:    '🔥',
    shadow:        '0 0 60px rgba(255,90,0,0.22), 0 0 90px rgba(255,180,0,0.14), 0 24px 80px rgba(0,0,0,0.82)',
  } : isJugnuTheme ? {
    bg:            'linear-gradient(160deg, #020500 0%, #071100 28%, #141d00 56%, #0a1200 78%, #020500 100%)',
    particles:     ['✨', '🌟', '🪲', '💫', '🌾', '🍃', '⭐', '🫧', '🪔', '🌙'],
    cardBg:        'rgba(8, 12, 0, 0.88)',
    cardBorder:    'rgba(255, 214, 92, 0.28)',
    activeBg:      'rgba(24, 34, 2, 0.96)',
    activeBorder:  '#ffd65c',
    inactiveBorder:'rgba(255, 214, 92, 0.16)',
    inputColor:    '#fff6d8',
    logoGradient:  'linear-gradient(135deg, #fff1a8 0%, #ffd65c 28%, #ffe98e 58%, #cfff8c 82%, #ffd65c 100%)',
    subtitleColor: '#ffe7a3',
    tabActive:     'linear-gradient(135deg, #5b4300, #b07a00)',
    tabActiveColor:'#fffbea',
    submitBtn:     'linear-gradient(135deg, #5b4300 0%, #b07a00 30%, #ffd65c 64%, #fff0a6 100%)',
    submitColor:   '#1a1500',
    icon:          '✨',
    title:         (m: string) => m === 'login' ? 'ENTER THE FIREFLIES' : 'JOIN THE FIREFLIES',
    submitTxt:     (m: string) => m === 'login' ? 'GLOW INTO FORMVERSE' : 'BEGIN IN GOLDEN LIGHT',
    loginTab:      'JUGNU LOGIN',
    registerTab:   'GLOW REGISTER',
    footer:        'JUGNU MODE · GOLDEN GLOW · QUIET MAGIC',
    guestColor:    'rgba(255, 232, 170, 0.7)',
    guestHover:    '#fff7cf',
    divider:       'rgba(255,214,92,0.22)',
    dividerIcon:   '✨',
    cornerIcon:    '🌟',
    cornerColor:   0.2,
    extraDecor:    '🪔',
    shadow:        '0 0 52px rgba(255,214,92,0.18), 0 0 90px rgba(207,255,140,0.08), 0 24px 80px rgba(0,0,0,0.84)',
  } : isFormverse ? {
    bg:            'linear-gradient(160deg, #060014 0%, #0d0026 35%, #120038 65%, #060014 100%)',
    particles:     ['\u2728', '\u{1F52E}', '\u{1F3DB}\uFE0F', '\u2708\uFE0F', '\u{1F4DA}', '\u{1F30C}', '\u{1F320}', '\u{1F6F8}', '\u{1FA84}', '\u{1F9FF}', '\u{1F30D}', '\u{1F52D}'],
    cardBg:        'rgba(6, 0, 20, 0.96)',
    cardBorder:    'rgba(124, 58, 237, 0.65)',
    activeBg:      'rgba(20, 0, 50, 0.96)',
    activeBorder:  '#a78bfa',
    inactiveBorder:'rgba(88, 28, 200, 0.35)',
    inputColor:    '#e9d5ff',
    logoGradient:  'linear-gradient(135deg, #5b21b6 0%, #7c3aed 28%, #a78bfa 52%, #00e5ff 70%, #a78bfa 85%, #7c3aed 100%)',
    subtitleColor: '#a78bfa',
    tabActive:     'linear-gradient(135deg, #2e1065, #6d28d9)',
    tabActiveColor:'#e9d5ff',
    submitBtn:     'linear-gradient(135deg, #4c1d95 0%, #7c3aed 40%, #a78bfa 70%, #00e5ff 100%)',
    submitColor:   '#fff',
    icon:          '\u{1F52E}',
    title:         (m: string) => m === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT',
    submitTxt:     (m: string) => m === 'login' ? '\u{1F680} ENTER FORMVERSE' : '\u2728 START YOUR QUEST',
    loginTab:      '\u{1F511} LOGIN',
    registerTab:   '\u2728 REGISTER',
    footer:        'REALM RUNNER \u00b7 GLOBE EXPLORER \u00b7 THE LIBRARY',
    guestColor:    'rgba(167,139,250,0.65)',
    guestHover:    '#a78bfa',
    divider:       'rgba(124,58,237,0.45)',
    dividerIcon:   '\u2726',
    cornerIcon:    '\u{1F30C}',
    cornerColor:   0.28,
    extraDecor:    '\u{1FA84}',
    shadow:        '0 0 60px rgba(124,58,237,0.3), 0 24px 80px rgba(0,0,0,0.9)',
  } : isLibrary ? {
    bg:            'linear-gradient(160deg, #0a0018 0%, #12002e 35%, #1a0040 65%, #0a0018 100%)',
    particles:     LIBRARY_PARTICLES,
    cardBg:        'rgba(10, 0, 28, 0.96)',
    cardBorder:    'rgba(147, 51, 234, 0.65)',
    activeBg:      'rgba(30, 0, 60, 0.96)',
    activeBorder:  '#c084fc',
    inactiveBorder:'rgba(109, 40, 180, 0.45)',
    inputColor:    '#f0e8ff',
    logoGradient:  'linear-gradient(135deg, #6b21a8 0%, #9333ea 28%, #c084fc 52%, #ffd700 68%, #c084fc 82%, #9333ea 100%)',
    subtitleColor: '#c084fc',
    tabActive:     'linear-gradient(135deg, #3b0764, #7e22ce)',
    tabActiveColor:'#e9d5ff',
    submitBtn:     'linear-gradient(135deg, #4a1d96 0%, #7c3aed 40%, #c084fc 75%, #ffd700 100%)',
    submitColor:   '#fff',
    icon:          '📚',
    title:         (m: string) => m === 'login' ? 'ENTER THE LIBRARY' : 'JOIN THE ARCHIVE',
    submitTxt:     (m: string) => m === 'login' ? '📚 OPEN THE LIBRARY' : '📖 BEGIN THE CHRONICLE',
    loginTab:      '📚 LOGIN',
    registerTab:   '📖 REGISTER',
    footer:        'MYTH · HISTORY · SCI-FI · FICTION',
    guestColor:    'rgba(192,132,252,0.65)',
    guestHover:    '#e9d5ff',
    divider:       'rgba(147,51,234,0.5)',
    dividerIcon:   '📜',
    cornerIcon:    '📚',
    cornerColor:   0.28,
    extraDecor:    '🪄',
    shadow:        '0 0 60px rgba(147,51,234,0.28), 0 24px 80px rgba(0,0,0,0.9)',
  } : isGlobe ? {
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

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameActive, setNameActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [passActive, setPassActive] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loginMut = trpc.auth.login.useMutation();
  const registerMut = trpc.auth.register.useMutation();

  function shake(msg: string) {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      shake('Email is required.');
      return;
    }

    if (mode === 'register' && !trimmedName) {
      shake('Explorer name cannot be empty.');
      return;
    }

    if (mode === 'register' && password !== confirm) {
      shake('Secret codes do not match!');
      return;
    }

    try {
      if (mode === 'login') {
        const result = await loginMut.mutateAsync({ email: trimmedEmail, password });
        saveSession({ name: result.user.name, email: result.user.email }, result.token);
        setSubmitting(true);
        setTimeout(() => onLogin(result.user.name), 600);
        return;
      }

      const result = await registerMut.mutateAsync({ name: trimmedName, email: trimmedEmail, password });
      saveSession({ name: result.user.name, email: result.user.email }, result.token);
      setSubmitting(true);
      setTimeout(() => onLogin(result.user.name), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      shake(message);
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    if (m === 'login') setName('');
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
      : (isLightTheme ? 'inset 0 2px 8px rgba(0,0,0,0.08)' : 'inset 0 2px 8px rgba(0,0,0,0.4)'),
    letterSpacing: '0.04em',
    boxSizing: 'border-box',
  });

  const backButtonBg = isLightTheme ? 'rgba(17,17,17,0.06)' : 'rgba(255,255,255,0.07)';
  const backButtonBorder = isLightTheme ? 'rgba(17,17,17,0.14)' : 'rgba(255,255,255,0.12)';
  const backButtonColor = isLightTheme ? 'rgba(17,17,17,0.62)' : 'rgba(255,255,255,0.55)';
  const backButtonHoverBg = isLightTheme ? 'rgba(17,17,17,0.12)' : 'rgba(255,255,255,0.12)';
  const backButtonHoverColor = isLightTheme ? '#111111' : '#fff';

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
      <ParticleBackground particles={T.particles} count={isLibrary ? 32 : isGlobe ? 30 : isRainbowTheme ? 34 : isFirecrackerTheme ? 30 : isJugnuTheme ? 28 : isLightTheme ? 24 : 26} />
      <ScanLine />

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 16, left: 20, zIndex: 20,
            background: backButtonBg, border: `1px solid ${backButtonBorder}`,
            borderRadius: 8, color: backButtonColor, fontSize: 12,
            fontWeight: 600, padding: '7px 14px', cursor: 'pointer',
            fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = backButtonHoverBg; e.currentTarget.style.color = backButtonHoverColor; }}
          onMouseLeave={e => { e.currentTarget.style.background = backButtonBg; e.currentTarget.style.color = backButtonColor; }}
        >
          ← Back
        </button>
      )}

      {/* Ground */}
      {isTemple    && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #050200 0%, #200e00 55%, transparent 100%)', zIndex: 1 }} />}
      {isGlobe     && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #000010 0%, #000820 55%, transparent 100%)', zIndex: 1 }} />}
      {isLibrary   && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #050010 0%, #0f0030 55%, transparent 100%)', zIndex: 1 }} />}
      {isFormverse && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, #030010 0%, #0d0028 55%, transparent 100%)', zIndex: 1 }} />}
      {isLightTheme && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, rgba(255,214,150,0.44) 0%, rgba(255,245,224,0.28) 55%, transparent 100%)', zIndex: 1 }} />}
      {isRainbowTheme && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(0deg, rgba(18,0,46,0.9) 0%, rgba(58,15,79,0.46) 55%, transparent 100%)', zIndex: 1 }} />}

      {/* Realm Runner — stone path + runner */}
      {isTemple && <>
        <div style={{ position: 'absolute', bottom: '18px', left: 0, right: 0, height: '52px', display: 'flex', gap: '3px', overflow: 'hidden', zIndex: 2 }}>
          {Array.from({ length: 55 }, (_, i) => (
            <div key={i} style={{ flex: '0 0 52px', height: '46px', background: `rgba(${80 + (i % 3) * 12}, ${48 + (i % 4) * 6}, ${18 + (i % 2) * 8}, 0.55)`, border: '1px solid rgba(160, 100, 40, 0.28)', borderRadius: '2px' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '70px', fontSize: '44px', animation: 'runner 4.5s linear infinite', zIndex: 3, filter: 'drop-shadow(0 0 10px #ffd700)' }}>🏃</div>
        <Torch side="left" />
        <Torch side="right" />
      </>}

      {/* FormVerse — floating orbs + star field */}
      {isCosmic && <>
        {/* Deep orbs */}
        <div style={{ position: 'absolute', top: '5%',  left: '5%',  width: '40vw', height: '40vw', background: isLightTheme ? 'radial-gradient(circle, rgba(255,196,82,0.18) 0%, transparent 70%)' : isRainbowTheme ? 'radial-gradient(circle, rgba(255,79,216,0.18) 0%, transparent 70%)' : isFirecrackerTheme ? 'radial-gradient(circle, rgba(255,94,0,0.2) 0%, transparent 70%)' : isJugnuTheme ? 'radial-gradient(circle, rgba(255,214,92,0.16) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 1, animation: 'orb-drift 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '20%', right: '3%', width: '30vw', height: '30vw', background: isLightTheme ? 'radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)' : isRainbowTheme ? 'radial-gradient(circle, rgba(0,229,255,0.14) 0%, transparent 70%)' : isFirecrackerTheme ? 'radial-gradient(circle, rgba(255,184,0,0.14) 0%, transparent 70%)' : isJugnuTheme ? 'radial-gradient(circle, rgba(207,255,140,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)',   filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1, animation: 'orb-drift 18s ease-in-out infinite 5s' }} />
        <div style={{ position: 'absolute', bottom: '8%',left: '20%', width: '35vw', height: '20vw', background: isLightTheme ? 'radial-gradient(circle, rgba(17,17,17,0.08) 0%, transparent 70%)' : isRainbowTheme ? 'radial-gradient(circle, rgba(156,255,0,0.14) 0%, transparent 70%)' : isFirecrackerTheme ? 'radial-gradient(circle, rgba(255,70,0,0.12) 0%, transparent 70%)' : isJugnuTheme ? 'radial-gradient(circle, rgba(255,240,150,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',  filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1, animation: 'orb-drift 22s ease-in-out infinite 10s' }} />
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: isLightTheme ? 'linear-gradient(rgba(17,17,17,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,0.03) 1px,transparent 1px)' : isRainbowTheme ? 'linear-gradient(rgba(255,255,255,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.045) 1px,transparent 1px)' : isFirecrackerTheme ? 'linear-gradient(rgba(255,122,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,90,0,0.05) 1px,transparent 1px)' : isJugnuTheme ? 'linear-gradient(rgba(255,214,92,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(207,255,140,0.03) 1px,transparent 1px)' : 'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none', zIndex: 1 }} />
        {/* Scan line */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: isLightTheme ? 'linear-gradient(90deg, transparent, rgba(17,17,17,0.24), rgba(255,179,0,0.32), transparent)' : isRainbowTheme ? 'linear-gradient(90deg, transparent, rgba(255,79,216,0.45), rgba(0,229,255,0.45), rgba(156,255,0,0.42), transparent)' : isFirecrackerTheme ? 'linear-gradient(90deg, transparent, rgba(255,90,0,0.55), rgba(255,184,0,0.5), transparent)' : isJugnuTheme ? 'linear-gradient(90deg, transparent, rgba(255,214,92,0.42), rgba(207,255,140,0.28), transparent)' : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(0,229,255,0.4), transparent)', animation: 'scan-h 8s linear infinite', zIndex: 2, pointerEvents: 'none' }} />
        {/* Rocket runner */}
        <div style={{ position: 'absolute', bottom: '70px', fontSize: '44px', animation: 'runner 5s linear infinite', zIndex: 3, filter: isLightTheme ? 'drop-shadow(0 0 14px #ff9800)' : isRainbowTheme ? 'drop-shadow(0 0 14px #ff4fd8)' : isFirecrackerTheme ? 'drop-shadow(0 0 14px #ff6a00)' : isJugnuTheme ? 'drop-shadow(0 0 14px #ffd65c)' : 'drop-shadow(0 0 14px #a78bfa)' }}>{isRainbowTheme ? '🌈' : isLightTheme ? '☀️' : isFirecrackerTheme ? '🎆' : isJugnuTheme ? '✨' : '🚀'}</div>
        {/* Side icons */}
        <div style={{ position: 'absolute', top: '18%', left: 'clamp(20px, 4vw, 70px)', fontSize: '40px', opacity: isLightTheme ? 0.16 : 0.18, animation: 'cosmic-float 6s ease-in-out infinite', zIndex: 3 }}>{isLightTheme ? '☁️' : isRainbowTheme ? '🪩' : isFirecrackerTheme ? '🔥' : isJugnuTheme ? '🌾' : '🏛️'}</div>
        <div style={{ position: 'absolute', top: '18%', right: 'clamp(20px, 4vw, 70px)', fontSize: '40px', opacity: isLightTheme ? 0.16 : 0.18, animation: 'cosmic-float 6s ease-in-out 2s infinite', zIndex: 3 }}>{isLightTheme ? '✨' : isRainbowTheme ? '🎨' : isFirecrackerTheme ? '🎇' : isJugnuTheme ? '🌟' : '📚'}</div>
        <div style={{ position: 'absolute', top: '42%', left: 'clamp(10px, 2vw, 40px)', fontSize: '28px', opacity: isLightTheme ? 0.1 : 0.12, animation: 'cosmic-float 8s ease-in-out 1s infinite', zIndex: 3 }}>{isLightTheme ? '🕊️' : isRainbowTheme ? '💫' : isFirecrackerTheme ? '💥' : isJugnuTheme ? '🪔' : '✈️'}</div>
        <div style={{ position: 'absolute', top: '42%', right: 'clamp(10px, 2vw, 40px)', fontSize: '28px', opacity: isLightTheme ? 0.1 : 0.12, animation: 'cosmic-float 8s ease-in-out 3s infinite', zIndex: 3 }}>{isLightTheme ? '⭐' : isRainbowTheme ? '🎆' : isFirecrackerTheme ? '⚡' : isJugnuTheme ? '🍃' : '🌍'}</div>
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

      {/* Library — bookshelf floor tiles + floating grimoire */}
      {isLibrary && <>
        <div style={{ position: 'absolute', bottom: '18px', left: 0, right: 0, height: '52px', display: 'flex', gap: '4px', overflow: 'hidden', zIndex: 2, padding: '0 8px' }}>
          {Array.from({ length: 40 }, (_, i) => {
            const colors = ['#4a1d96','#3b0764','#6d28d9','#5b21b6','#7c3aed'];
            const col = colors[i % colors.length];
            return (
              <div key={i} style={{ flex: '0 0 18px', height: '46px', background: col, opacity: 0.55, borderRadius: '2px 2px 0 0', border: '1px solid rgba(192,132,252,0.2)', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.4)' }} />
            );
          })}
        </div>
        {/* Floating open book */}
        <div style={{ position: 'absolute', bottom: '72px', fontSize: '44px', animation: 'runner 8s linear infinite', zIndex: 3, filter: 'drop-shadow(0 0 14px #c084fc)' }}>📖</div>
        {/* Side shelf candles */}
        <div style={{ position: 'absolute', top: '22%', left: 'clamp(20px, 5vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.55, animation: 'float-slow 5s ease-in-out infinite', zIndex: 3 }}>
          <div style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px #c084fc)' }}>🕯️</div>
          <div style={{ width: 3, height: 44, background: 'linear-gradient(180deg, #7c3aed, #3b0764)', borderRadius: 2 }} />
          <div style={{ width: 12, height: 6, background: '#4a1d96', borderRadius: 2 }} />
        </div>
        <div style={{ position: 'absolute', top: '22%', right: 'clamp(20px, 5vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.55, animation: 'float-slow 5s ease-in-out 2.2s infinite', zIndex: 3 }}>
          <div style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px #c084fc)' }}>🕯️</div>
          <div style={{ width: 3, height: 44, background: 'linear-gradient(180deg, #7c3aed, #3b0764)', borderRadius: 2 }} />
          <div style={{ width: 12, height: 6, background: '#4a1d96', borderRadius: 2 }} />
        </div>
      </>}

      {/* ── LOGO ── */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: '20px', animation: 'title-entrance 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
        {isCosmic ? (
          <>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '10px 18px 12px', borderRadius: '18px', background: isLightTheme ? 'linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,243,220,0.42))' : isRainbowTheme ? 'linear-gradient(135deg, rgba(36,16,72,0.7), rgba(20,18,58,0.34))' : 'linear-gradient(135deg, rgba(16,8,38,0.72), rgba(10,16,42,0.34))', border: isLightTheme ? '1px solid rgba(17,17,17,0.1)' : isRainbowTheme ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(167,139,250,0.18)', boxShadow: isLightTheme ? '0 14px 34px rgba(0, 0, 0, 0.1)' : '0 14px 34px rgba(10, 4, 28, 0.35)', backdropFilter: 'blur(14px)' }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(28px, 6vw, 58px)', fontWeight: 900, color: isLightTheme ? '#111111' : isJugnuTheme ? '#fff3bf' : '#c4b5fd', background: isLightTheme ? 'linear-gradient(135deg, #111111 0%, #2a2a2a 22%, #cc4400 60%, #ffb300 100%)' : isRainbowTheme ? 'linear-gradient(135deg, #ff4fd8 0%, #7c3aed 24%, #00e5ff 48%, #9cff00 72%, #ffe600 88%, #ff7a00 100%)' : isFirecrackerTheme ? 'linear-gradient(135deg, #ff4d00 0%, #ff7a00 24%, #ffb000 58%, #ffe066 100%)' : isJugnuTheme ? 'linear-gradient(135deg, #fff3bf 0%, #ffd65c 34%, #ffe98e 68%, #cfff8c 100%)' : 'linear-gradient(135deg, #e9ddff 0%, #a78bfa 20%, #00e5ff 45%, #e879f9 70%, #a78bfa 90%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'word-shimmer 5s ease-in-out infinite', filter: isLightTheme ? 'drop-shadow(0 0 12px rgba(255,179,0,0.16))' : isFirecrackerTheme ? 'drop-shadow(0 0 16px rgba(255,106,0,0.3))' : isJugnuTheme ? 'drop-shadow(0 0 16px rgba(255,214,92,0.2))' : 'drop-shadow(0 0 24px rgba(124,58,237,0.42))', textShadow: isLightTheme ? '0 3px 10px rgba(0,0,0,0.1)' : '0 0 18px rgba(8,4,24,0.36)' }}>
                FORMVERSE
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ height: 1, width: 40, background: isLightTheme ? 'linear-gradient(90deg, transparent, rgba(17,17,17,0.28))' : 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5))' }} />
              <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(8px, 1.2vw, 11px)', fontWeight: 700, color: isLightTheme ? 'rgba(17,17,17,0.56)' : isFirecrackerTheme ? 'rgba(255,190,115,0.62)' : isJugnuTheme ? 'rgba(255,232,170,0.66)' : 'rgba(167,139,250,0.55)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>{isRainbowTheme ? 'Build · Glow · Share' : isFirecrackerTheme ? 'Build · Burst · Share' : isJugnuTheme ? 'Build · Glow · Wander' : 'Build · Share · Explore'}</span>
              <div style={{ height: 1, width: 40, background: isLightTheme ? 'linear-gradient(90deg, rgba(17,17,17,0.28), transparent)' : 'linear-gradient(90deg, rgba(167,139,250,0.5), transparent)' }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '9px 16px 10px', borderRadius: '16px', background: isLibrary ? 'linear-gradient(135deg, rgba(28, 6, 52, 0.74), rgba(16, 4, 30, 0.36))' : isGlobe ? 'linear-gradient(135deg, rgba(10, 20, 44, 0.76), rgba(10, 12, 24, 0.34))' : 'linear-gradient(135deg, rgba(40, 14, 0, 0.76), rgba(20, 8, 0, 0.34))', border: isLibrary ? '1px solid rgba(168,85,247,0.18)' : isGlobe ? '1px solid rgba(0,229,255,0.16)' : '1px solid rgba(255,170,80,0.18)', boxShadow: isLibrary ? '0 12px 28px rgba(18, 4, 32, 0.34)' : isGlobe ? '0 12px 28px rgba(4, 12, 30, 0.3)' : '0 12px 28px rgba(22, 8, 0, 0.32)', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 4.5vw, 48px)', fontWeight: 900, color: isLibrary ? '#e9d5ff' : isGlobe ? '#d8f7ff' : '#fff4dc', background: T.logoGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 4px 14px rgba(0,200,255,0.2))', animation: 'text-glow 3.5s ease-in-out infinite', textShadow: isLibrary ? '0 0 14px rgba(12, 4, 24, 0.34)' : isGlobe ? '0 0 14px rgba(6, 14, 24, 0.3)' : '0 0 14px rgba(22, 8, 0, 0.3)' }}>
                {isLibrary ? '📚 FORMVERSE 📖' : isGlobe ? '🌍 GLOBE EXPLORER 🌎' : '⚡ REALM RUNNER ⚡'}
              </div>
            </div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(9px, 1.4vw, 15px)', fontWeight: 700, color: T.subtitleColor, letterSpacing: '0.38em', marginTop: '5px', textTransform: 'uppercase' }}>
              {isLibrary ? 'The Grand Library' : isGlobe ? 'Globe Explorer' : 'Form Builder'}
            </div>
          </>
        )}
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
          backdropFilter: 'blur(20px)',
          boxShadow: T.shadow,
          animation: shaking ? 'shake 0.5s ease-in-out' : isCosmic ? 'login-card-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' : 'login-entrance 0.65s ease-out 0.2s both',
          ...(isCosmic && !shaking ? { animationName: 'login-card-in, glow-border-cycle', animationDuration: '0.8s, 4s', animationDelay: '0.2s, 1s', animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1), ease-in-out', animationFillMode: 'both, none', animationIterationCount: '1, infinite' } : {}),
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

        {mode === 'register' && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>{isLibrary ? '📖' : isCosmic ? (isLightTheme ? '☀️' : isRainbowTheme ? '🌈' : isFirecrackerTheme ? '🎆' : isJugnuTheme ? '✨' : '🧑‍🚀') : '🏃'}</span>
            <input type="text" placeholder={isLibrary ? 'Your scholar name...' : isCosmic ? 'Your explorer name...' : 'Your explorer name...'} value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onFocus={() => setNameActive(true)} onBlur={() => setNameActive(false)}
              style={inputStyle(nameActive)} maxLength={60} autoComplete="name" autoFocus={mode === 'register'} />
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', zIndex: 1, pointerEvents: 'none' }}>✉️</span>
          <input type="email" placeholder="Your email address..." value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onFocus={() => setEmailActive(true)} onBlur={() => setEmailActive(false)}
            style={inputStyle(emailActive)} maxLength={120} autoComplete="email" autoFocus={mode === 'login'} />
        </div>

        {/* Password field */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>🔒</span>
          <input type="password" placeholder={isLibrary ? 'Your secret cipher...' : isCosmic ? 'Your secret passcode...' : 'Secret temple code...'} value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onFocus={() => setPassActive(true)} onBlur={() => setPassActive(false)}
            style={inputStyle(passActive)} maxLength={64} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </div>

        {/* Confirm password (register only) */}
        {mode === 'register' && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1, pointerEvents: 'none' }}>🔐</span>
            <input type="password" placeholder="Confirm your code..." value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              onFocus={() => setConfirmActive(true)} onBlur={() => setConfirmActive(false)}
              style={inputStyle(confirmActive)} maxLength={64} autoComplete="new-password" />
          </div>
        )}

        {/* Error */}
        <div style={{ height: '18px', marginBottom: '10px', textAlign: 'center' }}>
          {error && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: '#ff7070', letterSpacing: '0.08em', animation: 'fade-in 0.2s ease-out' }}>⚠️ {error}</span>}
        </div>

        <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${T.divider}, transparent)`, marginBottom: '16px' }} />

        {/* Submit */}
        <button type="submit" className="tr-btn" disabled={submitting || loginMut.isPending || registerMut.isPending} style={{ width: '100%', background: T.submitBtn, color: T.submitColor, fontSize: 'clamp(12px, 2vw, 15px)', padding: '15px', letterSpacing: '0.18em', fontWeight: 900, borderRadius: '8px', marginBottom: '10px', boxShadow: `0 0 24px ${T.activeBorder}44, 0 4px 16px rgba(0,0,0,0.5)`, opacity: submitting || loginMut.isPending || registerMut.isPending ? 0.7 : 1, cursor: submitting || loginMut.isPending || registerMut.isPending ? 'not-allowed' : 'pointer' }}>
          {submitting || loginMut.isPending || registerMut.isPending ? '⏳ AUTHENTICATING' : T.submitTxt(mode)}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: isLightTheme ? 'rgba(17,17,17,0.34)' : `${T.tabActiveColor}44`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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
