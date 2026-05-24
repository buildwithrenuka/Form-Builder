import { useEffect, useMemo, useState } from 'react';
import type { FormField, WorldTheme, Avatar } from '../types';
import { WORLDS, AVATARS } from '../themes';
import { COUNTRIES, type Country } from '../globeData';
import { LIBRARY_WORLDS, type LibraryWorld } from '../libraryData';
import { ParticleBackground } from './ParticleBackground';
import { trpc } from '../trpc';
import { copyText } from '../utils/clipboard';
import { ControlledFormField, StructureFieldBanner } from './FormFieldRenderer';
import { countInteractiveFields, getFormPages } from '../utils/formFlow';
import { buildRespondentTokenKey, buildSubmissionLockKey, getOrCreateRespondentToken, hasSubmissionLock, setSubmissionLock } from '../utils/submissionLock';
import { ensureRazorpayCheckoutLoaded, openRazorpayCheckout } from '../utils/razorpayCheckout';

type SharedPayload = {
  formTitle: string;
  fields: FormField[];
  worldId: string;
  avatarId: string;
};

type Props = { encoded?: string; slug?: string; onBack: () => void };

type FormPaymentConfig = {
  enabled: boolean;
  amount: number;
  currency: string;
  description?: string;
};

type RazorpayOrderResponse = {
  keyId?: string;
  orderId: string;
  amount: number;
  currency: string;
  formTitle: string;
  description: string;
  prefill: {
    name: string | null;
    email: string | null;
  };
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function isStructuralSharedField(field: Pick<FormField, 'type'>): boolean {
  return field.type === 'section';
}

function countryToSharedWorld(country: Country): WorldTheme {
  return {
    id: country.id,
    name: country.name,
    emoji: country.emoji,
    description: country.lore,
    tagline: country.tagline,
    primaryColor: country.color,
    secondaryColor: country.accentColor,
    accentColor: country.accentColor,
    textColor: '#f0f0f0',
    mutedColor: `${country.color}aa`,
    bg: country.bgGradient,
    cardBg: 'rgba(0,0,0,0.88)',
    borderColor: country.color,
    buttonGradient: `linear-gradient(135deg, ${country.color}, ${country.accentColor})`,
    buttonText: '#fff',
    inputBg: 'rgba(255,255,255,0.06)',
    particles: [],
    glowColor: country.glowColor,
  };
}

function libraryToSharedWorld(world: LibraryWorld): WorldTheme {
  return {
    id: world.id,
    name: world.name,
    emoji: world.emoji,
    description: world.lore,
    tagline: world.tagline,
    primaryColor: world.color,
    secondaryColor: world.accentColor,
    accentColor: world.accentColor,
    textColor: '#f0f0f0',
    mutedColor: `${world.color}aa`,
    bg: world.bgGradient,
    cardBg: 'rgba(0,0,0,0.88)',
    borderColor: world.color,
    buttonGradient: `linear-gradient(135deg, ${world.color}, ${world.accentColor})`,
    buttonText: '#fff',
    inputBg: 'rgba(255,255,255,0.06)',
    particles: world.particles,
    glowColor: world.glowColor,
  };
}

function normalizeWorldId(worldId: string): string {
  return worldId.replace(/^globe_/, '').replace(/^library_/, '');
}

function resolveSharedWorld(worldId: string): WorldTheme {
  const normalizedWorldId = normalizeWorldId(worldId);
  const themeWorld = WORLDS.find((world) => world.id === normalizedWorldId);
  if (themeWorld) return themeWorld;

  const country = COUNTRIES.find((item) => item.id === normalizedWorldId);
  if (country) return countryToSharedWorld(country);

  const libraryWorld = LIBRARY_WORLDS.find((item) => item.id === normalizedWorldId);
  if (libraryWorld) return libraryToSharedWorld(libraryWorld);

  return WORLDS[0];
}

function resolveSharedAvatar(avatarId: string): Avatar | null {
  if (!avatarId) return null;
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? null;
}

export function encodeSharePayload(payload: SharedPayload): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
}

export function decodeSharePayload(encoded: string): SharedPayload | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharedPayload): string {
  const encoded = encodeSharePayload(payload);
  const url = new URL(window.location.href.split('?')[0]);
  url.searchParams.set('share', encoded);
  return url.toString();
}

function renderPageRows(pageFields: FormField[], world: WorldTheme, values: Record<string, unknown>, onChange: (fieldId: string, value: unknown) => void) {
  const rows: React.ReactNode[] = [];
  let index = 0;

  while (index < pageFields.length) {
    const field = pageFields[index];
    if (isStructuralSharedField(field)) {
      rows.push(<StructureFieldBanner key={field.id} field={field} />);
      index += 1;
      continue;
    }

    const nextField = pageFields[index + 1];
    if (field.fieldWidth === 'half' && nextField && nextField.fieldWidth === 'half' && !isStructuralSharedField(nextField)) {
      rows.push(
        <div key={`${field.id}-${nextField.id}`} style={{ display: 'flex', gap: '14px' }}>
          <div style={{ flex: 1 }}>
            <ControlledFormField field={field} world={world} value={values[field.id]} onChange={(value) => onChange(field.id, value)} />
          </div>
          <div style={{ flex: 1 }}>
            <ControlledFormField field={nextField} world={world} value={values[nextField.id]} onChange={(value) => onChange(nextField.id, value)} />
          </div>
        </div>,
      );
      index += 2;
      continue;
    }

    rows.push(
      <ControlledFormField
        key={field.id}
        field={field}
        world={world}
        value={values[field.id]}
        onChange={(value) => onChange(field.id, value)}
      />,
    );
    index += 1;
  }

  return rows;
}

function PageHeader({ world, pageIndex, pageCount, title, description }: { world: WorldTheme; pageIndex: number; pageCount: number; title: string; description: string }) {
  if (pageCount <= 1) return null;

  return (
    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.accentColor, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Page {pageIndex + 1} of {pageCount}</div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '14px', color: '#fff', marginTop: '4px' }}>{title}</div>
        {description && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: world.mutedColor, marginTop: '4px' }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: pageCount }, (_, dotIndex) => (
          <div key={dotIndex} style={{ width: '10px', height: '10px', borderRadius: '999px', background: dotIndex === pageIndex ? world.accentColor : 'rgba(255,255,255,0.18)', boxShadow: dotIndex === pageIndex ? `0 0 10px ${world.glowColor}` : 'none' }} />
        ))}
      </div>
    </div>
  );
}

function NavigationRow({ world, canGoBack, isLastPage, onPrevious, onNext, onSubmit, isSubmitting, submitLabel }: { world: WorldTheme; canGoBack: boolean; isLastPage: boolean; onPrevious: () => void; onNext: () => void; onSubmit: () => void; isSubmitting?: boolean; submitLabel: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {canGoBack && (
        <button onClick={onPrevious} style={{ background: 'rgba(255,255,255,0.06)', color: world.textColor, fontSize: '14px', padding: '14px 22px', letterSpacing: '0.1em', borderRadius: '8px', border: `1px solid ${world.borderColor}44`, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
          ← PREVIOUS
        </button>
      )}
      {!isLastPage && (
        <button onClick={onNext} style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '14px', padding: '14px 28px', letterSpacing: '0.12em', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: `0 0 20px ${world.glowColor}66`, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
          NEXT PAGE →
        </button>
      )}
      {isLastPage && (
        <button onClick={onSubmit} disabled={isSubmitting} style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '14px', padding: '14px 28px', letterSpacing: '0.12em', borderRadius: '8px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: `0 0 20px ${world.glowColor}66`, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
          {isSubmitting ? '⏳ Submitting...' : submitLabel}
        </button>
      )}
    </div>
  );
}

function ApiFormView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [typedAccessPassword, setTypedAccessPassword] = useState('');
  const [submittedAccessPassword, setSubmittedAccessPassword] = useState<string | undefined>(undefined);
  const [unlockAttempted, setUnlockAttempted] = useState(false);
  const respondentToken = useMemo(() => getOrCreateRespondentToken(buildRespondentTokenKey('form', slug)), [slug]);
  const lockKey = useMemo(() => buildSubmissionLockKey('form', slug), [slug]);
  const { data, isLoading, error } = trpc.forms.getBySlug.useQuery({ slug, accessPassword: submittedAccessPassword, respondentToken });
  const createPaymentOrder = trpc.responses.createPaymentOrder.useMutation();
  const submit = trpc.responses.submit.useMutation();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submissionState, setSubmissionState] = useState<'idle' | 'created' | 'updated'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [storedSubmissionLock, setStoredSubmissionLock] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const world = resolveSharedWorld(data?.worldTheme ?? '');
  const formFields = data?.access === 'available'
    ? data.schema as unknown as FormField[]
    : [];
  const pages = useMemo(() => getFormPages(formFields, formValues), [formFields, formValues]);
  const currentPage = pages[Math.min(currentPageIndex, Math.max(pages.length - 1, 0))];
  const hasEditableResponse = data?.access === 'available' ? data.canEditResponse : false;
  const paymentConfig = data?.access === 'available' ? (data.paymentConfig as FormPaymentConfig | null | undefined) ?? null : null;
  const paymentRequired = data?.access === 'available' ? Boolean(data.paymentRequired) : false;
  const submissionLocked = data?.access === 'available'
    ? (data.alreadySubmitted && !data.canEditResponse) || storedSubmissionLock
    : false;
  const showSubmissionConfirmation = submissionState !== 'idle';
  const existingResponseDataJson = data?.access === 'available' && data.existingResponseData
    ? JSON.stringify(data.existingResponseData)
    : '';

  useEffect(() => {
    if (currentPageIndex > pages.length - 1) {
      setCurrentPageIndex(Math.max(pages.length - 1, 0));
    }
  }, [currentPageIndex, pages.length]);

  useEffect(() => {
    setStoredSubmissionLock(hasSubmissionLock(lockKey));
  }, [lockKey]);

  useEffect(() => {
    if (!existingResponseDataJson) {
      return;
    }

    setFormValues(JSON.parse(existingResponseDataJson) as Record<string, unknown>);
  }, [existingResponseDataJson]);

  function updateValue(fieldId: string, value: unknown) {
    setFormValues((previous) => ({ ...previous, [fieldId]: value }));
  }

  async function handleSubmit() {
    if (!data || data.access !== 'available') return;
    setSubmitError('');
    try {
      const payment = paymentRequired
        ? await (async () => {
          await ensureRazorpayCheckoutLoaded();
          const order = await createPaymentOrder.mutateAsync({
            formId: data.id,
            accessPassword: submittedAccessPassword,
            respondentToken,
            data: formValues,
          });
          return await openRazorpayCheckout({
            ...(order as RazorpayOrderResponse),
            name: order.formTitle,
            themeColor: '#0ea5e9',
          });
        })()
        : undefined;

      await submit.mutateAsync({
        formId: data.id,
        accessPassword: submittedAccessPassword,
        respondentToken,
        payment,
        data: formValues,
      });
      setSubmissionState(hasEditableResponse ? 'updated' : 'created');
      if (!data.allowResponseEdits) {
        setSubmissionLock(lockKey);
        setStoredSubmissionLock(true);
      }
      setCurrentPageIndex(0);
    } catch (issue: unknown) {
      setSubmitError(issue instanceof Error ? issue.message : 'Submission failed. Please try again.');
    }
  }

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#03001c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: "'Rajdhani', sans-serif", color: 'rgba(167,139,250,0.5)', fontSize: 13 }}>Loading form...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 48 }}>💀</span>
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#ff4444' }}>Form Not Found</p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{error?.message || 'This form may have been unpublished, expired, or deleted.'}</p>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>← Go Back</button>
      </div>
    );
  }

  if (data.access === 'locked') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ParticleBackground particles={world.particles} count={18} />
        <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: 'min(520px, 100%)', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: 18, boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22`, padding: '28px 26px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 22, color: world.accentColor, marginBottom: 10 }}>{data.title}</div>
            {data.description && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: world.mutedColor, marginBottom: 18 }}>{data.description}</div>}
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, color: world.accentColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Password Protected Form</div>
            <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', margin: '0 0 16px' }}>Enter the form password to unlock submissions.</p>
            <input type="password" value={typedAccessPassword} onChange={(event) => setTypedAccessPassword(event.target.value)} placeholder="Enter form password" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.borderColor}66`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: 14 }} />
            {unlockAttempted && <div style={{ background: 'rgba(255,90,90,0.1)', border: '1px solid rgba(255,90,90,0.25)', borderRadius: 10, padding: '10px 12px', color: '#ff9f9f', fontSize: 12, marginBottom: 14, fontFamily: "'Rajdhani', sans-serif" }}>Password required or incorrect.</div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => { setUnlockAttempted(true); setSubmittedAccessPassword(typedAccessPassword || undefined); }} style={{ background: world.buttonGradient, color: world.buttonText, fontSize: 13, padding: '12px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.08em' }}>Unlock Form</button>
              <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.72)', fontSize: 13, padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.08em' }}>Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const interactiveFieldCount = countInteractiveFields(formFields, formValues);
  const isLastPage = currentPageIndex === pages.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={18} />
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${world.borderColor}33`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${world.borderColor}33`, color: world.mutedColor, borderRadius: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>← HOME</button>
        <span style={{ fontSize: 16 }}>{world.emoji}</span>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 12, fontWeight: 700, color: world.accentColor, letterSpacing: '0.06em' }}>PUBLIC FORM</div>
      </div>

      <div className="tr-scroll" style={{ position: 'relative', zIndex: 5, flex: 1, padding: '28px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22` }}>
          <div style={{ background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`, borderBottom: `1px solid ${world.borderColor}44`, padding: '24px 26px 18px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(15px, 3vw, 22px)', fontWeight: 900, color: world.accentColor, letterSpacing: '0.04em', marginBottom: 6 }}>{data.title}</div>
            {data.description && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: world.mutedColor, marginBottom: 6 }}>{data.description}</div>}
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {world.emoji} {world.name} · {interactiveFieldCount} fields
            </div>
            {(data.expiresAt || data.remainingResponses !== null) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {data.expiresAt && <span style={{ fontSize: 10, color: world.accentColor, border: `1px solid ${world.accentColor}33`, borderRadius: 999, padding: '4px 8px' }}>Expires {new Date(data.expiresAt).toLocaleString()}</span>}
                {data.remainingResponses !== null && <span style={{ fontSize: 10, color: world.accentColor, border: `1px solid ${world.accentColor}33`, borderRadius: 999, padding: '4px 8px' }}>{data.remainingResponses} responses remaining</span>}
                {paymentConfig?.enabled && <span style={{ fontSize: 10, color: world.accentColor, border: `1px solid ${world.accentColor}33`, borderRadius: 999, padding: '4px 8px' }}>Premium Access {formatAmount(paymentConfig.amount, paymentConfig.currency)}</span>}
              </div>
            )}
            {currentPage && <PageHeader world={world} pageIndex={currentPageIndex} pageCount={pages.length} title={currentPage.title} description={currentPage.description} />}
          </div>

          {!submissionLocked && !showSubmissionConfirmation ? (
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {paymentConfig?.enabled && (
                <div style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, padding: '10px 14px', color: '#bfe9ff', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                  This form requires a Razorpay payment of {formatAmount(paymentConfig.amount, paymentConfig.currency)} before submission.
                </div>
              )}
              {hasEditableResponse && (
                <div data-testid="shared-form-edit-banner" style={{ background: 'rgba(255,220,120,0.08)', border: '1px solid rgba(255,220,120,0.24)', borderRadius: 10, padding: '10px 14px', color: '#ffe7a1', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                  You already submitted this form from this browser. Saving again will update your previous response.
                </div>
              )}
              {currentPage ? renderPageRows(currentPage.fields, world, formValues, updateValue) : null}
              {submitError && <div style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff8888', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>⚠ {submitError}</div>}
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`, marginTop: 8 }} />
              <NavigationRow world={world} canGoBack={currentPageIndex > 0} isLastPage={isLastPage} onPrevious={() => setCurrentPageIndex((page) => Math.max(page - 1, 0))} onNext={() => setCurrentPageIndex((page) => Math.min(page + 1, pages.length - 1))} onSubmit={handleSubmit} isSubmitting={submit.isPending || createPaymentOrder.isPending} submitLabel={hasEditableResponse ? '💾 UPDATE RESPONSE' : paymentRequired ? `Pay ${paymentConfig ? formatAmount(paymentConfig.amount, paymentConfig.currency) : ''} & Submit` : '🏃 SUBMIT FORM'} />
            </div>
          ) : (
            <div style={{ padding: '48px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 64, filter: `drop-shadow(0 0 16px ${world.glowColor})` }}>🏆</span>
              <div data-testid="shared-form-status-title" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: world.accentColor, filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>{submissionState === 'updated' ? 'Response Updated!' : submissionState === 'created' ? 'Submitted!' : 'Already Submitted'}</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: world.mutedColor, letterSpacing: '0.08em', maxWidth: 320 }}>{submissionState === 'updated' ? 'Your latest answers replaced the earlier response from this browser.' : submissionState === 'created' ? (data.allowResponseEdits ? `Mission complete in ${world.name}. Reopen this link from the same browser to edit your response.` : `Mission complete in ${world.name}.`) : 'This browser has already submitted a response for this form. Additional submissions are disabled unless the creator enables edits.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SharedFormView({ encoded, slug, onBack }: Props) {
  if (slug) return <ApiFormView slug={slug} onBack={onBack} />;
  return <EncodedFormView encoded={encoded ?? ''} onBack={onBack} />;
}

function EncodedFormView({ encoded, onBack }: { encoded: string; onBack: () => void }) {
  const [payload, setPayload] = useState<SharedPayload | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [storedSubmissionLock, setStoredSubmissionLock] = useState(false);

  useEffect(() => {
    setPayload(decodeSharePayload(encoded));
  }, [encoded]);

  const lockKey = useMemo(() => buildSubmissionLockKey('share', encoded), [encoded]);

  useEffect(() => {
    setStoredSubmissionLock(hasSubmissionLock(lockKey));
  }, [lockKey]);

  if (!payload) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <span style={{ fontSize: '48px' }}>💀</span>
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '18px', color: '#ff4444' }}>Invalid Share Link</p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>This link may be corrupted or expired.</p>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', padding: '10px 20px', border: '1px solid rgba(255,255,255,0.15)' }}>← Go Back</button>
      </div>
    );
  }

  const world = resolveSharedWorld(payload.worldId);
  const avatar = resolveSharedAvatar(payload.avatarId);
  const pages = useMemo(() => getFormPages(payload.fields, formValues), [payload.fields, formValues]);
  const currentPage = pages[Math.min(currentPageIndex, Math.max(pages.length - 1, 0))];

  useEffect(() => {
    if (currentPageIndex > pages.length - 1) {
      setCurrentPageIndex(Math.max(pages.length - 1, 0));
    }
  }, [currentPageIndex, pages.length]);

  async function copyLink() {
    const copiedOk = await copyText(window.location.href);
    if (!copiedOk) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const interactiveFieldCount = countInteractiveFields(payload.fields, formValues);
  const isLastPage = currentPageIndex === pages.length - 1;
  const submissionLocked = submitted || storedSubmissionLock;

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={18} />
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${world.borderColor}33`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.07)', color: world.mutedColor, fontSize: '11px', padding: '7px 12px', border: `1px solid ${world.borderColor}33`, letterSpacing: '0.08em', flexShrink: 0 }}>← HOME</button>
        <span style={{ fontSize: '16px' }}>{world.emoji}</span>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', fontWeight: 700, color: world.accentColor, letterSpacing: '0.06em' }}>SHARED FORM</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={copyLink} style={{ background: copied ? `${world.accentColor}22` : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? world.accentColor + '55' : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', color: copied ? world.accentColor : 'rgba(255,255,255,0.5)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '7px 13px', cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.2s' }}>{copied ? '✓ COPIED!' : '🔗 COPY LINK'}</button>
          {avatar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${avatar.color}15`, border: `1px solid ${avatar.color}33`, borderRadius: '12px', padding: '3px 9px 3px 5px' }}>
              <span style={{ fontSize: '16px' }}>{avatar.emoji}</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: avatar.color, fontWeight: 600 }}>{avatar.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="tr-scroll" style={{ position: 'relative', zIndex: 5, flex: 1, padding: '28px 20px 40px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: '16px', overflow: 'hidden', boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22`, animation: 'card-enter 0.4s ease-out both' }}>
          <div style={{ background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`, borderBottom: `1px solid ${world.borderColor}44`, padding: '24px 26px 18px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(15px, 3vw, 24px)', fontWeight: 900, color: world.accentColor, letterSpacing: '0.04em', filter: `drop-shadow(0 0 10px ${world.glowColor})`, animation: 'text-glow 3s ease-in-out infinite', marginBottom: '6px' }}>{payload.formTitle || 'Shared Form'}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.mutedColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {world.emoji} {world.name} · {interactiveFieldCount} field{interactiveFieldCount !== 1 ? 's' : ''}
            </div>
            {currentPage && <PageHeader world={world} pageIndex={currentPageIndex} pageCount={pages.length} title={currentPage.title} description={currentPage.description} />}
          </div>

          {!submissionLocked ? (
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {currentPage ? renderPageRows(currentPage.fields, world, formValues, (fieldId, value) => setFormValues((previous) => ({ ...previous, [fieldId]: value })) ) : null}
              <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`, marginTop: '8px' }} />
              <NavigationRow world={world} canGoBack={currentPageIndex > 0} isLastPage={isLastPage} onPrevious={() => setCurrentPageIndex((page) => Math.max(page - 1, 0))} onNext={() => setCurrentPageIndex((page) => Math.min(page + 1, pages.length - 1))} onSubmit={() => { setSubmissionLock(lockKey); setStoredSubmissionLock(true); setSubmitted(true); setCurrentPageIndex(0); }} submitLabel="🏃 SUBMIT FORM" />
            </div>
          ) : (
            <div style={{ padding: '48px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', animation: 'fade-in 0.5s ease-out' }}>
              <span style={{ fontSize: '64px', animation: 'bounce 1s ease-in-out infinite', filter: `drop-shadow(0 0 16px ${world.glowColor})` }}>🏆</span>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '20px', fontWeight: 900, color: world.accentColor, filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>{submitted ? 'Submitted!' : 'Already Submitted'}</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: world.mutedColor, letterSpacing: '0.08em', maxWidth: '280px' }}>{submitted ? `Mission complete in ${world.name}.` : 'This response has already been recorded in this browser. Additional submissions are disabled.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
