import { useState } from 'react';
import { FormVerseLogo } from './Logo';
import { PremiumIcon } from './PremiumIcon';
import { trpc } from '../trpc';
import { copyText } from '../utils/clipboard';
import { COUNTRIES } from '../globeData';
import { LIBRARY_WORLDS } from '../libraryData';
import { WORLDS } from '../themes';
import { getSessionEmail } from '../auth';
import type { HomeTheme } from './HomePage';
import { APP_UI_FONT, getAppSurfaceTheme } from './appSurfaceTheme';

type Props = {
  playerName: string;
  onBack: () => void;
  onLogout: () => void;
  onViewForm: (slug: string) => void;
  onAdmin?: () => void;
  theme: HomeTheme;
};

const C = {
  bg: 'linear-gradient(145deg, #0b0f16 0%, #111722 42%, #19131e 100%)',
  panel: 'rgba(16,20,29,0.78)',
  panelStrong: 'rgba(20,24,34,0.92)',
  panelSoft: 'rgba(255,255,255,0.04)',
  border: 'rgba(224,229,239,0.1)',
  borderStrong: 'rgba(214,188,134,0.18)',
  line: 'rgba(214,188,134,0.05)',
  text: '#f3efe8',
  textSoft: 'rgba(227,232,241,0.8)',
  muted: 'rgba(191,198,212,0.54)',
  mutedStrong: 'rgba(201,207,220,0.68)',
  accent: '#d9bb84',
  accentSoft: 'rgba(217,187,132,0.1)',
  accentBorder: 'rgba(217,187,132,0.22)',
  blue: '#afbdd7',
  blueSoft: 'rgba(175,189,215,0.1)',
  blueBorder: 'rgba(175,189,215,0.2)',
  purpleL: '#a78bfa',
  gold: '#e8c88f',
  green: '#74c69d',
  greenSoft: 'rgba(116,198,157,0.12)',
  greenBorder: 'rgba(116,198,157,0.24)',
  warning: '#d59b6a',
  warningSoft: 'rgba(213,155,106,0.12)',
  warningBorder: 'rgba(213,155,106,0.26)',
  danger: '#d98c8c',
  dangerSoft: 'rgba(217,140,140,0.12)',
  dangerBorder: 'rgba(217,140,140,0.22)',
  shadow: '0 28px 72px rgba(0,0,0,0.34)',
};

const panelStyle = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  boxShadow: C.shadow,
};

const modalPanelStyle = {
  background: C.panelStrong,
  border: `1px solid ${C.borderStrong}`,
  boxShadow: '0 30px 84px rgba(0,0,0,0.42)',
};

function ghostButtonStyle() {
  return {
    background: C.panelSoft,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.mutedStrong,
    fontSize: 11,
    fontWeight: 600,
    padding: '7px 12px',
    cursor: 'pointer',
    fontFamily: APP_UI_FONT,
    letterSpacing: '0.06em',
    transition: 'all 0.2s ease',
  };
}

function accentButtonStyle(color: string, background: string, border: string) {
  return {
    background,
    border: `1px solid ${border}`,
    borderRadius: 10,
    color,
    fontSize: 11,
    fontWeight: 700,
    padding: '7px 12px',
    cursor: 'pointer',
    fontFamily: APP_UI_FONT,
    letterSpacing: '0.06em',
    transition: 'all 0.2s ease',
  };
}

function pillStyle(color: string, background: string, border: string) {
  return {
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    background,
    border: `1px solid ${border}`,
    borderRadius: 999,
    padding: '3px 9px',
    color,
    letterSpacing: '0.1em',
  };
}

const WORLD_EMOJI: Record<string, string> = {
  temple: '🏛️', 'temple-run': '🏛️', globe: '✈️', library: '📚',
};

const TEMPLE_WORLD_IDS = new Set(WORLDS.map((world) => world.id));
const GLOBE_COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.id, country]));
const LIBRARY_WORLD_MAP = new Map(LIBRARY_WORLDS.map((world) => [world.id, world]));

function getFormThemeMeta(worldTheme?: string | null) {
  if (!worldTheme) {
    return { color: C.purpleL, emoji: '📋', label: 'General Form' };
  }

  if (TEMPLE_WORLD_IDS.has(worldTheme)) {
    const world = WORLDS.find((entry) => entry.id === worldTheme);
    return {
      color: world?.accentColor ?? '#f97316',
      emoji: world?.emoji ?? WORLD_EMOJI.temple,
      label: world?.name ?? 'Realm Runner',
    };
  }

  const country = GLOBE_COUNTRY_MAP.get(worldTheme);
  if (country) {
    return {
      color: country.accentColor,
      emoji: country.emoji,
      label: `Globe · ${country.name}`,
    };
  }

  const libraryWorld = LIBRARY_WORLD_MAP.get(worldTheme as (typeof LIBRARY_WORLDS)[number]['id']);
  if (libraryWorld) {
    return {
      color: libraryWorld.accentColor,
      emoji: libraryWorld.emoji,
      label: `Library · ${libraryWorld.name}`,
    };
  }

  return { color: C.purpleL, emoji: '📋', label: worldTheme };
}

type View = 'list' | 'responses' | 'analytics';

type ResponseDetail = {
  id: string;
  data: Record<string, unknown>;
  submittedAt: string | Date;
};

type SelectedFormMeta = {
  id: string;
  title: string;
  slug: string;
};

function formatResponseValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DashboardPage({ playerName, onBack, onLogout, onViewForm, onAdmin, theme }: Props) {
  const S = getAppSurfaceTheme(theme);
  const [view, setView] = useState<View>('list');
  const [selectedForm, setSelectedForm] = useState<SelectedFormMeta | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);
  const [responseQuery, setResponseQuery] = useState('');
  const [responsePage, setResponsePage] = useState(1);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const sessionEmail = getSessionEmail();
  const selectedFormId = selectedForm?.id ?? null;
  const selectedFormTitle = selectedForm?.title ?? '';
  const selectedFormSlug = selectedForm?.slug ?? '';

  const trpcUtils = trpc.useUtils();
  const { data: forms, isLoading, error: formsError, refetch } = trpc.forms.myForms.useQuery();
  const publishMut = trpc.forms.setPublished.useMutation({
    onSuccess: async () => {
      await refetch();
      await trpcUtils.forms.listPublic.invalidate();
    },
  });
  const visibilityMut = trpc.forms.update.useMutation({
    onSuccess: async () => {
      await refetch();
      await trpcUtils.forms.listPublic.invalidate();
    },
  });
  const archiveMut = trpc.forms.update.useMutation({
    onSuccess: async () => {
      await refetch();
      await trpcUtils.forms.listPublic.invalidate();
    },
  });
  const cloneMut = trpc.forms.clone.useMutation({ onSuccess: () => refetch() });
  const deleteMut  = trpc.forms.delete.useMutation({ onSuccess: () => refetch() });
  const exportMut = trpc.responses.exportCsv.useQuery(
    { formId: selectedFormId ?? '', query: responseQuery || undefined },
    { enabled: false, staleTime: 0 }
  );

  const { data: responses, isLoading: respLoading, error: responsesError } = trpc.responses.list.useQuery(
    { formId: selectedFormId!, query: responseQuery || undefined, page: responsePage, pageSize: 12 },
    { enabled: !!selectedFormId && view === 'responses' }
  );

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = trpc.responses.analytics.useQuery(
    { formId: selectedFormId! },
    { enabled: !!selectedFormId && view === 'analytics' }
  );

  function openResponses(formId: string, title: string, slug: string) {
    setSelectedForm({ id: formId, title, slug });
    setSelectedResponse(null);
    setResponseQuery('');
    setResponsePage(1);
    setView('responses');
  }

  function openAnalytics(formId: string, title: string, slug: string) {
    setSelectedForm({ id: formId, title, slug });
    setSelectedResponse(null);
    setView('analytics');
  }

  async function copyFormLink(slug: string) {
    const link = `${window.location.origin}?slug=${slug}`;
    const copied = await copyText(link);
    if (!copied) return;
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  }

  async function toggleVisibility(id: string, visibility: 'public' | 'unlisted') {
    await visibilityMut.mutateAsync({ id, visibility: visibility === 'public' ? 'unlisted' : 'public' });
  }

  async function toggleArchive(id: string, archived: boolean) {
    await archiveMut.mutateAsync({ id, archived: !archived });
  }

  async function cloneForm(id: string, title: string) {
    await cloneMut.mutateAsync({ id, title: `${title} Copy` });
  }

  async function exportResponses() {
    if (!selectedFormId) return;
    const result = await exportMut.refetch();
    if (!result.data) return;

    const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.data.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const activeForms = forms?.filter((form) => !form.archived) ?? [];
  const archivedForms = forms?.filter((form) => form.archived) ?? [];
  const visibleForms = [...activeForms, ...archivedForms];
  const qrUrl = qrSlug ? `${window.location.origin}?slug=${qrSlug}` : '';
  const qrImageUrl = qrSlug ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}` : '';

  function handleCopyClick(slug: string) {
    void copyFormLink(slug);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: S.background, overflowY: 'auto', fontFamily: APP_UI_FONT }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: S.auraA }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: S.auraB }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: S.auraC }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: S.navBg, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${S.navBorder}`, padding: '0 32px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FormVerseLogo size={28} textSize={11} />
          <div style={{ width: 1, height: 20, background: C.borderStrong }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Creator Dashboard</div>
            <div style={{ fontSize: 11, color: C.muted }}>{playerName}{sessionEmail ? ` · ${sessionEmail}` : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {onAdmin && (
            <button onClick={onAdmin} style={{ ...accentButtonStyle(C.gold, C.accentSoft, C.accentBorder), fontSize: 12, padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}><PremiumIcon token="🛠" size={14} />Admin</button>
          )}
          <button onClick={onBack} style={{ ...ghostButtonStyle(), fontSize: 12, color: C.textSoft, padding: '7px 14px' }}>← Back</button>
          <button onClick={onLogout} style={{ ...accentButtonStyle(C.danger, C.dangerSoft, C.dangerBorder), fontSize: 12, fontWeight: 600, padding: '7px 14px' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb / sub-nav */}
        {view !== 'list' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <button onClick={() => setView('list')}
              style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', fontFamily: APP_UI_FONT, padding: 0, letterSpacing: '0.06em' }}>
              My Forms
            </button>
            <span style={{ color: C.muted }}>›</span>
            <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{selectedFormTitle}</span>
            <span style={{ fontSize: 12, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, borderRadius: 999, padding: '2px 10px', color: C.accent, marginLeft: 4 }}>
              {view === 'responses' ? 'Responses' : 'Analytics'}
            </span>
          </div>
        )}

        {/* ── MY FORMS LIST ── */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: C.text, margin: '0 0 4px' }}>My Forms</h1>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{forms?.length ?? 0} form{forms?.length !== 1 ? 's' : ''} in your collection · {activeForms.length} active · {archivedForms.length} archived</p>
              </div>
            </div>

            {isLoading && (
              <div style={{ display: 'grid', gap: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ ...panelStyle, borderRadius: 18, height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}

            {!isLoading && formsError && (
              <div style={{ padding: '22px 24px', background: C.dangerSoft, border: `1px solid ${C.dangerBorder}`, borderRadius: 18 }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: C.text, marginBottom: 6 }}>Dashboard could not load your forms</div>
                <div style={{ fontSize: 13, color: 'rgba(255,190,190,0.8)', marginBottom: 14 }}>{formsError.message || 'Your session may have expired. Sign in again and retry.'}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => void refetch()} style={{ ...ghostButtonStyle(), fontSize: 12, fontWeight: 700, padding: '9px 14px', color: C.text }}>Retry</button>
                  <button onClick={onLogout} style={{ ...accentButtonStyle(C.danger, C.dangerSoft, C.dangerBorder), fontSize: 12, padding: '9px 14px' }}>Sign Out</button>
                </div>
              </div>
            )}

            {!isLoading && !formsError && (!forms || forms.length === 0) && (
              <div style={{ ...panelStyle, textAlign: 'center', padding: '80px 24px', border: `1px dashed ${C.borderStrong}`, borderRadius: 20 }}>
                <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>📭</span>
                <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: C.text, marginBottom: 8 }}>No forms yet</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Create your first form by choosing an experience from the previous screen.</p>
                <button onClick={onBack} style={{ ...accentButtonStyle(C.text, 'linear-gradient(135deg, #f0e3c3 0%, #d6b273 42%, #9f7a54 100%)', 'rgba(217,187,132,0.24)'), border: 'none', padding: '12px 28px', fontSize: 13, color: '#1f1711', boxShadow: '0 18px 38px rgba(0,0,0,0.2)' }}>← Back to Experiences</button>
              </div>
            )}

            {forms && forms.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visibleForms.map((form: (typeof forms)[0]) => {
                  const themeMeta = getFormThemeMeta(form.worldTheme);
                  const color = themeMeta.color;
                  const emoji = themeMeta.emoji;
                  return (
                    <div key={form.id} style={{ ...panelStyle, borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s, transform 0.2s ease', backdropFilter: 'blur(18px)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${color}33`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{emoji}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, fontWeight: 900, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.title}</span>
                          {/* Publish badge */}
                          <span style={form.published ? pillStyle(C.green, C.greenSoft, C.greenBorder) : pillStyle(C.muted, C.panelSoft, C.border)}>
                            {form.published ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                          {form.archived && (
                            <span style={pillStyle(C.warning, C.warningSoft, C.warningBorder)}>
                              ARCHIVED
                            </span>
                          )}
                          {/* Visibility badge */}
                          <span style={form.visibility === 'public' ? pillStyle(C.blue, C.blueSoft, C.blueBorder) : pillStyle(C.muted, C.panelSoft, C.border)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token={form.visibility === 'public' ? '🌐' : '🔗'} size={12} />{form.visibility === 'public' ? 'PUBLIC' : 'UNLISTED'}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {themeMeta.label} · Created {new Date(form.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => !form.archived && form.published && onViewForm(form.slug)}
                          disabled={form.archived || !form.published}
                          style={accentButtonStyle(color, `${color}12`, `${color}33`)}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="👁" size={13} />View</span>
                        </button>
                        <button onClick={() => openResponses(form.id, form.title, form.slug)}
                          style={ghostButtonStyle()}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="📥" size={13} />Responses</span>
                        </button>
                        <button onClick={() => openAnalytics(form.id, form.title, form.slug)}
                          style={ghostButtonStyle()}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="📊" size={13} />Analytics</span>
                        </button>
                        <button onClick={() => handleCopyClick(form.slug)}
                          style={copiedSlug === form.slug ? accentButtonStyle(C.green, C.greenSoft, C.greenBorder) : ghostButtonStyle()}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token={copiedSlug === form.slug ? '✓' : '🔗'} size={13} />{copiedSlug === form.slug ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <button onClick={() => setQrSlug(form.slug)}
                          style={ghostButtonStyle()}>
                          ▦ QR
                        </button>
                        <button onClick={() => void cloneForm(form.id, form.title)}
                          disabled={cloneMut.isPending}
                          style={ghostButtonStyle()}>
                          ⧉ Clone
                        </button>
                        <button onClick={() => void toggleVisibility(form.id, form.visibility)}
                          disabled={visibilityMut.isPending || form.archived}
                          style={form.visibility === 'public' ? accentButtonStyle(C.blue, C.blueSoft, C.blueBorder) : accentButtonStyle(C.accent, C.accentSoft, C.accentBorder)}>
                          {form.visibility === 'public' ? 'Make Unlisted' : 'Make Public'}
                        </button>
                        <button onClick={() => publishMut.mutate({ id: form.id, published: !form.published })}
                          disabled={publishMut.isPending || form.archived}
                          style={form.published ? accentButtonStyle(C.warning, C.warningSoft, C.warningBorder) : accentButtonStyle(C.green, C.greenSoft, C.greenBorder)}>
                          {form.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => void toggleArchive(form.id, form.archived)}
                          disabled={archiveMut.isPending}
                          style={form.archived ? accentButtonStyle(C.green, C.greenSoft, C.greenBorder) : accentButtonStyle(C.warning, C.warningSoft, C.warningBorder)}>
                          {form.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button onClick={() => { if (confirm('Delete this form? This cannot be undone.')) deleteMut.mutate({ id: form.id }); }}
                          disabled={deleteMut.isPending}
                          style={{ ...accentButtonStyle(C.danger, C.dangerSoft, C.dangerBorder), padding: '7px 10px', letterSpacing: 'normal' }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── RESPONSES ── */}
        {view === 'responses' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Responses</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  value={responseQuery}
                  onChange={(event) => { setResponseQuery(event.target.value); setResponsePage(1); }}
                  placeholder="Search responses..."
                  style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, borderRadius: 12, color: S.inputText, fontSize: 13, padding: '9px 12px', fontFamily: APP_UI_FONT }}
                />
                <button onClick={() => void exportResponses()}
                  style={{ ...accentButtonStyle(C.blue, C.blueSoft, C.blueBorder), padding: '9px 12px', letterSpacing: '0.08em' }}>
                  ⬇ Export CSV
                </button>
              </div>
            </div>

            {respLoading && <div style={{ color: C.muted, fontSize: 14 }}>Loading responses...</div>}

            {!respLoading && responsesError && (
              <div style={{ padding: '18px 20px', background: C.dangerSoft, border: `1px solid ${C.dangerBorder}`, borderRadius: 18, color: 'rgba(255,190,190,0.86)', fontSize: 13 }}>
                {responsesError.message || 'Responses could not be loaded for this form.'}
              </div>
            )}

            {!respLoading && !responsesError && responses && responses.items.length === 0 && (
              <div style={{ ...panelStyle, textAlign: 'center', padding: '60px 24px', border: `1px dashed ${C.borderStrong}`, borderRadius: 18 }}>
                <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>📭</span>
                <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: C.text, marginBottom: 6 }}>No responses yet</p>
                <p style={{ fontSize: 13, color: C.muted }}>Share your form link to start collecting responses.</p>
              </div>
            )}

            {responses && responses.items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {responses.items.map((resp, i: number) => {
                  return (
                    <div
                      key={resp.id}
                      onClick={() => setSelectedResponse({ id: resp.id, data: resp.data as Record<string, unknown>, submittedAt: resp.submittedAt })}
                      style={{ ...panelStyle, borderRadius: 16, padding: '16px 20px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 11, color: C.accent }}>Response #{(responses.page - 1) * responses.pageSize + i + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{new Date(resp.submittedAt).toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: C.blue, letterSpacing: '0.08em' }}>Open →</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                        {Object.keys(resp.data).slice(0, 8).map(k => (
                          <div key={k}>
                            <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 13, color: C.textSoft, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatResponseValue(resp.data[k as keyof typeof resp.data])}</div>
                          </div>
                        ))}
                        {Object.keys(resp.data).length > 8 && <div style={{ fontSize: 11, color: C.muted, alignSelf: 'flex-end' }}>+{Object.keys(resp.data).length - 8} more fields</div>}
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Showing {responses.items.length} of {responses.total} matching responses
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => setResponsePage((page) => Math.max(1, page - 1))}
                      disabled={responses.page <= 1}
                      style={{ ...ghostButtonStyle(), fontWeight: 700, padding: '8px 12px' }}>
                      ← Prev
                    </button>
                    <span style={{ fontSize: 12, color: C.muted }}>Page {responses.page} / {responses.totalPages}</span>
                    <button onClick={() => setResponsePage((page) => Math.min(responses.totalPages, page + 1))}
                      disabled={responses.page >= responses.totalPages}
                      style={{ ...ghostButtonStyle(), fontWeight: 700, padding: '8px 12px' }}>
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {view === 'analytics' && (
          <>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 28px' }}>Analytics</h2>

            {analyticsLoading && <div style={{ color: C.muted, fontSize: 14 }}>Loading analytics...</div>}

            {!analyticsLoading && analyticsError && (
              <div style={{ padding: '18px 20px', background: C.dangerSoft, border: `1px solid ${C.dangerBorder}`, borderRadius: 18, color: 'rgba(255,190,190,0.86)', fontSize: 13 }}>
                {analyticsError.message || 'Analytics could not be loaded for this form.'}
              </div>
            )}

            {!analyticsLoading && !analyticsError && analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
                {[
                  { icon: '📥', label: 'Total Responses', value: analytics.totalResponses, color: C.blue },
                  { icon: analytics.published ? '✅' : '🚫', label: 'Status', value: analytics.published ? 'Published' : 'Draft', color: analytics.published ? C.green : C.warning },
                  { icon: analytics.visibility === 'public' ? '🌐' : '🔗', label: 'Visibility', value: analytics.visibility === 'public' ? 'Public' : 'Unlisted', color: analytics.visibility === 'public' ? C.blue : C.accent },
                  { icon: '📅', label: 'Created', value: new Date(analytics.createdAt).toLocaleDateString(), color: C.gold },
                  { icon: analytics.archived ? '📦' : '🟢', label: 'Workflow', value: analytics.archived ? 'Archived' : 'Active', color: analytics.archived ? C.warning : C.green },
                  { icon: '⏳', label: 'Expiry / Limit', value: analytics.expiresAt ? new Date(analytics.expiresAt).toLocaleDateString() : analytics.responseLimit ? `${analytics.responseLimit} max` : 'Open', color: C.accent },
                ].map((stat, i) => (
                  <div key={i} style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25`, borderRadius: 18, padding: '20px', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {!analyticsLoading && !analyticsError && analytics && analytics.timeline.length > 0 && (
              <div style={{ ...panelStyle, borderRadius: 20, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: C.text, marginBottom: 18 }}>Response Timeline</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${analytics.timeline.length}, minmax(0, 1fr))`, gap: 10, alignItems: 'end', minHeight: 180 }}>
                  {analytics.timeline.map((point) => {
                    const peak = Math.max(...analytics.timeline.map((entry) => entry.count), 1);
                    const height = `${Math.max((point.count / peak) * 100, 12)}%`;
                    return (
                      <div key={point.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>{point.count}</div>
                        <div style={{ width: '100%', maxWidth: 42, height: 120, display: 'flex', alignItems: 'end' }}>
                          <div style={{ width: '100%', height, borderRadius: 12, background: 'linear-gradient(180deg, rgba(175,189,215,0.96), rgba(217,187,132,0.48))', boxShadow: '0 0 18px rgba(175,189,215,0.14)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em' }}>{point.date.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {qrSlug && (
        <div onClick={() => setQrSlug(null)} style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(7,10,16,0.74)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(event) => event.stopPropagation()} style={{ ...modalPanelStyle, width: 'min(420px, 100%)', borderRadius: 22, padding: '22px 22px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: C.text, marginBottom: 8 }}>Share QR Code</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>{qrUrl}</div>
            <img src={qrImageUrl} alt="Form QR code" style={{ width: 280, height: 280, maxWidth: '100%', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: '#fff', padding: 12, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => void copyFormLink(qrSlug)} style={{ ...accentButtonStyle(C.blue, C.blueSoft, C.blueBorder), fontSize: 12, padding: '9px 14px' }}>Copy Link</button>
              <button onClick={() => setQrSlug(null)} style={{ ...ghostButtonStyle(), fontSize: 12, fontWeight: 700, padding: '9px 14px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedResponse && (
        <div
          onClick={() => setSelectedResponse(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(7,10,16,0.74)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ ...modalPanelStyle, width: 'min(760px, 100%)', maxHeight: '80vh', overflowY: 'auto', borderRadius: 22, padding: '22px 22px 18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: C.text, marginBottom: 6 }}>Response Details</div>
                <div style={{ fontSize: 12, color: C.muted }}>{selectedFormTitle} · {new Date(selectedResponse.submittedAt).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedResponse(null)} style={{ ...ghostButtonStyle(), fontSize: 12, fontWeight: 700, padding: '8px 12px' }}>Close</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(selectedResponse.data).map(([key, value]) => (
                <div key={key} style={{ ...panelStyle, borderRadius: 16, padding: '14px 16px', boxShadow: 'none' }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>{key}</div>
                  <div style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.6, wordBreak: 'break-word' }}>{formatResponseValue(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
