type Props = {
  size?: number;
  showText?: boolean;
  textSize?: number;
  variant?: 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu' | 'formverse' | 'globe' | 'library' | 'temple-run';
};

export function FormVerseLogo({ size = 38, showText = true, textSize = 14, variant = 'dark' }: Props) {
  const id = `fv-${variant}-${size}`;
  const palette = {
    dark: {
      iconShadow: 'drop-shadow(0 0 22px rgba(255,166,92,0.22))',
      wordmarkShadow: '0 18px 34px rgba(8, 6, 4, 0.36)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(16, 14, 12, 0.92), rgba(20, 16, 14, 0.58))',
      wordmarkBorder: 'rgba(255, 202, 110, 0.22)',
      wordmarkGlow: 'rgba(198,94,120,0.12)',
      shellStart: '#191218',
      shellEnd: '#130c14',
      rimStart: '#fff0c0',
      rimMid: '#ffca6e',
      rimEnd: '#c65e78',
      fieldIdle: 'rgba(255,255,255,0.1)',
      fieldActive: 'rgba(255,247,238,0.98)',
      fieldTyping: '#c65e78',
      cursor: '#ffca6e',
      ember: '#d86e88',
      formColor: 'rgba(255, 245, 232, 0.96)',
      verseGradient: 'linear-gradient(120deg, #fff8ef 0%, #ffca6e 22%, #d86e88 58%, #7c3248 100%)',
      subtitleColor: 'rgba(224, 216, 206, 0.66)',
    },
    light: {
      iconShadow: 'drop-shadow(0 0 18px rgba(233,113,72,0.18))',
      wordmarkShadow: '0 16px 30px rgba(214, 121, 82, 0.14)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(255, 252, 246, 0.98), rgba(239, 248, 245, 0.94))',
      wordmarkBorder: 'rgba(233, 113, 72, 0.2)',
      wordmarkGlow: 'rgba(45,184,165,0.18)',
      shellStart: '#fffdf9',
      shellEnd: '#eef6f3',
      rimStart: '#2e1c18',
      rimMid: '#e97148',
      rimEnd: '#2db8a5',
      fieldIdle: 'rgba(17,17,17,0.08)',
      fieldActive: 'rgba(61,42,35,0.9)',
      fieldTyping: '#e97148',
      cursor: '#2db8a5',
      ember: '#ffcb6b',
      formColor: '#2b1d18',
      verseGradient: 'linear-gradient(120deg, #df6546 0%, #f29a52 34%, #f0c866 66%, #22a89f 100%)',
      subtitleColor: 'rgba(92, 67, 56, 0.64)',
    },
    formverse: {
      iconShadow: 'drop-shadow(0 0 22px rgba(255,140,66,0.22))',
      wordmarkShadow: '0 18px 34px rgba(8, 6, 4, 0.38)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(17, 12, 10, 0.92), rgba(10, 18, 22, 0.58))',
      wordmarkBorder: 'rgba(255, 140, 66, 0.2)',
      wordmarkGlow: 'rgba(34,211,238,0.12)',
      shellStart: '#18110f',
      shellEnd: '#0d0f12',
      rimStart: '#ffd166',
      rimMid: '#ff8c42',
      rimEnd: '#22d3ee',
      fieldIdle: 'rgba(255,255,255,0.11)',
      fieldActive: 'rgba(255,247,238,0.98)',
      fieldTyping: '#22d3ee',
      cursor: '#ffd166',
      ember: '#ff8c42',
      formColor: 'rgba(255, 244, 232, 0.98)',
      verseGradient: 'linear-gradient(120deg, #fff8ef 0%, #ffd166 26%, #ff8c42 62%, #22d3ee 100%)',
      subtitleColor: 'rgba(236, 207, 178, 0.68)',
    },
    globe: {
      iconShadow: 'drop-shadow(0 0 22px rgba(0,170,255,0.24))',
      wordmarkShadow: '0 18px 34px rgba(2, 14, 34, 0.34)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(4, 18, 40, 0.9), rgba(4, 24, 50, 0.54))',
      wordmarkBorder: 'rgba(0, 170, 255, 0.2)',
      wordmarkGlow: 'rgba(0,229,255,0.16)',
      shellStart: '#071828',
      shellEnd: '#040d18',
      rimStart: '#38bdf8',
      rimMid: '#22d3ee',
      rimEnd: '#93c5fd',
      fieldIdle: 'rgba(255,255,255,0.1)',
      fieldActive: 'rgba(239,252,255,0.98)',
      fieldTyping: '#0ea5e9',
      cursor: '#7dd3fc',
      ember: '#38bdf8',
      formColor: 'rgba(236, 249, 255, 0.96)',
      verseGradient: 'linear-gradient(120deg, #ffffff 0%, #38bdf8 28%, #22d3ee 62%, #93c5fd 100%)',
      subtitleColor: 'rgba(182, 221, 255, 0.66)',
    },
    library: {
      iconShadow: 'drop-shadow(0 0 22px rgba(168,85,247,0.24))',
      wordmarkShadow: '0 18px 34px rgba(20, 4, 34, 0.36)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(24, 8, 42, 0.9), rgba(18, 10, 34, 0.56))',
      wordmarkBorder: 'rgba(192, 132, 252, 0.22)',
      wordmarkGlow: 'rgba(255,215,0,0.14)',
      shellStart: '#170726',
      shellEnd: '#0e0618',
      rimStart: '#a855f7',
      rimMid: '#facc15',
      rimEnd: '#d8b4fe',
      fieldIdle: 'rgba(255,255,255,0.1)',
      fieldActive: 'rgba(255,249,235,0.98)',
      fieldTyping: '#a855f7',
      cursor: '#facc15',
      ember: '#facc15',
      formColor: 'rgba(248, 240, 255, 0.96)',
      verseGradient: 'linear-gradient(120deg, #ffffff 0%, #a855f7 26%, #facc15 62%, #d8b4fe 100%)',
      subtitleColor: 'rgba(224, 200, 255, 0.66)',
    },
    'temple-run': {
      iconShadow: 'drop-shadow(0 0 20px rgba(255,215,0,0.2))',
      wordmarkShadow: '0 18px 34px rgba(20, 10, 2, 0.36)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(28, 14, 4, 0.9), rgba(18, 10, 2, 0.54))',
      wordmarkBorder: 'rgba(205, 133, 63, 0.22)',
      wordmarkGlow: 'rgba(255,215,0,0.14)',
      shellStart: '#1a1005',
      shellEnd: '#0d0803',
      rimStart: '#cd853f',
      rimMid: '#ffd700',
      rimEnd: '#a8d870',
      fieldIdle: 'rgba(255,255,255,0.1)',
      fieldActive: 'rgba(255,249,228,0.98)',
      fieldTyping: '#cd853f',
      cursor: '#ffd700',
      ember: '#a8d870',
      formColor: 'rgba(247, 238, 214, 0.96)',
      verseGradient: 'linear-gradient(120deg, #fff9e8 0%, #cd853f 26%, #ffd700 58%, #a8d870 100%)',
      subtitleColor: 'rgba(214, 222, 170, 0.66)',
    },
    rainbow: {
      iconShadow: 'drop-shadow(0 0 18px rgba(255,0,168,0.24))',
      wordmarkShadow: '0 16px 30px rgba(8, 6, 28, 0.42)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(18, 8, 42, 0.88), rgba(8, 16, 40, 0.5))',
      wordmarkBorder: 'rgba(255, 0, 168, 0.16)',
      wordmarkGlow: 'rgba(0,229,255,0.14)',
      shellStart: '#180726',
      shellEnd: '#07122c',
      rimStart: '#ff00a8',
      rimMid: '#00e5ff',
      rimEnd: '#ffee00',
      fieldIdle: 'rgba(255,255,255,0.12)',
      fieldActive: 'rgba(255,255,255,0.96)',
      fieldTyping: '#00e5ff',
      cursor: '#ffee00',
      ember: '#ff00a8',
      formColor: 'rgba(255,255,255,0.96)',
      verseGradient: 'linear-gradient(120deg, #ff00a8 0%, #8b2fff 22%, #00e5ff 46%, #8dff00 70%, #ffee00 100%)',
      subtitleColor: 'rgba(242,240,255,0.66)',
    },
    firecracker: {
      iconShadow: 'drop-shadow(0 0 16px rgba(255,120,0,0.22))',
      wordmarkShadow: '0 14px 28px rgba(28, 8, 0, 0.36)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(38, 12, 0, 0.82), rgba(56, 18, 0, 0.44))',
      wordmarkBorder: 'rgba(255, 153, 0, 0.15)',
      wordmarkGlow: 'rgba(255,184,0,0.16)',
      shellStart: '#2b0900',
      shellEnd: '#431500',
      rimStart: '#ff3300',
      rimMid: '#ff9900',
      rimEnd: '#ffee55',
      fieldIdle: 'rgba(255,255,255,0.1)',
      fieldActive: 'rgba(255,247,228,0.92)',
      fieldTyping: '#ff9900',
      cursor: '#ffee55',
      ember: '#ffee55',
      formColor: 'rgba(255,244,220,0.92)',
      verseGradient: 'linear-gradient(120deg, #ff3300 0%, #ff7a00 45%, #ffd000 100%)',
      subtitleColor: 'rgba(255,210,150,0.56)',
    },
    jugnu: {
      iconShadow: 'drop-shadow(0 0 16px rgba(255,214,92,0.14))',
      wordmarkShadow: '0 14px 28px rgba(20, 14, 0, 0.3)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(26, 20, 2, 0.8), rgba(34, 28, 8, 0.42))',
      wordmarkBorder: 'rgba(255, 214, 92, 0.14)',
      wordmarkGlow: 'rgba(255,214,92,0.14)',
      shellStart: '#0d1405',
      shellEnd: '#15240a',
      rimStart: '#c58b00',
      rimMid: '#ffd65c',
      rimEnd: '#fff0a6',
      fieldIdle: 'rgba(255,255,255,0.09)',
      fieldActive: 'rgba(255,249,216,0.92)',
      fieldTyping: '#ffd65c',
      cursor: '#fff0a6',
      ember: '#fff0a6',
      formColor: 'rgba(255,244,205,0.92)',
      verseGradient: 'linear-gradient(120deg, #c58b00 0%, #ffd65c 52%, #fff0a6 100%)',
      subtitleColor: 'rgba(255,230,160,0.48)',
    },
  }[variant];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>

      {/* ── SVG Icon ── */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: palette.iconShadow }}>
        <defs>
          <linearGradient id={`${id}-rim`} x1="7" y1="7" x2="33" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.rimStart} />
            <stop offset="55%" stopColor={palette.rimMid} />
            <stop offset="100%" stopColor={palette.rimEnd} />
          </linearGradient>
          <radialGradient id={`${id}-aura`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(18)">
            <stop offset="0%" stopColor={palette.rimMid} stopOpacity="0.34" />
            <stop offset="55%" stopColor={palette.rimStart} stopOpacity="0.18" />
            <stop offset="100%" stopColor={palette.rimEnd} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-shell`} x1="10" y1="6" x2="30" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.shellStart} />
            <stop offset="100%" stopColor={palette.shellEnd} />
          </linearGradient>
          <linearGradient id={`${id}-active`} x1="12" y1="23.6" x2="27.9" y2="28.9" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.fieldActive} />
            <stop offset="100%" stopColor="white" stopOpacity="0.88" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-glow-sm`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="20" cy="20" r="16.8" fill={`url(#${id}-aura)`} />
        <circle cx="20" cy="20" r="15.6" fill={`url(#${id}-rim)`} opacity="0.14" />
        <path d="M12.2 6.8H24.8L30.8 12.8V29.4C30.8 31.17 29.37 32.6 27.6 32.6H12.2C10.43 32.6 9 31.17 9 29.4V10C9 8.23 10.43 6.8 12.2 6.8Z" fill={`url(#${id}-shell)`} stroke={`url(#${id}-rim)`} strokeWidth="1.5" />
        <path d="M24.8 6.8V10.5C24.8 11.77 25.83 12.8 27.1 12.8H30.8" stroke={`url(#${id}-rim)`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        <path d="M24.8 6.8L30.8 12.8H27.3C25.92 12.8 24.8 11.68 24.8 10.3V6.8Z" fill={`url(#${id}-rim)`} opacity="0.18" />

        <rect x="12.35" y="11.1" width="8.9" height="2.1" rx="1.05" fill={palette.fieldIdle} />
        <rect x="12.35" y="14.9" width="13.4" height="1.85" rx="0.92" fill={palette.fieldIdle} opacity="0.82" />

        <rect x="12.15" y="19.05" width="2.9" height="2.9" rx="0.9" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.25" />
        <path d="M13.02 20.48L13.82 21.26L15.18 19.72" stroke={`url(#${id}-rim)`} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16.55" y="19.2" width="11.6" height="2.55" rx="1.27" fill={palette.fieldIdle} />

        <rect x="12" y="23.65" width="15.9" height="5.25" rx="2.62" fill={`url(#${id}-active)`} fillOpacity="0.98" filter={`url(#${id}-glow)`}>
          <animate attributeName="opacity" values="0.9;1;0.93" dur="2.4s" repeatCount="indefinite" />
        </rect>
        <path d="M13.95 25.2H15.95" stroke={`url(#${id}-rim)`} strokeWidth="1.35" strokeLinecap="round" />
        <path d="M14.95 24.2V26.2" stroke={`url(#${id}-rim)`} strokeWidth="1.35" strokeLinecap="round" />

        <text x="17.15" y="27.15" fill={palette.fieldTyping} fontFamily="Manrope, sans-serif" fontSize="3.15" fontWeight="800" letterSpacing="0.04">
          F
          <animate attributeName="opacity" values="0;1;1;1;1;0" dur="3s" repeatCount="indefinite" />
        </text>
        <text x="19.25" y="27.15" fill={palette.fieldTyping} fontFamily="Manrope, sans-serif" fontSize="3.15" fontWeight="800" letterSpacing="0.04">
          O
          <animate attributeName="opacity" values="0;0;1;1;1;0" dur="3s" repeatCount="indefinite" />
        </text>
        <text x="21.45" y="27.15" fill={palette.fieldTyping} fontFamily="Manrope, sans-serif" fontSize="3.15" fontWeight="800" letterSpacing="0.04">
          R
          <animate attributeName="opacity" values="0;0;0;1;1;0" dur="3s" repeatCount="indefinite" />
        </text>
        <text x="23.68" y="27.15" fill={palette.fieldTyping} fontFamily="Manrope, sans-serif" fontSize="3.15" fontWeight="800" letterSpacing="0.04">
          M
          <animate attributeName="opacity" values="0;0;0;0;1;0" dur="3s" repeatCount="indefinite" />
        </text>
        <rect x="18.72" y="24.4" width="0.85" height="2.65" rx="0.42" fill={palette.cursor}>
          <animate attributeName="x" values="18.72;20.82;22.98;25.12;26.2;18.72" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;0.3;1;0.45;1" dur="0.9s" repeatCount="indefinite" />
        </rect>
        <rect x="12.15" y="30.1" width="8.6" height="1.75" rx="0.87" fill={palette.fieldIdle} />
        <rect x="22.3" y="30.1" width="5.6" height="1.75" rx="0.87" fill={palette.fieldIdle} opacity="0.72" />
        <path d="M29.1 18.1L30.3 19.3L29.1 20.5L27.9 19.3L29.1 18.1Z" fill={palette.ember} filter={`url(#${id}-glow-sm)`} />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div style={{ lineHeight: 1, padding: '6px 10px 7px', borderRadius: 14, background: palette.wordmarkPlate, border: `1px solid ${palette.wordmarkBorder}`, boxShadow: `${palette.wordmarkShadow}, 0 0 0 1px ${palette.wordmarkGlow} inset`, backdropFilter: 'blur(10px)' }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: textSize,
            fontWeight: 800,
            letterSpacing: '-0.045em',
            display: 'flex',
            alignItems: 'baseline',
          }}>
            <span style={{ color: palette.formColor }}>Form</span>
            <span style={{
              background: palette.verseGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Verse</span>
          </div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: Math.max(8, textSize * 0.56),
            color: palette.subtitleColor,
            letterSpacing: '0.14em',
            marginTop: 4,
            textTransform: 'uppercase',
          }}>
            Form Design Platform
          </div>
        </div>
      )}
    </div>
  );
}
