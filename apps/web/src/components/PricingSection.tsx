import { useState } from 'react';

type Props = {
  onEnter: () => void;
  sectionId?: string;
  embedded?: boolean;
  surface?: 'dark' | 'light';
};

const C = {
  purple: '#7c3aed',
  purpleL: '#a78bfa',
  cyan: '#00e5ff',
  gold: '#ffd700',
};

const PLANS = [
  {
    name: 'Explorer',
    badge: 'Free Forever',
    price: '$0',
    period: '/month',
    highlight: false,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    desc: 'Perfect for individuals exploring form building.',
    cta: 'Start Free',
    features: [
      { t: '3 active forms', ok: true },
      { t: '100 responses / form', ok: true },
      { t: 'All 3 cinematic worlds', ok: true },
      { t: 'Public & unlisted share', ok: true },
      { t: '17 field types', ok: true },
      { t: 'Version history (5)', ok: true },
      { t: 'Response analytics', ok: true },
      { t: 'Custom domain', ok: false },
      { t: 'Email notifications', ok: false },
      { t: 'Team collaboration', ok: false },
      { t: 'Priority support', ok: false },
    ],
  },
  {
    name: 'Adventurer',
    badge: 'Most Popular',
    price: '$12',
    period: '/month',
    highlight: true,
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.2)',
    desc: 'For creators who build seriously.',
    cta: 'Start 14-day Trial',
    features: [
      { t: 'Unlimited active forms', ok: true },
      { t: 'Unlimited responses', ok: true },
      { t: 'All 3 cinematic worlds', ok: true },
      { t: 'Public & unlisted share', ok: true },
      { t: '17 field types', ok: true },
      { t: 'Version history (∞)', ok: true },
      { t: 'Advanced analytics', ok: true },
      { t: 'Custom domain', ok: true },
      { t: 'Email notifications', ok: true },
      { t: 'Team collaboration', ok: false },
      { t: 'Priority support', ok: false },
    ],
  },
  {
    name: 'Legend',
    badge: 'Enterprise',
    price: '$49',
    period: '/month',
    highlight: false,
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.12)',
    desc: 'Built for teams that ship at scale.',
    cta: 'Contact Sales',
    features: [
      { t: 'Unlimited active forms', ok: true },
      { t: 'Unlimited responses', ok: true },
      { t: 'All 3 cinematic worlds', ok: true },
      { t: 'Public & unlisted share', ok: true },
      { t: '17 field types', ok: true },
      { t: 'Version history (∞)', ok: true },
      { t: 'Advanced analytics + CSV', ok: true },
      { t: 'Custom domain', ok: true },
      { t: 'Email notifications', ok: true },
      { t: 'Team collaboration (10)', ok: true },
      { t: 'Priority support', ok: true },
    ],
  },
];

const FAQ = [
  { q: 'Is the free plan really free?', a: 'Yes — forever. No credit card needed. You get 3 forms, 100 responses each, and all three cinematic worlds.' },
  { q: 'Can I switch plans anytime?', a: 'Absolutely. Upgrade or downgrade at any point. If you downgrade, your forms stay intact — only new submissions may be limited.' },
  { q: 'What payment methods do you accept?', a: 'All major credit cards (Visa, Mastercard, Amex). We use Stripe for secure processing. No real charges are required for demo purposes.' },
  { q: 'Is there a trial period?', a: 'Adventurer plan comes with a 14-day free trial — no credit card required to start.' },
  { q: 'What happens to my data if I cancel?', a: 'All your forms and responses are retained for 30 days after cancellation. You can export at any time.' },
  { q: 'Do you support team access?', a: 'Team collaboration is available on the Legend plan. Up to 10 team members can co-edit forms and view shared analytics.' },
];

export function PricingSection({ onEnter, sectionId = 'pricing', embedded = false, surface = 'dark' }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const yearlyDisc = 0.2;
  const isLight = surface === 'light';

  const S = {
    heading: isLight ? '#111111' : '#f7ecff',
    headingGradient: isLight
      ? 'linear-gradient(140deg, #111111 0%, #2f2f2f 30%, #cc4400 70%, #ffb300 100%)'
      : 'linear-gradient(140deg, #f7f2ff 0%, #d8cdf8 42%, #9be7f2 100%)',
    body: isLight ? 'rgba(17,17,17,0.72)' : 'rgba(233,228,246,0.82)',
    toggleBg: isLight ? 'rgba(17,17,17,0.06)' : 'rgba(255,255,255,0.04)',
    toggleBorder: isLight ? 'rgba(17,17,17,0.14)' : 'rgba(124,58,237,0.2)',
    toggleIdle: isLight ? 'rgba(17,17,17,0.56)' : 'rgba(223,214,246,0.72)',
    cardBg: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(17,19,31,0.72)',
    cardBorder: isLight ? 'rgba(17,17,17,0.12)' : 'rgba(233,237,246,0.12)',
    highlightBg: (color: string) => isLight ? `linear-gradient(160deg, ${color}1f, rgba(255,255,255,0.94))` : `linear-gradient(160deg, ${color}12, rgba(6,0,20,0.95))`,
    title: isLight ? '#111111' : '#fff',
    desc: isLight ? 'rgba(17,17,17,0.62)' : 'rgba(224,217,242,0.68)',
    price: isLight ? '#111111' : '#fff',
    period: isLight ? 'rgba(17,17,17,0.5)' : 'rgba(214,206,236,0.7)',
    buttonBg: isLight ? 'rgba(17,17,17,0.06)' : 'rgba(255,255,255,0.06)',
    buttonBorder: isLight ? 'rgba(17,17,17,0.1)' : 'rgba(255,255,255,0.1)',
    featureOn: isLight ? 'rgba(17,17,17,0.84)' : 'rgba(220,210,255,0.85)',
    featureOff: isLight ? 'rgba(17,17,17,0.28)' : 'rgba(255,255,255,0.25)',
    featureOffIcon: isLight ? 'rgba(17,17,17,0.18)' : 'rgba(255,255,255,0.15)',
    stripBg: isLight ? 'rgba(255,255,255,0.62)' : 'rgba(15,18,28,0.68)',
    stripBorder: isLight ? 'rgba(17,17,17,0.1)' : 'rgba(196,180,244,0.16)',
    stripText: isLight ? 'rgba(17,17,17,0.68)' : 'rgba(230,224,244,0.8)',
    faqBg: isLight ? 'rgba(255,255,255,0.68)' : 'rgba(15,18,28,0.62)',
    faqBorder: (open: boolean) => open ? 'rgba(124,58,237,0.4)' : (isLight ? 'rgba(17,17,17,0.1)' : 'rgba(255,255,255,0.07)'),
    faqQuestion: (open: boolean) => open ? '#ddd1ff' : (isLight ? 'rgba(17,17,17,0.88)' : 'rgba(241,236,250,0.9)'),
    faqArrow: (open: boolean) => open ? C.purpleL : (isLight ? 'rgba(17,17,17,0.4)' : 'rgba(167,139,250,0.4)'),
    faqAnswer: isLight ? 'rgba(17,17,17,0.68)' : 'rgba(221,214,240,0.74)',
    ctaBg: isLight ? 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,247,220,0.9))' : 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,229,255,0.06))',
    ctaBorder: isLight ? 'rgba(17,17,17,0.1)' : 'rgba(124,58,237,0.2)',
  };

  function displayPrice(base: string) {
    if (base === '$0') return '$0';
    const amount = parseInt(base.replace('$', ''), 10);
    return billing === 'yearly' ? `$${Math.round(amount * (1 - yearlyDisc))}` : base;
  }

  return (
    <section id={sectionId} style={{ padding: embedded ? '100px 24px' : '0', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 100, padding: '5px 18px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Simple, Transparent Pricing</span>
          </div>
          <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, color: S.heading, margin: '0 0 16px', background: isLight ? undefined : S.headingGradient, backgroundClip: isLight ? undefined : 'text', WebkitBackgroundClip: isLight ? undefined : 'text', WebkitTextFillColor: isLight ? undefined : 'transparent' }}>
            Choose Your Quest
          </h2>
          <p style={{ fontSize: 16, color: S.body, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
            All plans include the full form builder. Upgrade for more forms, responses, analytics, and team features.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: S.toggleBg, border: `1px solid ${S.toggleBorder}`, borderRadius: 10, padding: 4, backdropFilter: 'blur(14px)' }}>
            {(['monthly', 'yearly'] as const).map((item) => (
              <button key={item} onClick={() => setBilling(item)}
                style={{ background: billing === item ? 'rgba(124,58,237,0.35)' : 'transparent', border: 'none', borderRadius: 7, color: billing === item ? '#fff' : S.toggleIdle, fontSize: 12, fontWeight: 700, padding: '7px 20px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em', transition: 'all 0.18s', textShadow: billing === item ? '0 1px 6px rgba(0,0,0,0.28)' : 'none' }}>
                {item === 'yearly' ? 'YEARLY (−20%)' : 'MONTHLY'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 80 }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{ position: 'relative', background: plan.highlight ? S.highlightBg(plan.color) : S.cardBg, border: `${plan.highlight ? '2px' : '1px'} solid ${plan.highlight ? `${plan.color}55` : S.cardBorder}`, borderRadius: 20, padding: '32px 28px 28px', display: 'flex', flexDirection: 'column', boxShadow: plan.highlight ? `0 0 48px ${plan.glow}, 0 8px 32px rgba(0,0,0,${isLight ? 0.12 : 0.4})` : (isLight ? '0 8px 24px rgba(0,0,0,0.05)' : 'none') }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.color}, #0891b2)`, borderRadius: 100, padding: '4px 20px', fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{plan.badge}</div>
              <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 22, fontWeight: 900, color: S.title, margin: '0 0 8px' }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: S.desc, marginBottom: 24, lineHeight: 1.6 }}>{plan.desc}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 42, fontWeight: 900, color: plan.highlight ? plan.color : S.price }}>{displayPrice(plan.price)}</span>
                {plan.price !== '$0' ? (
                  <span style={{ fontSize: 14, color: S.period }}>{plan.period}{billing === 'yearly' ? ' billed yearly' : ''}</span>
                ) : (
                  <span style={{ fontSize: 14, color: S.period }}>forever</span>
                )}
              </div>

              <button onClick={onEnter} style={{ background: plan.highlight ? `linear-gradient(135deg, ${plan.color}cc, #0891b2cc)` : S.buttonBg, border: `1px solid ${plan.highlight ? 'transparent' : S.buttonBorder}`, borderRadius: 10, color: plan.highlight ? '#000' : plan.color, fontSize: 13, fontWeight: 700, padding: '13px 0', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em', marginBottom: 28 }}>
                {plan.cta}
              </button>

              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${plan.color}33, transparent)`, marginBottom: 20 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {plan.features.map((feature) => (
                  <div key={feature.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: feature.ok ? plan.color : S.featureOffIcon, flexShrink: 0 }}>{feature.ok ? '✓' : '✗'}</span>
                    <span style={{ fontSize: 13, color: feature.ok ? S.featureOn : S.featureOff }}>{feature.t}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: S.stripBg, border: `1px solid ${S.stripBorder}`, borderRadius: 16, padding: '32px', marginBottom: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 12 }}>All Plans Include</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 32px' }}>
            {['SSL & Security', '3 Cinematic Worlds', '17 Field Types', 'Response Analytics', 'Public Sharing', 'Mobile Responsive', 'Version History', 'Export to JSON', 'No-code Required', 'No Expiry Date'].map((feature) => (
              <span key={feature} style={{ fontSize: 13, color: S.stripText }}>{feature}</span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: S.title, textAlign: 'center', marginBottom: 36 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((item, index) => (
              <div key={item.q} onClick={() => setOpenFaq(openFaq === index ? null : index)} style={{ background: S.faqBg, border: `1px solid ${S.faqBorder(openFaq === index)}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.faqQuestion(openFaq === index) }}>{item.q}</span>
                  <span style={{ fontSize: 18, color: S.faqArrow(openFaq === index), transform: openFaq === index ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                </div>
                {openFaq === index && <p style={{ fontSize: 13, color: S.faqAnswer, marginTop: 12, lineHeight: 1.7, marginBottom: 0 }}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 80, textAlign: 'center', background: S.ctaBg, border: `1px solid ${S.ctaBorder}`, borderRadius: 20, padding: '48px 32px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: S.title, margin: '0 0 12px' }}>Ready to Build Something Epic?</h3>
          <p style={{ fontSize: 14, color: S.body, marginBottom: 28 }}>No credit card required. Start building in under 60 seconds.</p>
          <button onClick={onEnter} style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed, #00bcd4)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, padding: '15px 44px', cursor: 'pointer', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", boxShadow: '0 0 32px rgba(124,58,237,0.45)' }}>
            Start Free — No Card Required
          </button>
        </div>
      </div>
    </section>
  );
}