import { FormVerseLogo } from './Logo';
import { PricingSection } from './PricingSection';

type Props = { onBack: () => void; onEnter: () => void };

const C = {
  bg: '#060014',
  purpleL: '#a78bfa',
};

export function PricingPage({ onBack, onEnter }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
        <div style={{ position: 'absolute', top: '-10%', right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,0,20,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.1)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormVerseLogo size={30} textSize={12} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: C.purpleL, fontSize: 12, fontWeight: 600, padding: '7px 16px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>← Back</button>
          <button onClick={onEnter} style={{ background: 'linear-gradient(135deg, #5b21b6, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em' }}>🚀 Start Free</button>
        </div>
      </nav>
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 100px' }}>
        <PricingSection onEnter={onEnter} />
      </div>
    </div>
  );
}
