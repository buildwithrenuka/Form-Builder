import { useState } from 'react';
import { FormVerseLogo } from './Logo';
import { PremiumIcon } from './PremiumIcon';
import { trpc } from '../trpc';
import { copyText } from '../utils/clipboard';
import { COUNTRIES } from '../globeData';
import { LIBRARY_WORLDS } from '../libraryData';
import { WORLDS } from '../themes';
import { getSessionEmail } from '../auth';

type Props = {
  playerName: string;
  onBack: () => void;
  onLogout: () => void;
  onViewForm: (slug: string) => void;
  onAdmin?: () => void;
};

const C = {
  bg: '#060014', purple: '#7c3aed', purpleL: '#a78bfa',
  cyan: '#00e5ff', gold: '#ffd700', magenta: '#ff0080',
  green: '#22c55e',
};

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

export function DashboardPage({ playerName, onBack, onLogout, onViewForm, onAdmin }: Props) {
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
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,0,20,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.12)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FormVerseLogo size={28} textSize={11} />
          <div style={{ width: 1, height: 20, background: 'rgba(124,58,237,0.2)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.purpleL, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Creator Dashboard</div>
            <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)' }}>{playerName}{sessionEmail ? ` · ${sessionEmail}` : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {onAdmin && (
            <button onClick={onAdmin} style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.28)', borderRadius: 8, color: C.gold, fontSize: 12, fontWeight: 700, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 8 }}><PremiumIcon token="🛠" size={14} />Admin</button>
          )}
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: C.purpleL, fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>← Back</button>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 8, color: 'rgba(255,120,120,0.7)', fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb / sub-nav */}
        {view !== 'list' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <button onClick={() => setView('list')}
              style={{ background: 'transparent', border: 'none', color: 'rgba(167,139,250,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", padding: 0, letterSpacing: '0.06em' }}>
              My Forms
            </button>
            <span style={{ color: 'rgba(167,139,250,0.3)' }}>›</span>
            <span style={{ fontSize: 13, color: C.purpleL, fontWeight: 700 }}>{selectedFormTitle}</span>
            <span style={{ fontSize: 12, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 10px', color: C.purpleL, marginLeft: 4 }}>
              {view === 'responses' ? 'Responses' : 'Analytics'}
            </span>
          </div>
        )}

        {/* ── MY FORMS LIST ── */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>My Forms</h1>
                <p style={{ fontSize: 13, color: 'rgba(167,139,250,0.4)', margin: 0 }}>{forms?.length ?? 0} form{forms?.length !== 1 ? 's' : ''} in your collection · {activeForms.length} active · {archivedForms.length} archived</p>
              </div>
            </div>

            {isLoading && (
              <div style={{ display: 'grid', gap: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}

            {!isLoading && formsError && (
              <div style={{ padding: '22px 24px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.22)', borderRadius: 14 }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 6 }}>Dashboard could not load your forms</div>
                <div style={{ fontSize: 13, color: 'rgba(255,190,190,0.8)', marginBottom: 14 }}>{formsError.message || 'Your session may have expired. Sign in again and retry.'}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => void refetch()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Retry</button>
                  <button onClick={onLogout} style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.24)', borderRadius: 8, color: 'rgba(255,190,190,0.9)', fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Sign Out</button>
                </div>
              </div>
            )}

            {!isLoading && !formsError && (!forms || forms.length === 0) && (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(124,58,237,0.2)', borderRadius: 16 }}>
                <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>📭</span>
                <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#fff', marginBottom: 8 }}>No forms yet</p>
                <p style={{ fontSize: 13, color: 'rgba(167,139,250,0.4)', marginBottom: 24 }}>Create your first form by choosing an experience from the previous screen.</p>
                <button onClick={onBack} style={{ background: 'linear-gradient(135deg, #5b21b6, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em' }}>← Back to Experiences</button>
              </div>
            )}

            {forms && forms.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visibleForms.map((form: (typeof forms)[0]) => {
                  const themeMeta = getFormThemeMeta(form.worldTheme);
                  const color = themeMeta.color;
                  const emoji = themeMeta.emoji;
                  return (
                    <div key={form.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${color}33`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{emoji}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.title}</span>
                          {/* Publish badge */}
                          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, background: form.published ? '#22c55e18' : 'rgba(255,255,255,0.06)', border: `1px solid ${form.published ? '#22c55e44' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '2px 8px', color: form.published ? C.green : 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
                            {form.published ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                          {form.archived && (
                            <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '2px 8px', color: '#f97316', letterSpacing: '0.1em' }}>
                              ARCHIVED
                            </span>
                          )}
                          {/* Visibility badge */}
                          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, background: form.visibility === 'public' ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.visibility === 'public' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 6, padding: '2px 8px', color: form.visibility === 'public' ? C.cyan : 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token={form.visibility === 'public' ? '🌐' : '🔗'} size={12} />{form.visibility === 'public' ? 'PUBLIC' : 'UNLISTED'}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.35)' }}>
                          {themeMeta.label} · Created {new Date(form.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => !form.archived && form.published && onViewForm(form.slug)}
                          disabled={form.archived || !form.published}
                          style={{ background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 8, color: color, fontSize: 11, fontWeight: 700, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="👁" size={13} />View</span>
                        </button>
                        <button onClick={() => openResponses(form.id, form.title, form.slug)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="📥" size={13} />Responses</span>
                        </button>
                        <button onClick={() => openAnalytics(form.id, form.title, form.slug)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="📊" size={13} />Analytics</span>
                        </button>
                        <button onClick={() => handleCopyClick(form.slug)}
                          style={{ background: copiedSlug === form.slug ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copiedSlug === form.slug ? '#22c55e44' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, color: copiedSlug === form.slug ? C.green : 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em', transition: 'all 0.2s' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token={copiedSlug === form.slug ? '✓' : '🔗'} size={13} />{copiedSlug === form.slug ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <button onClick={() => setQrSlug(form.slug)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          ▦ QR
                        </button>
                        <button onClick={() => void cloneForm(form.id, form.title)}
                          disabled={cloneMut.isPending}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          ⧉ Clone
                        </button>
                        <button onClick={() => void toggleVisibility(form.id, form.visibility)}
                          disabled={visibilityMut.isPending || form.archived}
                          style={{ background: form.visibility === 'public' ? 'rgba(0,229,255,0.08)' : 'rgba(124,58,237,0.12)', border: `1px solid ${form.visibility === 'public' ? 'rgba(0,229,255,0.28)' : 'rgba(124,58,237,0.35)'}`, borderRadius: 8, color: form.visibility === 'public' ? C.cyan : C.purpleL, fontSize: 11, fontWeight: 700, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          {form.visibility === 'public' ? 'Make Unlisted' : 'Make Public'}
                        </button>
                        <button onClick={() => publishMut.mutate({ id: form.id, published: !form.published })}
                          disabled={publishMut.isPending || form.archived}
                          style={{ background: form.published ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${form.published ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 8, color: form.published ? '#f97316' : C.green, fontSize: 11, fontWeight: 700, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          {form.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => void toggleArchive(form.id, form.archived)}
                          disabled={archiveMut.isPending}
                          style={{ background: form.archived ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)', border: `1px solid ${form.archived ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)'}`, borderRadius: 8, color: form.archived ? C.green : '#f97316', fontSize: 11, fontWeight: 700, padding: '7px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em' }}>
                          {form.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button onClick={() => { if (confirm('Delete this form? This cannot be undone.')) deleteMut.mutate({ id: form.id }); }}
                          disabled={deleteMut.isPending}
                          style={{ background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)', borderRadius: 8, color: 'rgba(255,100,100,0.7)', fontSize: 11, fontWeight: 600, padding: '7px 10px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>
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
              <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Responses</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  value={responseQuery}
                  onChange={(event) => { setResponseQuery(event.target.value); setResponsePage(1); }}
                  placeholder="Search responses..."
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, padding: '9px 12px', fontFamily: "'Rajdhani', sans-serif" }}
                />
                <button onClick={() => void exportResponses()}
                  style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 8, color: C.cyan, fontSize: 11, fontWeight: 700, padding: '9px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>
                  ⬇ Export CSV
                </button>
              </div>
            </div>

            {respLoading && <div style={{ color: 'rgba(167,139,250,0.5)', fontSize: 14 }}>Loading responses...</div>}

            {!respLoading && responsesError && (
              <div style={{ padding: '18px 20px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.22)', borderRadius: 14, color: 'rgba(255,190,190,0.86)', fontSize: 13 }}>
                {responsesError.message || 'Responses could not be loaded for this form.'}
              </div>
            )}

            {!respLoading && !responsesError && responses && responses.items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(124,58,237,0.15)', borderRadius: 14 }}>
                <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>📭</span>
                <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 6 }}>No responses yet</p>
                <p style={{ fontSize: 13, color: 'rgba(167,139,250,0.4)' }}>Share your form link to start collecting responses.</p>
              </div>
            )}

            {responses && responses.items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {responses.items.map((resp, i: number) => {
                  return (
                    <div
                      key={resp.id}
                      onClick={() => setSelectedResponse({ id: resp.id, data: resp.data as Record<string, unknown>, submittedAt: resp.submittedAt })}
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 11, color: C.purpleL }}>Response #{(responses.page - 1) * responses.pageSize + i + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.35)' }}>{new Date(resp.submittedAt).toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: C.cyan, letterSpacing: '0.08em' }}>Open →</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                        {Object.keys(resp.data).slice(0, 8).map(k => (
                          <div key={k}>
                            <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 13, color: 'rgba(220,210,255,0.85)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatResponseValue(resp.data[k as keyof typeof resp.data])}</div>
                          </div>
                        ))}
                        {Object.keys(resp.data).length > 8 && <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.3)', alignSelf: 'flex-end' }}>+{Object.keys(resp.data).length - 8} more fields</div>}
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.48)' }}>
                    Showing {responses.items.length} of {responses.total} matching responses
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => setResponsePage((page) => Math.max(1, page - 1))}
                      disabled={responses.page <= 1}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 700, padding: '8px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>
                      ← Prev
                    </button>
                    <span style={{ fontSize: 12, color: 'rgba(167,139,250,0.48)' }}>Page {responses.page} / {responses.totalPages}</span>
                    <button onClick={() => setResponsePage((page) => Math.min(responses.totalPages, page + 1))}
                      disabled={responses.page >= responses.totalPages}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(200,185,255,0.7)', fontSize: 11, fontWeight: 700, padding: '8px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>
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
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 28px' }}>Analytics</h2>

            {analyticsLoading && <div style={{ color: 'rgba(167,139,250,0.5)', fontSize: 14 }}>Loading analytics...</div>}

            {!analyticsLoading && analyticsError && (
              <div style={{ padding: '18px 20px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.22)', borderRadius: 14, color: 'rgba(255,190,190,0.86)', fontSize: 13 }}>
                {analyticsError.message || 'Analytics could not be loaded for this form.'}
              </div>
            )}

            {!analyticsLoading && !analyticsError && analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
                {[
                  { icon: '📥', label: 'Total Responses', value: analytics.totalResponses, color: C.cyan },
                  { icon: analytics.published ? '✅' : '🚫', label: 'Status', value: analytics.published ? 'Published' : 'Draft', color: analytics.published ? C.green : '#f97316' },
                  { icon: analytics.visibility === 'public' ? '🌐' : '🔗', label: 'Visibility', value: analytics.visibility === 'public' ? 'Public' : 'Unlisted', color: analytics.visibility === 'public' ? C.cyan : C.purpleL },
                  { icon: '📅', label: 'Created', value: new Date(analytics.createdAt).toLocaleDateString(), color: C.gold },
                  { icon: analytics.archived ? '📦' : '🟢', label: 'Workflow', value: analytics.archived ? 'Archived' : 'Active', color: analytics.archived ? '#f97316' : C.green },
                  { icon: '⏳', label: 'Expiry / Limit', value: analytics.expiresAt ? new Date(analytics.expiresAt).toLocaleDateString() : analytics.responseLimit ? `${analytics.responseLimit} max` : 'Open', color: C.purpleL },
                ].map((stat, i) => (
                  <div key={i} style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}25`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {!analyticsLoading && !analyticsError && analytics && analytics.timeline.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 18 }}>Response Timeline</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${analytics.timeline.length}, minmax(0, 1fr))`, gap: 10, alignItems: 'end', minHeight: 180 }}>
                  {analytics.timeline.map((point) => {
                    const peak = Math.max(...analytics.timeline.map((entry) => entry.count), 1);
                    const height = `${Math.max((point.count / peak) * 100, 12)}%`;
                    return (
                      <div key={point.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 11, color: C.cyan, fontWeight: 700 }}>{point.count}</div>
                        <div style={{ width: '100%', maxWidth: 42, height: 120, display: 'flex', alignItems: 'end' }}>
                          <div style={{ width: '100%', height, borderRadius: 12, background: 'linear-gradient(180deg, rgba(0,229,255,0.92), rgba(124,58,237,0.52))', boxShadow: '0 0 18px rgba(0,229,255,0.16)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.42)', letterSpacing: '0.06em' }}>{point.date.slice(5)}</div>
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
        <div onClick={() => setQrSlug(null)} style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(2,0,10,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: 'min(420px, 100%)', background: 'linear-gradient(160deg, rgba(14,10,30,0.98), rgba(6,0,20,0.98))', border: '1px solid rgba(124,58,237,0.28)', borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', padding: '22px 22px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#fff', marginBottom: 8 }}>Share QR Code</div>
            <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.52)', marginBottom: 18 }}>{qrUrl}</div>
            <img src={qrImageUrl} alt="Form QR code" style={{ width: 280, height: 280, maxWidth: '100%', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: '#fff', padding: 12, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => void copyFormLink(qrSlug)} style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 8, color: C.cyan, fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Copy Link</button>
              <button onClick={() => setQrSlug(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedResponse && (
        <div
          onClick={() => setSelectedResponse(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(2,0,10,0.74)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(760px, 100%)', maxHeight: '80vh', overflowY: 'auto', background: 'linear-gradient(160deg, rgba(14,10,30,0.98), rgba(6,0,20,0.98))', border: '1px solid rgba(124,58,237,0.28)', borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', padding: '22px 22px 18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#fff', marginBottom: 6 }}>Response Details</div>
                <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.52)' }}>{selectedFormTitle} · {new Date(selectedResponse.submittedAt).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedResponse(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, padding: '8px 12px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Close</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(selectedResponse.data).map(([key, value]) => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>{key}</div>
                  <div style={{ fontSize: 14, color: 'rgba(230,224,255,0.92)', lineHeight: 1.6, wordBreak: 'break-word' }}>{formatResponseValue(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
