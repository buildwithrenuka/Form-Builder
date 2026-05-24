import { FormVerseLogo } from './Logo';
import { PricingSection } from './PricingSection';
import type { HomeTheme } from './HomePage';
import { APP_UI_FONT, getAppSurfaceTheme } from './appSurfaceTheme';

type Props = { onBack: () => void; onEnter: () => void; onEnablePayments?: (planId: 'adventurer' | 'legend') => void; theme: HomeTheme };

export function PricingPage({ onBack, onEnter, onEnablePayments, theme }: Props) {
  const C = getAppSurfaceTheme(theme);
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.background, overflowY: 'auto', fontFamily: APP_UI_FONT }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.gridPrimary} 1px, transparent 1px), linear-gradient(90deg, ${C.gridSecondary} 1px, transparent 1px)`, backgroundSize: C.gridSize }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraA }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraB }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraC }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navBg, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.navBorder}`, padding: '0 32px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormVerseLogo size={30} textSize={12} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: C.panelSoft, border: `1px solid ${C.panelBorderStrong}`, borderRadius: 12, color: C.textSoft, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>← Back</button>
          <button onClick={onEnter} style={{ background: C.actionGradient, border: `1px solid ${C.accentBorder}`, borderRadius: 12, color: C.buttonText, fontSize: 12, fontWeight: 700, padding: '9px 18px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em', boxShadow: `0 14px 28px ${C.accentBorder}` }}>Start Free</button>
        </div>
      </nav>
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 100px' }}>
        <PricingSection onEnter={onEnter} onEnablePayments={onEnablePayments} embedded surface={theme === 'light' ? 'light' : 'dark'} />
      </div>
    </div>
  );
}
