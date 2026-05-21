type Props = {
  size?: number;
  showText?: boolean;
  textSize?: number;
  variant?: 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu';
};

export function FormVerseLogo({ size = 38, showText = true, textSize = 14, variant = 'dark' }: Props) {
  const id = `fv-${variant}-${size}`;
  const palette = {
    dark: {
      iconShadow: 'drop-shadow(0 0 8px rgba(124,58,237,0.45))',
      wordmarkShadow: '0 10px 24px rgba(4, 2, 18, 0.32)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(10, 8, 28, 0.62), rgba(14, 12, 34, 0.3))',
      wordmarkBorder: 'rgba(124, 58, 237, 0.18)',
      formTextShadow: '0 1px 0 rgba(255,255,255,0.06), 0 0 10px rgba(10, 6, 24, 0.38)',
      verseTextShadow: '0 0 14px rgba(8, 4, 26, 0.38)',
      ringStart: '#7c3aed',
      ringMid: '#00e5ff',
      ringEnd: '#ff0080',
      bodyStart: '#1a0845',
      bodyEnd: '#021730',
      formColor: 'rgba(215,205,255,0.78)',
      verseGradient: 'linear-gradient(120deg, #7c3aed 0%, #00e5ff 55%, #ff0080 100%)',
      subtitleColor: 'rgba(167,139,250,0.32)',
    },
    light: {
      iconShadow: 'drop-shadow(0 0 6px rgba(204,68,0,0.22))',
      wordmarkShadow: '0 10px 22px rgba(179, 92, 20, 0.12)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(255, 249, 233, 0.88), rgba(255, 239, 214, 0.58))',
      wordmarkBorder: 'rgba(204, 68, 0, 0.14)',
      formTextShadow: '0 1px 0 rgba(255,255,255,0.82), 0 3px 10px rgba(0, 0, 0, 0.1)',
      verseTextShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      ringStart: '#cc4400',
      ringMid: '#ff8800',
      ringEnd: '#cc0080',
      bodyStart: '#fff7d1',
      bodyEnd: '#ffe6b3',
      formColor: '#111111',
      verseGradient: 'linear-gradient(120deg, #111111 0%, #333333 35%, #cc4400 72%, #ff8800 100%)',
      subtitleColor: 'rgba(17,17,17,0.62)',
    },
    rainbow: {
      iconShadow: 'drop-shadow(0 0 8px rgba(255,0,180,0.38))',
      wordmarkShadow: '0 12px 28px rgba(16, 8, 42, 0.34)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(22, 12, 46, 0.72), rgba(10, 18, 50, 0.38))',
      wordmarkBorder: 'rgba(255, 255, 255, 0.14)',
      formTextShadow: '0 1px 0 rgba(255,255,255,0.08), 0 0 12px rgba(20, 10, 40, 0.42)',
      verseTextShadow: '0 0 16px rgba(18, 8, 42, 0.42)',
      ringStart: '#ff0080',
      ringMid: '#00e5ff',
      ringEnd: '#ffee00',
      bodyStart: '#25002e',
      bodyEnd: '#0a1336',
      formColor: 'rgba(255,255,255,0.92)',
      verseGradient: 'linear-gradient(120deg, #ff0080 0%, #ff8800 24%, #ffee00 48%, #00dd55 72%, #00aaff 100%)',
      subtitleColor: 'rgba(255,255,255,0.62)',
    },
    firecracker: {
      iconShadow: 'drop-shadow(0 0 8px rgba(255,120,0,0.42))',
      wordmarkShadow: '0 12px 28px rgba(28, 8, 0, 0.34)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(38, 12, 0, 0.74), rgba(56, 18, 0, 0.38))',
      wordmarkBorder: 'rgba(255, 153, 0, 0.16)',
      formTextShadow: '0 1px 0 rgba(255,255,255,0.08), 0 0 12px rgba(22, 8, 0, 0.42)',
      verseTextShadow: '0 0 16px rgba(22, 8, 0, 0.38)',
      ringStart: '#ff3300',
      ringMid: '#ff9900',
      ringEnd: '#ffee55',
      bodyStart: '#2b0900',
      bodyEnd: '#3d1400',
      formColor: 'rgba(255,244,220,0.92)',
      verseGradient: 'linear-gradient(120deg, #ff3300 0%, #ff7a00 45%, #ffd000 100%)',
      subtitleColor: 'rgba(255,210,150,0.58)',
    },
    jugnu: {
      iconShadow: 'drop-shadow(0 0 8px rgba(255,214,92,0.26))',
      wordmarkShadow: '0 12px 28px rgba(20, 14, 0, 0.28)',
      wordmarkPlate: 'linear-gradient(135deg, rgba(26, 20, 2, 0.74), rgba(34, 28, 8, 0.38))',
      wordmarkBorder: 'rgba(255, 214, 92, 0.16)',
      formTextShadow: '0 1px 0 rgba(255,255,255,0.06), 0 0 12px rgba(24, 18, 0, 0.34)',
      verseTextShadow: '0 0 16px rgba(24, 18, 0, 0.28)',
      ringStart: '#c58b00',
      ringMid: '#ffd65c',
      ringEnd: '#fff0a6',
      bodyStart: '#0c1404',
      bodyEnd: '#132109',
      formColor: 'rgba(255,244,205,0.92)',
      verseGradient: 'linear-gradient(120deg, #c58b00 0%, #ffd65c 52%, #fff0a6 100%)',
      subtitleColor: 'rgba(255,230,160,0.5)',
    },
  }[variant];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>

      {/* ── SVG Icon ── */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: palette.iconShadow }}>
        <defs>
          <linearGradient id={`${id}-ring`} x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.ringStart} />
            <stop offset="50%" stopColor={palette.ringMid} />
            <stop offset="100%" stopColor={palette.ringEnd} />
          </linearGradient>
          <linearGradient id={`${id}-body`} x1="8" y1="6" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.bodyStart} />
            <stop offset="100%" stopColor={palette.bodyEnd} />
          </linearGradient>
          <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-glow-sm`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Tilted orbital ring */}
        <ellipse cx="20" cy="20" rx="18.5" ry="7"
          stroke={`url(#${id}-ring)`} strokeWidth="1.2"
          strokeDasharray="3.5 2.8"
          opacity="0.6"
          transform="rotate(-28 20 20)" />

        {/* Document body */}
        <rect x="10" y="7" width="20" height="26" rx="3"
          fill={`url(#${id}-body)`}
          stroke={`url(#${id}-ring)`} strokeWidth="1.6" />

        {/* Form field lines */}
        <line x1="14.5" y1="13.5" x2="25.5" y2="13.5"
          stroke="rgba(255,255,255,0.88)" strokeWidth="1.7" strokeLinecap="round" />
        <line x1="14.5" y1="19" x2="24" y2="19"
          stroke="rgba(255,255,255,0.52)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14.5" y1="24" x2="20.5" y2="24"
          stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cyan star sparkle — top right */}
        <circle cx="30.5" cy="8.5" r="1.7"
          fill="#00e5ff" filter={`url(#${id}-glow-sm)`} />
        <line x1="30.5" y1="5.5" x2="30.5" y2="7.3"
          stroke="#00e5ff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
        <line x1="33.5" y1="8.5" x2="31.8" y2="8.5"
          stroke="#00e5ff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
        <line x1="32.6" y1="6.5" x2="31.5" y2="7.6"
          stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />
        <line x1="28.4" y1="6.5" x2="29.5" y2="7.6"
          stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />

        {/* Purple planet — bottom left */}
        <circle cx="8.5" cy="30.5" r="2"
          fill="#a78bfa" filter={`url(#${id}-glow-sm)`} />
        <ellipse cx="8.5" cy="30.5" rx="4.5" ry="1.6"
          stroke="#a78bfa" strokeWidth="0.8" fill="none" opacity="0.38" />

        {/* Gold dot — tiny top left */}
        <circle cx="7.5" cy="11" r="1"
          fill="#ffd700" opacity="0.65" filter={`url(#${id}-glow-sm)`} />

        {/* Traveling orbital dot — top right arc position */}
        <circle cx="34.5" cy="15" r="2.3"
          fill={`url(#${id}-ring)`} filter={`url(#${id}-glow)`} />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div style={{ lineHeight: 1, padding: '4px 8px 5px', borderRadius: 12, background: palette.wordmarkPlate, border: `1px solid ${palette.wordmarkBorder}`, boxShadow: palette.wordmarkShadow, backdropFilter: 'blur(10px)' }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: textSize,
            fontWeight: 900,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'baseline',
          }}>
            <span style={{ color: palette.formColor, textShadow: palette.formTextShadow }}>Form</span>
            <span style={{
              color: palette.ringMid,
              background: palette.verseGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: palette.verseTextShadow,
            }}>Verse</span>
          </div>
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: Math.max(8, textSize * 0.65),
            color: palette.subtitleColor,
            letterSpacing: '0.22em',
            marginTop: 2,
            textTransform: 'uppercase',
          }}>
            Cinematic Form Builder
          </div>
        </div>
      )}
    </div>
  );
}
