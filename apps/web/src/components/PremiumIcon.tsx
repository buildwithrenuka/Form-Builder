import type { CSSProperties } from 'react';

type PremiumIconProps = {
  token: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
};

function normalizeToken(token: string) {
  return token.replace(/\uFE0F/g, '');
}

function svgStyle(size: number, style?: CSSProperties): CSSProperties {
  return {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  };
}

function IconFrame({ children, size = 16, stroke = 1.85, style }: PremiumIconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={svgStyle(size, style)}
    >
      {children}
    </svg>
  );
}

export function PremiumIcon({ token, size = 16, stroke = 1.85, style }: PremiumIconProps) {
  switch (normalizeToken(token)) {
    case '📁':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M3.5 7.5h5l2-2h10v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /><path d="M3.5 9.5h17" /></IconFrame>;
    case '🕘':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /><path d="M18.5 6.5 20 5" /></IconFrame>;
    case '🕐':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3.5 2" /></IconFrame>;
    case '✅':
    case '✓':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.3 2.3 4.7-5.1" /></IconFrame>;
    case '⚙':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="3.1" /><path d="M12 3.7v2.1" /><path d="M12 18.2v2.1" /><path d="m5.9 5.9 1.5 1.5" /><path d="m16.6 16.6 1.5 1.5" /><path d="M3.7 12h2.1" /><path d="M18.2 12h2.1" /><path d="m5.9 18.1 1.5-1.5" /><path d="m16.6 7.4 1.5-1.5" /></IconFrame>;
    case '✦':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 3.5 13.9 10 20.5 12l-6.6 2-1.9 6.5-1.9-6.5-6.6-2 6.6-2z" /></IconFrame>;
    case '🌙':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M15.8 4.8a7.8 7.8 0 1 0 3.4 14.7A8.6 8.6 0 0 1 15.8 4.8Z" /></IconFrame>;
    case '☀':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="3.6" /><path d="M12 2.8v2.3" /><path d="M12 18.9v2.3" /><path d="m5.5 5.5 1.6 1.6" /><path d="m16.9 16.9 1.6 1.6" /><path d="M2.8 12h2.3" /><path d="M18.9 12h2.3" /><path d="m5.5 18.5 1.6-1.6" /><path d="m16.9 7.1 1.6-1.6" /></IconFrame>;
    case '🌈':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M4 16a8 8 0 0 1 16 0" /><path d="M7 16a5 5 0 0 1 10 0" /><path d="M10 16a2 2 0 0 1 4 0" /></IconFrame>;
    case '🎆':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 4v6" /><path d="M12 14v6" /><path d="M4 12h6" /><path d="M14 12h6" /><path d="m6.3 6.3 4.2 4.2" /><path d="m13.5 13.5 4.2 4.2" /><path d="m17.7 6.3-4.2 4.2" /><path d="m10.5 13.5-4.2 4.2" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></IconFrame>;
    case '🧩':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></IconFrame>;
    case '📦':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 3.8 19 7.4v9.2L12 20.2 5 16.6V7.4z" /><path d="M12 20.2V11.8" /><path d="M5 7.4 12 11.8 19 7.4" /></IconFrame>;
    case '📋':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="5" y="5.5" width="14" height="15" rx="2" /><path d="M9 5.5V4.7A1.7 1.7 0 0 1 10.7 3h2.6A1.7 1.7 0 0 1 15 4.7v.8" /><path d="M8.5 10h7" /><path d="M8.5 14h7" /></IconFrame>;
    case '📤':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 15V5" /><path d="m8.5 8.5 3.5-3.5 3.5 3.5" /><path d="M5 15.5v2a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2" /></IconFrame>;
    case '📥':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 5v10" /><path d="m8.5 11.5 3.5 3.5 3.5-3.5" /><path d="M5 15.5v2A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-2" /></IconFrame>;
    case '🔗':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M10 14 8 16a3 3 0 0 1-4.2-4.2l2.2-2.2A3 3 0 0 1 10.2 9" /><path d="M14 10l2-2a3 3 0 0 1 4.2 4.2L18 14.4A3 3 0 0 1 13.8 15" /><path d="M9 12h6" /></IconFrame>;
    case '🌐':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="8" /><path d="M4.5 12h15" /><path d="M12 4a12 12 0 0 1 0 16" /><path d="M12 4a12 12 0 0 0 0 16" /></IconFrame>;
    case '🔍':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="11" cy="11" r="5.5" /><path d="m16 16 3.5 3.5" /></IconFrame>;
    case '🔭':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 18h10" /><path d="m6.2 14.5 7.8-7.8 3.6 3.6-7.8 7.8" /><path d="M14 6.7 17 4l3 3-2.7 2.7" /><path d="m8.4 12.3-2.2 5.7" /><path d="m13.7 17.6 1 2.4" /></IconFrame>;
    case '👁':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M2.8 12s3.4-5.3 9.2-5.3 9.2 5.3 9.2 5.3-3.4 5.3-9.2 5.3S2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.4" /></IconFrame>;
    case '🙈':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M2.8 12s3.4-5.3 9.2-5.3 9.2 5.3 9.2 5.3-3.4 5.3-9.2 5.3S2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.4" /><path d="M4 4 20 20" /></IconFrame>;
    case '🧹':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M14 4 6.8 11.2" /><path d="m13 5 6 6" /><path d="M6.8 11.2 4 14l6 6 2.8-2.8" /><path d="M9.5 18.5 4.8 13.8" /></IconFrame>;
    case '🚪':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 4.5h10v15H5z" /><path d="M15 12h5" /><path d="m17 9 3 3-3 3" /><circle cx="9.5" cy="12" r=".8" fill="currentColor" stroke="none" /></IconFrame>;
    case '⚠':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M12 4.2 20 18H4z" /><path d="M12 9v4.5" /><circle cx="12" cy="16.4" r=".8" fill="currentColor" stroke="none" /></IconFrame>;
    case '📊':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 19.2h14" /><path d="M7.5 16V11" /><path d="M12 16V7.5" /><path d="M16.5 16v-5" /></IconFrame>;
    case '🛠':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="m4.5 18.5 5.6-5.6" /><path d="m13.7 6.3 4 4" /><path d="m12.3 7.7 4-4 1.4 1.4-4 4" /><path d="M7.7 12.3 3.8 8.4 6.6 5.6l3.9 3.9" /></IconFrame>;
    case '🏛':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M4 20h16" /><path d="M6 10h12" /><path d="M12 4 4.5 8h15Z" /><path d="M7.5 10v7" /><path d="M12 10v7" /><path d="M16.5 10v7" /></IconFrame>;
    case '✈':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M21 5 3 12l7 2 2 7 9-16Z" /><path d="M10 14 21 5" /></IconFrame>;
    case '📚':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5.5 6.5A2.5 2.5 0 0 1 8 4h10.5v14H8a2.5 2.5 0 0 0-2.5 2.5" /><path d="M5.5 6.5V20" /><path d="M10 7.5h5.5" /><path d="M10 11h5.5" /></IconFrame>;
    case '🚀':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M14.5 5.2c2.8-.4 4.8-.2 4.8-.2s.2 2-.2 4.8l-4.4 4.4-4.6-4.6Z" /><path d="m10.1 9.6-4.4 4.4s-.2-2 .2-4.8 4.8-.2 4.8-.2" /><path d="m14.8 14.3 3.5 3.5" /><path d="m9.7 19.4-5.1 1 1-5.1 2.4-2.4 3.7 3.7Z" /><circle cx="14.3" cy="9.7" r="1.3" /></IconFrame>;
    case '⏳':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M7 4h10" /><path d="M7 20h10" /><path d="M8 4c0 3 3.5 4.2 4 4.5.5-.3 4-1.5 4-4.5" /><path d="M8 20c0-3 3.5-4.2 4-4.5.5.3 4 1.5 4 4.5" /></IconFrame>;
    case '🔒':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M8.5 11V8.6A3.5 3.5 0 0 1 12 5a3.5 3.5 0 0 1 3.5 3.6V11" /></IconFrame>;
    case '📝':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M4.5 18.5 9 17l9-9a2 2 0 1 0-2.8-2.8l-9 9z" /><path d="M13.5 6.5 17.5 10.5" /></IconFrame>;
    case '📄':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M7 3.8h7l4 4v12.4a1.8 1.8 0 0 1-1.8 1.8H7a1.8 1.8 0 0 1-1.8-1.8V5.6A1.8 1.8 0 0 1 7 3.8Z" /><path d="M14 3.8v4h4" /><path d="M8.5 13h7" /><path d="M8.5 16.5h5.5" /></IconFrame>;
    case '📧':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="4" y="6.5" width="16" height="11" rx="2" /><path d="m5.5 8 6.5 5 6.5-5" /></IconFrame>;
    case '📱':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="7.5" y="3.5" width="9" height="17" rx="2" /><path d="M10.5 6h3" /><circle cx="12" cy="17.2" r=".7" fill="currentColor" stroke="none" /></IconFrame>;
    case '☑️':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="4.5" y="4.5" width="15" height="15" rx="2" /><path d="m8.5 12 2.2 2.2 4.8-5" /></IconFrame>;
    case '🔘':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></IconFrame>;
    case '📂':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 7.5h4.5l1.7 1.8H19v7.2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /><path d="M5 10.2h14" /><path d="M9 13h6" /></IconFrame>;
    case '🔢':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M8 5 6 19" /><path d="M16 5 14 19" /><path d="M4.5 9.5h15" /><path d="M3.5 14.5h15" /></IconFrame>;
    case '💰':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="12" r="7.8" /><path d="M12 7.5v9" /><path d="M14.7 9.2c-.7-1-2-1.5-3.3-1.2-1.5.4-2.3 2-1.1 3 1 .8 4 .8 4.2 2.8.1 1.3-1.1 2.3-2.6 2.5-1.3.2-2.5-.2-3.3-1" /></IconFrame>;
    case '🎚️':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h14" /><circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="11" cy="17" r="1.6" fill="currentColor" stroke="none" /></IconFrame>;
    case '📅':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M8 3.8v3.4" /><path d="M16 3.8v3.4" /><path d="M4 9.5h16" /></IconFrame>;
    case '⏰':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><circle cx="12" cy="13" r="6.5" /><path d="M12 9.5V13l2.5 1.5" /><path d="M8 4 6 6" /><path d="M16 4l2 2" /></IconFrame>;
    case '⭐':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" /></IconFrame>;
    case '📎':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M9 12.5 15.8 5.7a3 3 0 1 1 4.2 4.2l-9 9a5 5 0 0 1-7.1-7.1l8.2-8.2" /></IconFrame>;
    case '📐':
      return <IconFrame token={token} size={size} stroke={stroke} style={style}><path d="M5 18.5h14" /><path d="M8 18.5V7.5h8" /><path d="M8 7.5 16 18.5" /></IconFrame>;
    default:
      return <span aria-hidden="true" style={{ ...svgStyle(size, style), fontSize: size, lineHeight: 1 }}>{token}</span>;
  }
}