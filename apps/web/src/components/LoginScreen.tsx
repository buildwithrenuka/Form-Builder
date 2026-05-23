import { useEffect, useState, FormEvent } from 'react';
import { FormVerseLogo } from './Logo';
import { saveSession } from '../auth';
import { trpc } from '../trpc';
import { APP_UI_FONT, getAppSurfaceTheme } from './appSurfaceTheme';
import type { HomeTheme } from './HomePage';

type Props = {
  onLogin: (name: string) => void;
  onBack?: () => void;
  theme?: 'temple-run' | 'globe' | 'library' | 'formverse' | 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu';
  initialMode?: 'login' | 'register';
};

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

function readResetTokenFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('resetToken')?.trim() ?? '';
}

function writeResetTokenToUrl(token: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (token) {
    url.searchParams.set('resetToken', token);
  } else {
    url.searchParams.delete('resetToken');
  }
  window.history.replaceState({}, '', url.toString());
}

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

function buildSharedAuthTheme(theme: HomeTheme, particles: string[], icon: string, footer: string) {
  const surface = getAppSurfaceTheme(theme);

  return {
    bg: surface.background,
    particles,
    cardBg: surface.panel,
    cardBorder: surface.panelBorderStrong,
    activeBg: surface.panelStrong,
    activeBorder: surface.accent,
    inactiveBorder: surface.panelBorder,
    inputColor: surface.text,
    logoGradient: surface.accentGradient,
    subtitleColor: surface.textSoft,
    tabActive: surface.accentGradient,
    tabActiveColor: surface.buttonText,
    submitBtn: surface.actionGradient,
    submitColor: surface.buttonText,
    icon,
    title: (modeName: string) => modeName === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT',
    submitTxt: (modeName: string) => modeName === 'login' ? 'ENTER WORKSPACE' : 'CREATE ACCOUNT',
    loginTab: 'LOGIN',
    registerTab: 'REGISTER',
    footer,
    guestColor: surface.textSoft,
    guestHover: surface.heading,
    divider: surface.accentBorder,
    dividerIcon: '✦',
    cornerIcon: icon,
    cornerColor: 0.22,
    extraDecor: icon,
    shadow: surface.shadow,
  };
}

export function LoginScreen({ onLogin, onBack, theme = 'temple-run', initialMode = 'login' }: Props) {
  const isGlobe    = theme === 'globe';
  const isLibrary  = theme === 'library';
  const isFormverse = theme === 'formverse';
  const isDarkTheme = theme === 'dark';
  const isLightTheme = theme === 'light';
  const isRainbowTheme = theme === 'rainbow';
  const isFirecrackerTheme = theme === 'firecracker';
  const isJugnuTheme = theme === 'jugnu';
  const isCosmic = isFormverse || isDarkTheme || isLightTheme || isRainbowTheme || isFirecrackerTheme || isJugnuTheme;
  const isTemple = !isGlobe && !isLibrary && !isCosmic;
  const T = isDarkTheme ? buildSharedAuthTheme('dark', ['✨', '🌘', '🪐', '💫', '⭐', '🌌', '🔶', '🔹'], '🌙', 'DARK MODE · CINEMATIC GLASS · FOCUSED FORMS')
    : isLightTheme ? buildSharedAuthTheme('light', ['✨', '☁️', '🌿', '💫', '🌤️', '🕊️', '⭐', '🪄', '🌼', '🔹'], '☀️', 'LIGHT MODE · CREAM GLASS · MODERN FORMS')
    : isRainbowTheme ? buildSharedAuthTheme('rainbow', ['🌈', '✨', '🪩', '💫', '🎨', '⭐', '🌟', '🎆', '🫧', '🎠'], '🌈', 'RAINBOW MODE · BOLD FORMS · CINEMATIC WORLDS')
    : isFirecrackerTheme ? buildSharedAuthTheme('firecracker', ['🎆', '✨', '🔥', '💥', '🧨', '⭐', '🎇', '🌟', '⚡', '🪔'], '🎆', 'FIRECRACKER MODE · BRIGHT FORMS · FESTIVE GLOW') : isFirecrackerTheme ? {
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
  } : isJugnuTheme ? buildSharedAuthTheme('jugnu', ['✨', '🌟', '🪲', '💫', '🌾', '🍃', '⭐', '🫧', '🪔', '🌙'], '✨', 'JUGNU MODE · GOLDEN GLOW · QUIET MAGIC') : isFormverse ? {
    bg:            'linear-gradient(160deg, #090707 0%, #12100f 35%, #10181d 68%, #080909 100%)',
    particles:     ['\u2728', '\u{1F52E}', '\u{1F3DB}\uFE0F', '\u2708\uFE0F', '\u{1F4DA}', '\u{1F30C}', '\u{1F320}', '\u{1F6F8}', '\u{1FA84}', '\u{1F9FF}', '\u{1F30D}', '\u{1F52D}'],
    cardBg:        'rgba(12, 10, 10, 0.96)',
    cardBorder:    'rgba(255, 140, 66, 0.34)',
    activeBg:      'rgba(18, 20, 22, 0.96)',
    activeBorder:  '#ffb36b',
    inactiveBorder:'rgba(255, 140, 66, 0.18)',
    inputColor:    '#fff2e2',
    logoGradient:  'linear-gradient(135deg, #ffd166 0%, #ff8c42 32%, #22d3ee 74%, #9be7f2 100%)',
    subtitleColor: '#e7b98d',
    tabActive:     'linear-gradient(135deg, #4a2311, #ff8c42)',
    tabActiveColor:'#fff6ec',
    submitBtn:     'linear-gradient(135deg, #4a2311 0%, #ff8c42 38%, #ffd166 72%, #22d3ee 100%)',
    submitColor:   '#1a0d07',
    icon:          '\u{1F52E}',
    title:         (m: string) => m === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT',
    submitTxt:     (m: string) => m === 'login' ? '\u{1F680} ENTER FORMVERSE' : '\u2728 START YOUR QUEST',
    loginTab:      '\u{1F511} LOGIN',
    registerTab:   '\u2728 REGISTER',
    footer:        'REALM RUNNER \u00b7 GLOBE EXPLORER \u00b7 THE LIBRARY',
    guestColor:    'rgba(231,185,141,0.7)',
    guestHover:    '#ffd7ad',
    divider:       'rgba(34,211,238,0.2)',
    dividerIcon:   '\u2726',
    cornerIcon:    '\u{1F30C}',
    cornerColor:   0.28,
    extraDecor:    '\u{1FA84}',
    shadow:        '0 0 60px rgba(255,140,66,0.14), 0 0 84px rgba(34,211,238,0.08), 0 24px 80px rgba(0,0,0,0.9)',
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

  const [resetToken, setResetToken] = useState(() => readResetTokenFromUrl());
  const [mode, setMode] = useState<AuthView>(() => readResetTokenFromUrl() ? 'reset' : initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameActive, setNameActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [passActive, setPassActive] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loginMut = trpc.auth.login.useMutation();
  const registerMut = trpc.auth.register.useMutation();
  const forgotPasswordMut = trpc.auth.forgotPassword.useMutation();
  const resetPasswordMut = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    const token = readResetTokenFromUrl();
    if (token) {
      setResetToken(token);
      setMode('reset');
      setError('');
      setNotice('');
    }
  }, []);

  function shake(msg: string) {
    setNotice('');
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }

  function setInfo(msg: string) {
    setError('');
    setNotice(msg);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (mode !== 'reset' && !trimmedEmail) {
      shake('Email is required.');
      return;
    }

    if (mode === 'register' && !trimmedName) {
      shake('Explorer name cannot be empty.');
      return;
    }

    if ((mode === 'register' || mode === 'reset') && password !== confirm) {
      shake('Secret codes do not match!');
      return;
    }

    if (mode === 'forgot') {
      try {
        await forgotPasswordMut.mutateAsync({ email: trimmedEmail });
        setInfo('If an account exists, a reset link has been sent to that email.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to start password reset. Please try again.';
        shake(message);
      }
      return;
    }

    if (mode === 'reset') {
      if (!resetToken) {
        shake('This password reset link is missing a token.');
        return;
      }

      try {
        await resetPasswordMut.mutateAsync({ token: resetToken, password });
        writeResetTokenToUrl(null);
        setResetToken('');
        setPassword('');
        setConfirm('');
        setMode('login');
        setInfo('Password updated. Sign in with your new password.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to reset password. Please try again.';
        shake(message);
      }
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

  const switchMode = (m: AuthView) => {
    setMode(m);
    setError('');
    setNotice('');
    if (m !== 'reset' && resetToken) {
      writeResetTokenToUrl(null);
      setResetToken('');
    }
    if (m === 'login' || m === 'forgot') setName('');
    setPassword('');
    setConfirm('');
  };

  const currentSubmitText = mode === 'forgot'
    ? 'Send reset link'
    : mode === 'reset'
      ? 'Save new password'
      : mode === 'login'
        ? 'Enter workspace'
        : 'Create account';

  const authHeading = mode === 'login'
    ? 'Welcome back'
    : mode === 'register'
      ? 'Create your account'
      : mode === 'forgot'
        ? 'Reset your password'
        : 'Choose a new password';

  const authSubheading = mode === 'login'
    ? 'Sign in to manage forms, responses, publishing, and your creator workspace.'
    : mode === 'register'
      ? 'Start building shareable forms with themed experiences and controlled publishing.'
      : mode === 'forgot'
        ? 'Enter the email linked to your account and we will send a reset link.'
        : 'Set a fresh password for your account and get back into your workspace.';

  const shellLabel = isLibrary
    ? 'Library Workspace'
    : isGlobe
      ? 'Globe Workspace'
      : isDarkTheme
        ? 'Dark Workspace'
      : isRainbowTheme
        ? 'Rainbow Workspace'
        : isFirecrackerTheme
          ? 'Firecracker Workspace'
          : isJugnuTheme
            ? 'Jugnu Workspace'
            : isLightTheme
              ? 'Light Workspace'
              : isFormverse
                ? 'FormVerse Workspace'
                : 'Realm Workspace';

  const switchPrompt = mode === 'login' || mode === 'forgot' || mode === 'reset'
    ? "Don't have an account?"
    : 'Already have an account?';

  const switchActionLabel = mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'Sign up' : 'Sign in';
  const switchAction = () => switchMode(mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'register' : 'login');
  const logoVariant = theme === 'temple-run' || theme === 'globe' || theme === 'library' || theme === 'formverse' || theme === 'dark' || theme === 'light' || theme === 'rainbow' || theme === 'firecracker' || theme === 'jugnu'
    ? theme
    : 'dark';

  const authPanelBg = `linear-gradient(180deg, ${T.cardBg} 0%, ${T.activeBg} 100%)`;
  const authPanelBorder = T.cardBorder;
  const helperText = T.subtitleColor;
  const headingText = T.inputColor;
  const panelShadow = T.shadow;
  const cardAccent = T.activeBorder;
  const chipBorder = T.divider;
  const topStripBg = T.activeBg;
  const topStripBorder = T.inactiveBorder;
  const cardAura = `radial-gradient(circle at top, ${T.cardBorder} 0%, transparent 52%)`;
  const pageBackground = T.bg;
  const ambientGlowA = T.cardBorder;
  const ambientGlowB = T.divider;
  const hasThemeBackdropFx = isFirecrackerTheme || isRainbowTheme || isJugnuTheme;
  const burstOverlayA = isFirecrackerTheme
    ? 'conic-gradient(from 90deg at 50% 50%, rgba(255,72,0,0.28), rgba(255,176,0,0.06), rgba(255,238,120,0.22), rgba(255,72,0,0.28))'
    : isRainbowTheme
      ? 'conic-gradient(from 90deg at 50% 50%, rgba(255,0,168,0.24), rgba(0,229,255,0.08), rgba(255,230,0,0.2), rgba(139,47,255,0.22), rgba(255,0,168,0.24))'
      : isJugnuTheme
        ? 'radial-gradient(circle, rgba(255,220,120,0.26) 0%, rgba(201,181,122,0.12) 30%, transparent 68%)'
      : '';
  const burstOverlayB = isFirecrackerTheme
    ? 'radial-gradient(circle, rgba(255,196,0,0.26) 0%, rgba(255,106,0,0.14) 30%, transparent 62%)'
    : isRainbowTheme
      ? 'radial-gradient(circle, rgba(0,229,255,0.24) 0%, rgba(255,0,168,0.14) 32%, transparent 64%)'
      : isJugnuTheme
        ? 'radial-gradient(circle, rgba(168,191,119,0.2) 0%, rgba(255,240,150,0.12) 28%, transparent 62%)'
      : '';
  const burstOverlayC = isFirecrackerTheme
    ? 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,110,0,0.28) 0deg 10deg, transparent 10deg 28deg)'
    : isRainbowTheme
      ? 'linear-gradient(135deg, rgba(255,0,168,0.12), rgba(0,229,255,0.12), rgba(255,230,0,0.12))'
      : isJugnuTheme
        ? 'radial-gradient(circle, rgba(255,240,150,0.18) 0%, rgba(168,191,119,0.08) 38%, transparent 70%)'
      : '';
  const fieldBg = T.activeBg;
  const fieldBorder = T.inactiveBorder;
  const fieldBorderActive = T.activeBorder;
  const fieldLabelColor = T.subtitleColor;
  const footerText = mode === 'login'
    ? 'Manage forms, responses, and publishing from one workspace.'
    : mode === 'register'
      ? 'Start publishing forms and collecting responses in minutes.'
      : mode === 'forgot'
        ? 'A secure reset link will be sent to your email.'
        : 'Save your new password and continue to your workspace.';

  const isBusy = submitting || loginMut.isPending || registerMut.isPending || forgotPasswordMut.isPending || resetPasswordMut.isPending;

  const inputStyle = (active: boolean): React.CSSProperties => ({
    width: '100%',
    background: fieldBg,
    border: `1px solid ${active ? fieldBorderActive : fieldBorder}`,
    borderRadius: '14px',
    color: T.inputColor,
    fontFamily: APP_UI_FONT,
    fontSize: '15px',
    fontWeight: 600,
    padding: '14px 16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: active
      ? `0 0 0 4px ${fieldBorderActive}22`
      : 'none',
    letterSpacing: '0.01em',
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
        background: pageBackground,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: submitting ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.divider} 1px, transparent 1px), linear-gradient(90deg, ${T.divider} 1px, transparent 1px)`, backgroundSize: '88px 88px', opacity: 0.18, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-12%', left: '-8%', width: '44vw', height: '44vw', background: `radial-gradient(circle, ${ambientGlowA} 0%, transparent 68%)`, filter: 'blur(42px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: '-10%', bottom: '-16%', width: '40vw', height: '40vw', background: `radial-gradient(circle, ${ambientGlowB} 0%, transparent 70%)`, filter: 'blur(52px)', pointerEvents: 'none' }} />
      {hasThemeBackdropFx && (
        <>
          <div style={{ position: 'absolute', top: '8%', right: '8%', width: 260, height: 260, background: burstOverlayA, opacity: isJugnuTheme ? 0.82 : 0.72, filter: 'blur(26px)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 220, height: 220, background: burstOverlayB, opacity: isJugnuTheme ? 0.74 : 0.84, filter: 'blur(20px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: isJugnuTheme ? '16%' : '18%', left: isJugnuTheme ? '12%' : '18%', width: isJugnuTheme ? 150 : 120, height: isJugnuTheme ? 150 : 120, borderRadius: '50%', border: `1px solid ${T.activeBorder}55`, boxShadow: `0 0 40px ${T.activeBorder}33`, opacity: isJugnuTheme ? 0.28 : 0.5, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: burstOverlayC, opacity: isFirecrackerTheme ? 0.22 : isRainbowTheme ? 0.18 : 0.2, filter: isFirecrackerTheme ? 'blur(2px)' : 'blur(10px)', mixBlendMode: isFirecrackerTheme ? 'screen' : 'normal', pointerEvents: 'none' }} />
          {isFirecrackerTheme && (
            <>
              <div style={{ position: 'absolute', top: '14%', left: '22%', width: 180, height: 180, background: 'repeating-conic-gradient(from 0deg, rgba(255,196,0,0.36) 0deg 8deg, transparent 8deg 22deg)', opacity: 0.28, filter: 'blur(4px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '18%', right: '16%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,90,0,0.28) 0%, rgba(255,176,0,0.12) 30%, transparent 66%)', filter: 'blur(14px)', pointerEvents: 'none' }} />
            </>
          )}
          {isRainbowTheme && (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, transparent 16%, rgba(255,0,168,0.12) 30%, rgba(0,229,255,0.1) 52%, rgba(255,230,0,0.08) 72%, transparent 84%)', opacity: 0.7, filter: 'blur(14px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '16%', right: '18%', width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,47,255,0.22) 0%, rgba(0,229,255,0.12) 40%, transparent 70%)', filter: 'blur(16px)', pointerEvents: 'none' }} />
            </>
          )}
          {isJugnuTheme && (
            <>
              <div style={{ position: 'absolute', top: '18%', left: '24%', width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,240,150,0.9)', boxShadow: '0 0 28px rgba(255,240,150,0.55)', opacity: 0.75, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '28%', right: '22%', width: 14, height: 14, borderRadius: '50%', background: 'rgba(201,255,140,0.85)', boxShadow: '0 0 24px rgba(201,255,140,0.45)', opacity: 0.7, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '22%', left: '18%', width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,230,160,0.88)', boxShadow: '0 0 22px rgba(255,230,160,0.4)', opacity: 0.68, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '16%', right: '28%', width: 16, height: 16, borderRadius: '50%', background: 'rgba(168,191,119,0.82)', boxShadow: '0 0 22px rgba(168,191,119,0.38)', opacity: 0.66, pointerEvents: 'none' }} />
            </>
          )}
        </>
      )}

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 16, left: 20, zIndex: 20,
            background: backButtonBg, border: `1px solid ${backButtonBorder}`,
            borderRadius: 8, color: backButtonColor, fontSize: 12,
            fontWeight: 600, padding: '7px 14px', cursor: 'pointer',
            fontFamily: APP_UI_FONT, letterSpacing: '0.08em',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = backButtonHoverBg; e.currentTarget.style.color = backButtonHoverColor; }}
          onMouseLeave={e => { e.currentTarget.style.background = backButtonBg; e.currentTarget.style.color = backButtonColor; }}
        >
          ← Back
        </button>
      )}

      <div style={{ position: 'relative', zIndex: 5, width: 'min(460px, calc(100vw - 24px))', padding: '20px 12px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            position: 'relative', zIndex: 5,
            background: authPanelBg,
            border: `1px solid ${authPanelBorder}`,
            borderRadius: 30,
            padding: '26px',
            width: '100%',
            backdropFilter: 'blur(24px)',
            boxShadow: panelShadow,
            animation: shaking ? 'shake 0.5s ease-in-out' : 'login-card-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: cardAura, opacity: isLightTheme ? 1 : 0.9 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <FormVerseLogo size={28} showText={false} variant={logoVariant} />
              <div>
                <div style={{ fontFamily: APP_UI_FONT, fontSize: 14, fontWeight: 800, color: headingText, letterSpacing: '-0.03em' }}>FormVerse</div>
                <div style={{ fontFamily: APP_UI_FONT, fontSize: 10, fontWeight: 800, color: helperText, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{shellLabel}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: APP_UI_FONT, fontSize: 11, fontWeight: 800, color: cardAccent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Workspace access</div>
            <h2 style={{ fontFamily: APP_UI_FONT, fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 800, lineHeight: 0.92, color: headingText, margin: '0 0 12px', letterSpacing: '-0.06em' }}>{authHeading}</h2>
            <p style={{ fontFamily: APP_UI_FONT, fontSize: 14, lineHeight: 1.65, color: helperText, margin: 0, maxWidth: 360, fontWeight: 500 }}>{authSubheading}</p>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: topStripBg, border: `1px solid ${topStripBorder}`, borderRadius: 16, padding: '5px', position: 'relative', zIndex: 1 }}>
            {mode === 'login' || mode === 'register' ? (
              (['login', 'register'] as const).map(m => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                  style={{ flex: 1, background: mode === m ? T.tabActive : 'transparent', border: 'none', borderRadius: 11, color: mode === m ? T.tabActiveColor : helperText, fontFamily: APP_UI_FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', padding: '10px 12px', cursor: 'pointer', transition: 'all 0.22s', boxShadow: mode === m ? `0 10px 18px ${T.cardBorder}` : 'none' }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))
            ) : (
              <>
                <button type="button" onClick={() => switchMode('login')}
                  style={{ flex: 1, background: T.tabActive, border: 'none', borderRadius: 11, color: T.tabActiveColor, fontFamily: APP_UI_FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', padding: '10px 12px', cursor: 'pointer', transition: 'all 0.22s', boxShadow: `0 10px 18px ${T.cardBorder}` }}>
                  Sign in
                </button>
                <button type="button" onClick={() => switchMode('register')}
                  style={{ flex: 1, background: 'transparent', border: 'none', borderRadius: 11, color: helperText, fontFamily: APP_UI_FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', padding: '10px 12px', cursor: 'pointer', transition: 'all 0.22s' }}>
                  Create account
                </button>
              </>
            )}
          </div>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 30, boxShadow: `inset 0 1px 0 ${isLightTheme ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.04)'}` }} />

        {mode === 'register' && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: fieldLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Display name</div>
            <input type="text" placeholder={isLibrary ? 'Your scholar name...' : isCosmic ? 'Your explorer name...' : 'Your explorer name...'} value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onFocus={() => setNameActive(true)} onBlur={() => setNameActive(false)}
              style={inputStyle(nameActive)} maxLength={60} autoComplete="name" autoFocus={mode === 'register'} />
          </div>
        )}

        {mode !== 'reset' && (
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: fieldLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Email address</div>
          <input type="email" placeholder="Your email address..." value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onFocus={() => setEmailActive(true)} onBlur={() => setEmailActive(false)}
            style={inputStyle(emailActive)} maxLength={120} autoComplete="email" autoFocus={mode === 'login' || mode === 'forgot'} />
        </div>
        )}

        {/* Password field */}
        {mode !== 'forgot' && (
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: fieldLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Password</div>
          <input type="password" placeholder={isLibrary ? 'Your secret cipher...' : isCosmic ? 'Your secret passcode...' : 'Secret temple code...'} value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onFocus={() => setPassActive(true)} onBlur={() => setPassActive(false)}
            style={inputStyle(passActive)} maxLength={64} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} autoFocus={mode === 'reset'} />
        </div>
        )}

        {mode === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-2px', marginBottom: '12px' }}>
            <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: cardAccent, cursor: 'pointer', fontFamily: APP_UI_FONT, fontSize: '12px', fontWeight: 700, letterSpacing: '0.01em', padding: 0 }}>
              Forgot password?
            </button>
          </div>
        )}

        {/* Confirm password (register only) */}
        {(mode === 'register' || mode === 'reset') && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: fieldLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Confirm password</div>
            <input type="password" placeholder="Confirm your code..." value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              onFocus={() => setConfirmActive(true)} onBlur={() => setConfirmActive(false)}
              style={inputStyle(confirmActive)} maxLength={64} autoComplete="new-password" />
          </div>
        )}

        {/* Error */}
        <div style={{ height: '18px', marginBottom: '10px', textAlign: 'center' }}>
          {error && <span style={{ fontFamily: APP_UI_FONT, fontSize: '12px', color: '#ff7070', letterSpacing: '0.06em', animation: 'fade-in 0.2s ease-out' }}>⚠️ {error}</span>}
          {!error && notice && <span style={{ fontFamily: APP_UI_FONT, fontSize: '12px', color: '#86efac', letterSpacing: '0.05em', animation: 'fade-in 0.2s ease-out' }}>✓ {notice}</span>}
        </div>

        <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${chipBorder}, transparent)`, marginBottom: '16px' }} />

        {/* Submit */}
        <button type="submit" className="tr-btn" disabled={isBusy} style={{ width: '100%', background: T.submitBtn, color: T.submitColor, fontFamily: APP_UI_FONT, fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1, padding: '15px', letterSpacing: '-0.025em', fontWeight: 900, borderRadius: '16px', marginBottom: '12px', boxShadow: `0 14px 28px ${T.cardBorder}`, opacity: isBusy ? 0.7 : 1, cursor: isBusy ? 'not-allowed' : 'pointer' }}>
          {isBusy ? 'Authenticating...' : currentSubmitText}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <div style={{ fontSize: 12.5, color: helperText }}>{switchPrompt} <button type="button" onClick={switchAction} style={{ background: 'none', border: 'none', color: headingText, fontFamily: APP_UI_FONT, fontSize: 12.5, fontWeight: 700, padding: 0, cursor: 'pointer' }}>{switchActionLabel}</button></div>
          <div style={{ fontSize: 11, color: helperText }}>Secure access</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <span style={{ fontFamily: APP_UI_FONT, fontSize: '11px', color: helperText, lineHeight: 1.6 }}>
            {footerText}
          </span>
        </div>
      </form>
      </div>
    </div>
  );
}
