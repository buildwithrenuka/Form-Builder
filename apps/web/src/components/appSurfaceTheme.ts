import type { HomeTheme } from './HomePage';

export const APP_DISPLAY_FONT = "'Cormorant Garamond', serif";
export const APP_UI_FONT = "'Manrope', 'Exo 2', sans-serif";

export type AppSurfaceTheme = {
  background: string;
  navBg: string;
  navBorder: string;
  gridPrimary: string;
  gridSecondary: string;
  gridSize: string;
  auraA: string;
  auraB: string;
  auraC: string;
  panel: string;
  panelStrong: string;
  panelSoft: string;
  panelBorder: string;
  panelBorderStrong: string;
  shadow: string;
  text: string;
  textSoft: string;
  textMuted: string;
  heading: string;
  accent: string;
  accentSecondary: string;
  accentSoft: string;
  accentBorder: string;
  accentGradient: string;
  actionGradient: string;
  buttonText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  badgeBg: string;
  badgeBorder: string;
};

const APP_SURFACE_THEMES: Record<HomeTheme, AppSurfaceTheme> = {
  dark: {
    background: 'linear-gradient(145deg, #06070d 0%, #120d18 38%, #24111b 100%)',
    navBg: 'rgba(9,13,24,0.86)',
    navBorder: 'rgba(255,202,110,0.2)',
    gridPrimary: 'rgba(255,202,110,0.06)',
    gridSecondary: 'rgba(155,86,103,0.05)',
    gridSize: '72px 72px',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(112,52,68,0.26), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(201,94,120,0.2), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(255,202,110,0.16), transparent 28%)',
    panel: 'rgba(14,19,32,0.8)',
    panelStrong: 'rgba(18,24,40,0.94)',
    panelSoft: 'rgba(255,255,255,0.04)',
    panelBorder: 'rgba(228,233,243,0.12)',
    panelBorderStrong: 'rgba(255,202,110,0.22)',
    shadow: '0 28px 72px rgba(0,0,0,0.38), 0 0 26px rgba(152,70,92,0.08)',
    text: '#f3efe8',
    textSoft: 'rgba(232,236,246,0.84)',
    textMuted: 'rgba(201,209,224,0.58)',
    heading: '#f8f3e8',
    accent: '#ffca6e',
    accentSecondary: '#c65e78',
    accentSoft: 'rgba(255,202,110,0.12)',
    accentBorder: 'rgba(198,94,120,0.24)',
    accentGradient: 'linear-gradient(135deg, #fff1c4 0%, #ffca6e 26%, #c65e78 62%, #6f2f43 100%)',
    actionGradient: 'linear-gradient(135deg, #fff3cf 0%, #ffca6e 24%, #d86e88 56%, #7c3248 100%)',
    buttonText: '#fffaf2',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.14)',
    inputText: '#f3efe8',
    badgeBg: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(255,255,255,0.1)',
  },
  light: {
    background: 'linear-gradient(145deg, #fff8ef 0%, #fff1df 30%, #effaf6 64%, #eef7ff 100%)',
    navBg: 'rgba(255,250,244,0.9)',
    navBorder: 'rgba(233,113,72,0.16)',
    gridPrimary: 'rgba(233,113,72,0.08)',
    gridSecondary: 'rgba(45,184,165,0.08)',
    gridSize: '72px 72px',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,145,103,0.2), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(255,214,125,0.18), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(45,184,165,0.14), transparent 28%)',
    panel: 'rgba(255,251,247,0.84)',
    panelStrong: 'rgba(255,255,252,0.95)',
    panelSoft: 'rgba(233,113,72,0.08)',
    panelBorder: 'rgba(233,113,72,0.14)',
    panelBorderStrong: 'rgba(45,184,165,0.22)',
    shadow: '0 24px 54px rgba(214,121,82,0.14)',
    text: '#3d2a23',
    textSoft: 'rgba(92,67,56,0.78)',
    textMuted: 'rgba(118,95,84,0.58)',
    heading: '#241813',
    accent: '#e97148',
    accentSecondary: '#2db8a5',
    accentSoft: 'rgba(233,113,72,0.12)',
    accentBorder: 'rgba(45,184,165,0.24)',
    accentGradient: 'linear-gradient(135deg, #2e1c18 0%, #e97148 34%, #ffcb6b 68%, #2db8a5 100%)',
    actionGradient: 'linear-gradient(135deg, #2e1c18 0%, #e97148 30%, #ffcb6b 62%, #2db8a5 100%)',
    buttonText: '#fffaf4',
    inputBg: 'rgba(255,255,255,0.88)',
    inputBorder: 'rgba(233,113,72,0.16)',
    inputText: '#3d2a23',
    badgeBg: 'rgba(45,184,165,0.08)',
    badgeBorder: 'rgba(233,113,72,0.18)',
  },
  rainbow: {
    background: 'linear-gradient(145deg, #090013 0%, #120d33 34%, #18073b 68%, #031b27 100%)',
    navBg: 'rgba(9,10,24,0.88)',
    navBorder: 'rgba(255,0,168,0.22)',
    gridPrimary: 'rgba(255,0,168,0.06)',
    gridSecondary: 'rgba(0,229,255,0.05)',
    gridSize: '72px 72px',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,0,168,0.26), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(0,229,255,0.18), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(255,230,0,0.14), transparent 28%)',
    panel: 'rgba(11,13,28,0.82)',
    panelStrong: 'rgba(16,18,36,0.96)',
    panelSoft: 'rgba(255,255,255,0.05)',
    panelBorder: 'rgba(239,242,249,0.14)',
    panelBorderStrong: 'rgba(255,0,168,0.24)',
    shadow: '0 26px 60px rgba(0,0,0,0.42), 0 0 24px rgba(255,0,168,0.08)',
    text: '#f8f4ff',
    textSoft: 'rgba(239,232,255,0.82)',
    textMuted: 'rgba(229,206,255,0.56)',
    heading: '#fff9ff',
    accent: '#ff00a8',
    accentSecondary: '#00e5ff',
    accentSoft: 'rgba(255,0,168,0.14)',
    accentBorder: 'rgba(0,229,255,0.24)',
    accentGradient: 'linear-gradient(135deg, #8b2fff 0%, #ff00a8 26%, #00e5ff 56%, #8dff00 82%, #ffe600 100%)',
    actionGradient: 'linear-gradient(135deg, #8b2fff 0%, #ff00a8 22%, #00e5ff 50%, #8dff00 76%, #ffe600 100%)',
    buttonText: '#1b1324',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.18)',
    inputText: '#fff8ff',
    badgeBg: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(255,255,255,0.12)',
  },
  firecracker: {
    background: 'linear-gradient(145deg, #140100 0%, #290500 30%, #481000 62%, #240207 100%)',
    navBg: 'rgba(20,8,6,0.9)',
    navBorder: 'rgba(255,120,0,0.22)',
    gridPrimary: 'rgba(255,86,34,0.07)',
    gridSecondary: 'rgba(255,196,0,0.05)',
    gridSize: '72px 72px',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,72,0,0.28), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(255,176,0,0.18), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(255,238,120,0.14), transparent 28%)',
    panel: 'rgba(24,8,6,0.84)',
    panelStrong: 'rgba(36,12,8,0.96)',
    panelSoft: 'rgba(255,255,255,0.04)',
    panelBorder: 'rgba(255,219,194,0.12)',
    panelBorderStrong: 'rgba(255,136,0,0.24)',
    shadow: '0 26px 60px rgba(0,0,0,0.44), 0 0 28px rgba(255,110,0,0.08)',
    text: '#fff3eb',
    textSoft: 'rgba(255,228,204,0.84)',
    textMuted: 'rgba(240,188,150,0.58)',
    heading: '#fff4dc',
    accent: '#ff7a00',
    accentSecondary: '#ffd84d',
    accentSoft: 'rgba(255,110,0,0.12)',
    accentBorder: 'rgba(255,176,0,0.24)',
    accentGradient: 'linear-gradient(135deg, #ff3300 0%, #ff7a00 28%, #ffb000 58%, #ffee55 100%)',
    actionGradient: 'linear-gradient(135deg, #cc1f00 0%, #ff5a00 24%, #ff9800 54%, #ffd84d 100%)',
    buttonText: '#23100b',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,220,194,0.14)',
    inputText: '#fff3eb',
    badgeBg: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(255,220,194,0.12)',
  },
  jugnu: {
    background: 'linear-gradient(145deg, #081000 0%, #0a1503 44%, #111108 100%)',
    navBg: 'rgba(9,15,6,0.88)',
    navBorder: 'rgba(201,181,122,0.16)',
    gridPrimary: 'rgba(201,181,122,0.04)',
    gridSecondary: 'rgba(129,158,114,0.04)',
    gridSize: '72px 72px',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(186,175,108,0.16), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(102,151,119,0.14), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(228,199,120,0.1), transparent 28%)',
    panel: 'rgba(13,19,10,0.8)',
    panelStrong: 'rgba(18,24,14,0.92)',
    panelSoft: 'rgba(255,255,255,0.04)',
    panelBorder: 'rgba(234,228,188,0.1)',
    panelBorderStrong: 'rgba(201,181,122,0.22)',
    shadow: '0 26px 60px rgba(0,0,0,0.38)',
    text: '#fff7de',
    textSoft: 'rgba(244,236,196,0.78)',
    textMuted: 'rgba(208,196,147,0.52)',
    heading: '#fff7de',
    accent: '#e1c779',
    accentSecondary: '#9ed49b',
    accentSoft: 'rgba(201,181,122,0.1)',
    accentBorder: 'rgba(201,181,122,0.22)',
    accentGradient: 'linear-gradient(135deg, #f0e4b0 0%, #d0b56e 42%, #8f9963 100%)',
    actionGradient: 'linear-gradient(135deg, #f0e4b0 0%, #d0b56e 42%, #8f9963 100%)',
    buttonText: '#1a1909',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(234,228,188,0.12)',
    inputText: '#fff7de',
    badgeBg: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(234,228,188,0.12)',
  },
};

export function getAppSurfaceTheme(theme: HomeTheme): AppSurfaceTheme {
  return APP_SURFACE_THEMES[theme];
}