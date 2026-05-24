import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../trpc';
import { ensureRazorpayCheckoutLoaded, openRazorpayCheckout } from '../utils/razorpayCheckout';
import { FormVerseLogo } from './Logo';
import type { HomeTheme } from './HomePage';
import { APP_DISPLAY_FONT, APP_UI_FONT, getAppSurfaceTheme } from './appSurfaceTheme';

type Props = {
  onBack: () => void;
  onRequireAuth: () => void;
  onAfterSuccess: () => void;
  theme: HomeTheme;
  playerName?: string;
  sessionEmail?: string;
  currentPlanId?: 'adventurer' | 'legend';
  currentPlanActivatedAt?: Date | string | null;
  initialPlanId?: 'adventurer' | 'legend';
};

const PLANS = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    price: '$12',
    period: '/month',
    accent: '#00e5ff',
    badge: 'Best for solo creators',
    description: 'Unlock paid forms, unlimited active forms, and deeper analytics for monetized experiences.',
    features: ['Accept payments with Razorpay', 'Unlimited active forms', 'Unlimited responses', 'Advanced analytics'],
  },
  {
    id: 'legend',
    name: 'Legend',
    price: '$49',
    period: '/month',
    accent: '#ffd700',
    badge: 'Best for teams',
    description: 'Everything in Adventurer plus collaboration, exports, and support for bigger launches.',
    features: ['Everything in Adventurer', 'Team collaboration', 'CSV exports', 'Priority support'],
  },
 ] as const;

type CreatorPlanId = (typeof PLANS)[number]['id'];

type CreatorPlanOrderResponse = {
  keyId?: string;
  orderId: string;
  amount: number;
  currency: string;
  planId: CreatorPlanId;
  planName: string;
  description: string;
  prefill: {
    name: string | null;
    email: string | null;
  };
};

export function PremiumPaymentPage({ onBack, onRequireAuth, onAfterSuccess, theme, playerName, sessionEmail, currentPlanId, currentPlanActivatedAt, initialPlanId = 'adventurer' }: Props) {
  const C = getAppSurfaceTheme(theme);
  const trpcUtils = trpc.useUtils();
  const createOrderMutation = trpc.billing.createCreatorPlanOrder.useMutation();
  const verifyPaymentMutation = trpc.billing.verifyCreatorPlanPayment.useMutation();
  const redirectTimeoutRef = useRef<number | null>(null);
  const [activePlanId, setActivePlanId] = useState<CreatorPlanId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<CreatorPlanId>(initialPlanId);
  const isAuthenticated = Boolean(playerName);
  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0];
  const alternatePlans = PLANS.filter((plan) => plan.id !== selectedPlan.id);
  const currentPlan = currentPlanId ? PLANS.find((plan) => plan.id === currentPlanId) ?? null : null;
  const currentPlanRank = currentPlan ? PLANS.findIndex((plan) => plan.id === currentPlan.id) : -1;
  const selectedPlanRank = PLANS.findIndex((plan) => plan.id === selectedPlan.id);
  const hasSelectedPlanOrHigher = currentPlanRank >= 0 && currentPlanRank >= selectedPlanRank;
  const isUpgradeFlow = currentPlanRank >= 0 && currentPlanRank < selectedPlanRank;
  const currentPlanActivatedLabel = currentPlanActivatedAt
    ? new Date(currentPlanActivatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const accountLabel = useMemo(() => {
    if (!playerName) return null;
    return sessionEmail ? `${playerName} · ${sessionEmail}` : playerName;
  }, [playerName, sessionEmail]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handlePlanCheckout(planId: CreatorPlanId) {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    setActivePlanId(planId);
    setCheckoutError(null);
    setRedirectMessage(null);

    try {
      await ensureRazorpayCheckoutLoaded();
      const order = await createOrderMutation.mutateAsync({ planId }) as CreatorPlanOrderResponse;
      const payment = await openRazorpayCheckout({
        ...order,
        name: `FormVerse ${order.planName}`,
        themeColor: '#00c2ff',
      });
      const verification = await verifyPaymentMutation.mutateAsync({ planId, payment });
      await trpcUtils.auth.me.invalidate();
      setRedirectMessage(`Welcome to the legendary ${verification.planName} experience. Redirecting you to the experience page...`);
      redirectTimeoutRef.current = window.setTimeout(() => {
        onAfterSuccess();
      }, 3200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete checkout right now.';
      if (message !== 'Payment was cancelled.') {
        setCheckoutError(message);
      }
    } finally {
      setActivePlanId(null);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.background, overflowY: 'auto', fontFamily: APP_UI_FONT }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.gridPrimary} 1px, transparent 1px), linear-gradient(90deg, ${C.gridSecondary} 1px, transparent 1px)`, backgroundSize: C.gridSize }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraA }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraB }} />
        <div style={{ position: 'absolute', inset: 0, background: C.auraC }} />
      </div>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navBg, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.navBorder}`, padding: '0 32px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormVerseLogo size={30} textSize={12} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: C.panelSoft, border: `1px solid ${C.panelBorderStrong}`, borderRadius: 12, color: C.textSoft, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>← Back</button>
          <button onClick={isAuthenticated ? onAfterSuccess : onRequireAuth} style={{ background: C.actionGradient, border: `1px solid ${C.accentBorder}`, borderRadius: 12, color: C.buttonText, fontSize: 12, fontWeight: 700, padding: '9px 18px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em', boxShadow: `0 14px 28px ${C.accentBorder}` }}>{isAuthenticated ? 'Go To App' : 'Create Account'}</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '84px 24px 110px', display: 'grid', gap: 28 }}>
        <section style={{ display: 'grid', gap: 16, textAlign: 'center', justifyItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.badgeBg, border: `1px solid ${C.badgeBorder}`, borderRadius: 999, padding: '7px 16px', color: C.accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Premium Payments
          </div>
          <h1 style={{ margin: 0, fontFamily: APP_DISPLAY_FONT, fontSize: 'clamp(38px, 6vw, 72px)', lineHeight: 0.95, color: C.heading, letterSpacing: '-0.04em' }}>Enable paid forms for your premium plan</h1>
          <p style={{ margin: 0, maxWidth: 760, color: C.textSoft, fontSize: 16, lineHeight: 1.75 }}>
            This is the dedicated premium payment page for FormVerse creators. Choose a premium tier to launch a live Razorpay checkout for creator plans and unlock paid forms.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            <span style={{ padding: '8px 12px', borderRadius: 999, background: C.badgeBg, border: `1px solid ${C.badgeBorder}`, color: C.textSoft, fontSize: 12 }}>{isAuthenticated ? `Signed in as ${accountLabel}` : 'Sign in required before checkout'}</span>
            <span style={{ padding: '8px 12px', borderRadius: 999, background: C.badgeBg, border: `1px solid ${C.badgeBorder}`, color: C.textSoft, fontSize: 12 }}>Live Razorpay order + verification</span>
          </div>
        </section>

        {currentPlan && (
          <section style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(255,215,0,0.14))', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, padding: '18px 20px', display: 'grid', gap: 6 }}>
            <div style={{ color: currentPlan.accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Premium Active</div>
            <div style={{ color: C.heading, fontFamily: APP_DISPLAY_FONT, fontSize: 28 }}>Your {currentPlan.name} plan is already unlocked.</div>
            <div style={{ color: C.textSoft, fontSize: 14, lineHeight: 1.7 }}>
              {currentPlanActivatedLabel
                ? `Activated on ${currentPlanActivatedLabel}. You can still upgrade to a higher plan, but the same or lower plan cannot be purchased again.`
                : 'You can still upgrade to a higher plan, but the same or lower plan cannot be purchased again.'}
            </div>
          </section>
        )}

        {checkoutError && (
          <section style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(248,113,113,0.32)', borderRadius: 18, padding: '16px 18px', color: '#ffd5d5', fontSize: 14 }}>
            {checkoutError}
          </section>
        )}

        {redirectMessage && (
          <section style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(0,229,255,0.24), rgba(255,215,0,0.2) 52%, rgba(255,122,24,0.22))',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: '22px 24px',
            boxShadow: '0 22px 54px rgba(0,0,0,0.22)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 42%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(8,16,24,0.28)', color: '#fef3c7', fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Payment Unlocked
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#00e5ff', '#ffd700', '#fb7185'].map((color) => (
                    <span key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 18px ${color}` }} />
                  ))}
                </div>
              </div>
              <div style={{ color: '#ffffff', fontFamily: APP_DISPLAY_FONT, fontSize: 'clamp(24px, 3vw, 34px)', letterSpacing: '-0.03em' }}>
                Welcome to the legendary experience
              </div>
              <div style={{ color: 'rgba(245,250,255,0.92)', fontSize: 15, lineHeight: 1.7, fontWeight: 700 }}>
                {redirectMessage}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Preparing your next screen
                </div>
                <div style={{ height: 10, borderRadius: 999, background: 'rgba(8,16,24,0.24)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #00e5ff 0%, #7dd3fc 35%, #ffd700 70%, #fb7185 100%)' }} />
                </div>
              </div>
            </div>
          </section>
        )}

          <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)', gap: 20, alignItems: 'start' }}>
            <article style={{ background: C.panelStrong, border: `1px solid ${C.panelBorderStrong}`, boxShadow: C.shadow, borderRadius: 28, padding: 30, display: 'grid', gap: 22 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: selectedPlan.accent }}>Selected Plan</div>
                <h2 style={{ margin: 0, fontFamily: APP_DISPLAY_FONT, fontSize: 'clamp(32px, 5vw, 52px)', color: C.heading }}>Upgrade to {selectedPlan.name}</h2>
                <p style={{ margin: 0, color: C.textSoft, fontSize: 15, lineHeight: 1.75 }}>{selectedPlan.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 58, color: selectedPlan.accent }}>{selectedPlan.price}</span>
                <span style={{ color: C.textMuted, fontSize: 15 }}>{selectedPlan.period}</span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {selectedPlan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.textSoft, fontSize: 15 }}>
                    <span style={{ color: selectedPlan.accent, fontWeight: 700 }}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <button onClick={() => handlePlanCheckout(selectedPlan.id)} disabled={activePlanId !== null || hasSelectedPlanOrHigher} style={{ background: hasSelectedPlanOrHigher ? 'rgba(148,163,184,0.28)' : `linear-gradient(135deg, ${selectedPlan.accent}cc, ${C.accentSecondary})`, border: 'none', borderRadius: 14, color: hasSelectedPlanOrHigher ? 'rgba(226,232,240,0.92)' : '#081018', padding: '15px 18px', fontSize: 14, fontWeight: 800, cursor: activePlanId !== null ? 'progress' : hasSelectedPlanOrHigher ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', fontFamily: APP_UI_FONT, opacity: activePlanId !== null && activePlanId !== selectedPlan.id ? 0.7 : 1 }}>
                  {!isAuthenticated
                    ? `Create Account To Upgrade To ${selectedPlan.name}`
                    : hasSelectedPlanOrHigher
                      ? currentPlan?.id === selectedPlan.id
                        ? `${selectedPlan.name} Already Active`
                        : `${currentPlan?.name ?? 'Premium'} Already Active`
                      : activePlanId === selectedPlan.id
                        ? 'Opening Checkout...'
                        : isUpgradeFlow
                          ? `Upgrade To ${selectedPlan.name}`
                          : `Pay ${selectedPlan.price} For ${selectedPlan.name}`}
                </button>
                <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                  {!isAuthenticated
                    ? 'Sign up first, then you will return to this exact plan checkout.'
                    : hasSelectedPlanOrHigher
                      ? 'This plan is already covered by your current premium access.'
                      : isUpgradeFlow
                        ? `Your current ${currentPlan?.name ?? 'premium'} access can be upgraded from here.`
                        : 'You are one step away from unlocking premium creator billing.'}
                </div>
              </div>
            </article>

            <aside style={{ display: 'grid', gap: 16 }}>
              <section style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 22, padding: 22, display: 'grid', gap: 14 }}>
                <h3 style={{ margin: 0, fontFamily: APP_DISPLAY_FONT, fontSize: 24, color: C.heading }}>Switch Plan</h3>
                {alternatePlans.map((plan) => (
                  <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)} style={{ textAlign: 'left', background: 'transparent', border: `1px solid ${plan.accent}33`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', display: 'grid', gap: 6 }}>
                    <span style={{ color: plan.accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{plan.badge}</span>
                    <span style={{ color: C.heading, fontFamily: APP_DISPLAY_FONT, fontSize: 24 }}>{plan.name}</span>
                    <span style={{ color: C.textSoft, fontSize: 13 }}>{plan.price}{plan.period}</span>
                  </button>
                ))}
              </section>

              <section style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 22, padding: 22, display: 'grid', gap: 10 }}>
                <h3 style={{ margin: 0, fontFamily: APP_DISPLAY_FONT, fontSize: 24, color: C.heading }}>Checkout Flow</h3>
                {['Choose plan', 'Create account if needed', 'Complete Razorpay checkout', 'Land on the experience selector after success'].map((item) => (
                  <div key={item} style={{ color: C.textSoft, fontSize: 13 }}>{item}</div>
                ))}
              </section>
            </aside>
        </section>

        <section style={{ background: C.panelStrong, border: `1px solid ${C.panelBorderStrong}`, borderRadius: 24, padding: '28px 24px', display: 'grid', gap: 14 }}>
          <h3 style={{ margin: 0, fontFamily: APP_DISPLAY_FONT, fontSize: 28, color: C.heading }}>What happens next</h3>
          <p style={{ margin: 0, color: C.textSoft, fontSize: 14, lineHeight: 1.7 }}>
              Creator checkout now creates a live Razorpay order, opens the hosted payment modal, and verifies the payment on the server before returning you to the experience selector in FormVerse.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Home premium section', 'Dedicated premium/payment page', 'Server-side order verification', 'Enable paid forms later in builder'].map((item) => (
              <span key={item} style={{ padding: '9px 12px', borderRadius: 999, background: C.badgeBg, border: `1px solid ${C.badgeBorder}`, color: C.textSoft, fontSize: 12 }}>{item}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}