import { useEffect, useMemo, useState } from 'react';
import { FormVerseLogo } from './Logo';
import { PremiumIcon } from './PremiumIcon';
import { trpc } from '../trpc';
import { ALL_TEMPLATES } from '../formTemplates';
import type { HomeTheme } from './HomePage';
import { APP_DISPLAY_FONT, APP_UI_FONT, getAppSurfaceTheme } from './appSurfaceTheme';

type Props = { onBack: () => void; onViewForm: (slug: string) => void; onEnter: () => void; theme: HomeTheme };

const EXPLORE_THEMES = {
  dark: {
    bg: '#060014',
    navBg: 'rgba(6,0,20,0.88)',
    navBorder: 'rgba(124,58,237,0.1)',
    grid: 'rgba(124,58,237,0.04)',
    orbA: 'rgba(0,229,255,0.06)',
    orbB: 'rgba(124,58,237,0.08)',
    accent: '#00e5ff',
    accentSoft: '#a78bfa',
    accentBorder: 'rgba(0,229,255,0.2)',
    panelBg: 'rgba(255,255,255,0.04)',
    panelBorder: 'rgba(124,58,237,0.25)',
    panelBorderSoft: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    headingText: '#f2e9ff',
    subText: 'rgba(200,185,255,0.55)',
    mutedText: 'rgba(167,139,250,0.4)',
    weakText: 'rgba(255,255,255,0.35)',
    cardBg: 'rgba(255,255,255,0.025)',
    buttonGradient: 'linear-gradient(135deg, #5b21b6, #06b6d4)',
    ctaGradient: 'linear-gradient(135deg, #5b21b6, #7c3aed, #00bcd4)',
    buttonText: '#ffffff',
    sampleLabel: '#ffd700',
    sampleSubText: 'rgba(255,215,160,0.62)',
    titleGradient: 'linear-gradient(140deg, #a78bfa, #00e5ff)',
  },
  light: {
    bg: 'linear-gradient(160deg, #fff9c4 0%, #fffde7 45%, #fff8e1 100%)',
    navBg: 'rgba(12,6,0,0.9)',
    navBorder: 'rgba(255,180,0,0.18)',
    grid: 'rgba(180,120,0,0.08)',
    orbA: 'rgba(255,180,0,0.12)',
    orbB: 'rgba(255,80,0,0.1)',
    accent: '#ff9900',
    accentSoft: '#cc4400',
    accentBorder: 'rgba(255,160,0,0.22)',
    panelBg: 'rgba(255,255,255,0.72)',
    panelBorder: 'rgba(255,160,0,0.22)',
    panelBorderSoft: 'rgba(120,70,0,0.12)',
    text: '#1f1200',
    headingText: '#351000',
    subText: 'rgba(53,16,0,0.72)',
    mutedText: 'rgba(80,40,0,0.55)',
    weakText: 'rgba(80,40,0,0.42)',
    cardBg: 'rgba(255,255,255,0.82)',
    buttonGradient: 'linear-gradient(135deg, #cc4400, #ffcc00)',
    ctaGradient: 'linear-gradient(135deg, #cc4400, #ff6600, #ffcc00)',
    buttonText: '#fffdf4',
    sampleLabel: '#cc4400',
    sampleSubText: 'rgba(120,55,0,0.72)',
    titleGradient: 'linear-gradient(140deg, #111111, #cc3300, #ffb300)',
  },
  rainbow: {
    bg: 'linear-gradient(160deg, #05000f 0%, #000a05 45%, #0a0005 100%)',
    navBg: 'rgba(4,0,12,0.9)',
    navBorder: 'rgba(255,0,180,0.18)',
    grid: 'rgba(255,0,200,0.05)',
    orbA: 'rgba(0,220,255,0.08)',
    orbB: 'rgba(255,180,0,0.08)',
    accent: '#00f0ff',
    accentSoft: '#ff66c4',
    accentBorder: 'rgba(255,0,180,0.22)',
    panelBg: 'rgba(255,255,255,0.04)',
    panelBorder: 'rgba(255,0,180,0.25)',
    panelBorderSoft: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    headingText: '#f8f4ff',
    subText: 'rgba(235,220,255,0.6)',
    mutedText: 'rgba(220,190,255,0.5)',
    weakText: 'rgba(255,255,255,0.4)',
    cardBg: 'rgba(255,255,255,0.03)',
    buttonGradient: 'linear-gradient(135deg, #ff0080, #7c3aed, #00e5ff)',
    ctaGradient: 'linear-gradient(135deg, #ff0080, #7c3aed, #00e5ff)',
    buttonText: '#ffffff',
    sampleLabel: '#ffe066',
    sampleSubText: 'rgba(255,225,160,0.72)',
    titleGradient: 'linear-gradient(140deg, #ff66c4, #ffe066, #00e5ff)',
  },
  firecracker: {
    bg: 'linear-gradient(160deg, #120004 0%, #1d0500 48%, #090012 100%)',
    navBg: 'rgba(18,0,4,0.9)',
    navBorder: 'rgba(255,98,0,0.18)',
    grid: 'rgba(255,90,0,0.05)',
    orbA: 'rgba(255,98,0,0.08)',
    orbB: 'rgba(255,196,0,0.08)',
    accent: '#ffb000',
    accentSoft: '#ff5a00',
    accentBorder: 'rgba(255,120,0,0.24)',
    panelBg: 'rgba(255,255,255,0.035)',
    panelBorder: 'rgba(255,98,0,0.24)',
    panelBorderSoft: 'rgba(255,255,255,0.08)',
    text: '#fffaf5',
    headingText: '#fff1db',
    subText: 'rgba(255,214,180,0.62)',
    mutedText: 'rgba(255,180,130,0.52)',
    weakText: 'rgba(255,240,225,0.4)',
    cardBg: 'rgba(255,255,255,0.028)',
    buttonGradient: 'linear-gradient(135deg, #ff5a00, #ffb000)',
    ctaGradient: 'linear-gradient(135deg, #ff5a00, #ff7b00, #ffcf33)',
    buttonText: '#fffdf8',
    sampleLabel: '#ffcf33',
    sampleSubText: 'rgba(255,220,160,0.72)',
    titleGradient: 'linear-gradient(140deg, #fff1db, #ffb000, #ff5a00)',
  },
  jugnu: {
    bg: 'linear-gradient(160deg, #03110a 0%, #071a11 45%, #020b08 100%)',
    navBg: 'rgba(3,17,10,0.9)',
    navBorder: 'rgba(174,255,0,0.14)',
    grid: 'rgba(174,255,0,0.04)',
    orbA: 'rgba(174,255,0,0.08)',
    orbB: 'rgba(0,229,255,0.06)',
    accent: '#c6ff4d',
    accentSoft: '#5eead4',
    accentBorder: 'rgba(174,255,0,0.2)',
    panelBg: 'rgba(255,255,255,0.03)',
    panelBorder: 'rgba(174,255,0,0.18)',
    panelBorderSoft: 'rgba(255,255,255,0.08)',
    text: '#f8fff0',
    headingText: '#f4ffe2',
    subText: 'rgba(221,255,186,0.58)',
    mutedText: 'rgba(198,255,120,0.48)',
    weakText: 'rgba(240,255,230,0.38)',
    cardBg: 'rgba(255,255,255,0.025)',
    buttonGradient: 'linear-gradient(135deg, #6ee7b7, #c6ff4d)',
    ctaGradient: 'linear-gradient(135deg, #2dd4bf, #84cc16, #c6ff4d)',
    buttonText: '#052012',
    sampleLabel: '#c6ff4d',
    sampleSubText: 'rgba(216,255,170,0.72)',
    titleGradient: 'linear-gradient(140deg, #f4ffe2, #c6ff4d, #5eead4)',
  },
} as const;

const WORLD_COLORS: Record<string, string> = {
  'temple-run': '#f97316',
  temple: '#f97316',
  globe: '#c9a84c',
  library: '#a855f7',
};

const CATEGORIES = ['All', 'Realm Runner', 'Globe Explorer', 'The Library', 'Registration', 'Survey', 'Quiz'];

const CATEGORY_TO_QUERY_VALUE = {
  All: 'all',
  'Realm Runner': 'realm-runner',
  'Globe Explorer': 'globe-explorer',
  'The Library': 'the-library',
  Registration: 'registration',
  Survey: 'survey',
  Quiz: 'quiz',
} as const;

const STARTER_KEYWORDS: Record<string, string[]> = {
  Registration: ['registration', 'register', 'onboarding', 'application'],
  Survey: ['survey', 'feedback', 'review'],
  Quiz: ['quiz', 'assessment', 'test'],
};

const SAMPLE_FORMS = [
  {
    id: 'sample-temple-feedback',
    templateId: 'customer-feedback',
    worldTheme: 'temple-run',
    title: 'Realm Feedback Quest',
    description: 'A cinematic feedback form for events, experiences, onboarding, and community check-ins.',
    badge: 'Built-in Sample',
  },
  {
    id: 'sample-globe-registration',
    templateId: 'event-registration',
    worldTheme: 'globe',
    title: 'Global Event Registration',
    description: 'A travel-ready registration starter for events, programs, cohorts, and journeys.',
    badge: 'Built-in Sample',
  },
  {
    id: 'sample-library-archive',
    templateId: 'vendor-onboarding',
    worldTheme: 'library',
    title: 'Archive Intake Record',
    description: 'A rich record-collection sample for lore, archives, guild intake, and world-building.',
    badge: 'Built-in Sample',
  },
  {
    id: 'sample-quiz-knowledge',
    templateId: 'performance-review',
    worldTheme: 'library',
    title: 'Knowledge Review Scroll',
    description: 'A structured sample you can adapt for quizzes, evaluations, and guided assessments.',
    badge: 'Built-in Sample',
  },
  {
    id: 'sample-job-application',
    templateId: 'job-application',
    worldTheme: 'temple-run',
    title: 'Hero Application Form',
    description: 'A sample application flow for hiring, onboarding, fellowships, and recruit missions.',
    badge: 'Built-in Sample',
  },
  {
    id: 'sample-contact-us',
    templateId: 'contact-us',
    worldTheme: 'globe',
    title: 'Expedition Contact Form',
    description: 'A lightweight sample for support, enquiries, partnerships, and discovery requests.',
    badge: 'Built-in Sample',
  },
];

export function ExplorePage({ onBack, onViewForm, onEnter, theme }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hovCard, setHovCard] = useState<string | null>(null);
  const T = EXPLORE_THEMES[theme];
  const S = getAppSurfaceTheme(theme);
  const isLight = theme === 'light';

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const categoryValue = CATEGORY_TO_QUERY_VALUE[category as keyof typeof CATEGORY_TO_QUERY_VALUE];
  const queryInput = useMemo(() => ({
    query: search.trim() || undefined,
    category: categoryValue,
    page,
    pageSize: 18,
  }), [search, categoryValue, page]);

  const { data, isLoading, error, isFetching } = trpc.forms.listPublic.useQuery(queryInput, {
    staleTime: 60_000,
  });

  type Form = NonNullable<typeof data>['items'][number];

  const forms = (data?.items ?? []) as Form[];

  const sampleForms = SAMPLE_FORMS.map((sample) => {
    const template = ALL_TEMPLATES.find((item) => item.id === sample.templateId);
    return {
      ...sample,
      icon: template?.icon ?? '📋',
      category: template?.category ?? 'general',
      fieldsCount: template?.fields.length ?? 0,
    };
  }).filter((sample) => {
    const q = search.toLowerCase();
    const haystack = [sample.title, sample.description, sample.worldTheme, sample.category].join(' ').toLowerCase();
    const matchSearch = !q || haystack.includes(q);
    const matchCat = category === 'All'
      || (category === 'Realm Runner' && sample.worldTheme.includes('temple'))
      || (category === 'Globe Explorer' && sample.worldTheme.includes('globe'))
      || (category === 'The Library' && sample.worldTheme.includes('library'))
      || (STARTER_KEYWORDS[category]?.some((keyword) => haystack.includes(keyword)) ?? false);
    return matchSearch && matchCat;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: S.background, overflowY: 'auto', fontFamily: APP_UI_FONT }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${S.gridPrimary} 1px, transparent 1px), linear-gradient(90deg, ${S.gridSecondary} 1px, transparent 1px)`, backgroundSize: S.gridSize }} />
        <div style={{ position: 'absolute', inset: 0, background: S.auraA }} />
        <div style={{ position: 'absolute', inset: 0, background: S.auraB }} />
        <div style={{ position: 'absolute', inset: 0, background: S.auraC }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: S.navBg, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${S.navBorder}`, padding: '0 32px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormVerseLogo size={30} textSize={12} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: S.panelSoft, border: `1px solid ${S.panelBorderStrong}`, borderRadius: 12, color: S.textSoft, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>← Back</button>
          <button onClick={onEnter} style={{ background: S.actionGradient, border: `1px solid ${S.accentBorder}`, borderRadius: 12, color: S.buttonText, fontSize: 12, fontWeight: 700, padding: '9px 18px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 14px 28px ${S.accentBorder}` }}><PremiumIcon token="🚀" size={15} />Build Your Own</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: S.panel, border: `1px solid ${S.accentBorder}`, borderRadius: 100, padding: '6px 18px', marginBottom: 20, boxShadow: S.shadow }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Public Form Gallery</span>
          </div>
          <h1 style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: T.headingText, margin: '0 0 14px', background: T.titleGradient, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: isLight ? '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171,81,0,0.14)' : '0 0 18px rgba(8, 4, 26, 0.26)', letterSpacing: '-0.03em' }}>
            Explore Forms
          </h1>
          <p style={{ fontSize: 15, color: T.subText, maxWidth: 480, margin: '0 auto' }}>
            Browse and fill public forms created by the community. No account required.
          </p>
        </div>

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.mutedText }}><PremiumIcon token="🔍" size={16} /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search forms..."
              style={{ width: '100%', background: S.inputBg, border: `1px solid ${S.inputBorder}`, borderRadius: 12, color: S.inputText, fontSize: 14, padding: '11px 14px 11px 42px', outline: 'none', fontFamily: APP_UI_FONT, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ background: category === cat ? S.accentSoft : S.panel, border: `1px solid ${category === cat ? S.accent : S.panelBorder}`, borderRadius: 12, color: category === cat ? S.heading : T.mutedText, fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em', transition: 'all 0.18s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <div style={{ fontSize: 12, color: T.mutedText, marginBottom: 20, letterSpacing: '0.08em' }}>
            {data?.total ?? 0} form{(data?.total ?? 0) !== 1 ? 's' : ''} found
            {isFetching ? ' · Updating…' : ''}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: T.cardBg, border: `1px solid ${T.panelBorderSoft}`, borderRadius: 16, padding: '24px', height: 180, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <span style={{ display: 'inline-flex', marginBottom: 16, color: '#ff7777' }}><PremiumIcon token="⚠" size={40} /></span>
            <p style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 28, color: '#ff7777' }}>Could not load forms</p>
            <p style={{ fontSize: 13, color: T.weakText }}>Make sure the API server is running.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && forms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <span style={{ display: 'inline-flex', marginBottom: 16, color: T.accentSoft }}><PremiumIcon token="🔭" size={44} /></span>
            <p style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 30, color: T.text, marginBottom: 8 }}>No forms found</p>
            <p style={{ fontSize: 13, color: T.mutedText, marginBottom: 28 }}>{search ? 'Try a different search term.' : 'No real public forms have been published yet. Built-in sample forms are available below.'}</p>
            <button onClick={() => document.getElementById('sample-forms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ background: S.actionGradient, border: `1px solid ${S.accentBorder}`, borderRadius: 12, color: S.buttonText, fontSize: 13, fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>See Built-in Samples</button>
          </div>
        )}

        {/* Form cards grid */}
        {!isLoading && forms.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {forms.map((form: Form) => {
                const color = WORLD_COLORS[form.worldTheme ?? ''] ?? T.accentSoft;
                const isH = hovCard === form.id;
                return (
                  <div key={form.id}
                    onMouseEnter={() => setHovCard(form.id)}
                    onMouseLeave={() => setHovCard(null)}
                    style={{ background: isH ? `linear-gradient(160deg, ${color}12, ${isLight ? 'rgba(255,255,255,0.96)' : 'rgba(6,0,20,0.95)'})` : T.cardBg, border: `1px solid ${isH ? color + '35' : T.panelBorderSoft}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.25s', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? `0 12px 32px rgba(0,0,0,${isLight ? 0.16 : 0.4}), 0 0 24px ${color}18` : 'none', cursor: 'pointer' }}
                    onClick={() => onViewForm(form.slug)}>

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isH ? color : T.mutedText, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {form.worldTheme ?? 'General'}
                      </div>
                      <h3 style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 24, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.18, letterSpacing: '-0.02em' }}>{form.title}</h3>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                      <PremiumIcon token={form.worldTheme?.includes('temple') ? '🏛️' : form.worldTheme?.includes('globe') ? '✈️' : form.worldTheme?.includes('library') ? '📚' : '📋'} size={18} />
                    </div>
                  </div>

                  {form.description && (
                    <p style={{ fontSize: 12, color: T.mutedText, lineHeight: 1.6, margin: 0 }}>{form.description}</p>
                  )}

                  {/* Footer */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.panelBorderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                      <span style={{ fontSize: 11, color: T.mutedText }}>Public · Active</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isH ? color : T.mutedText, letterSpacing: '0.06em' }}>Fill Form →</span>
                  </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: T.mutedText, letterSpacing: '0.06em' }}>
                Page {data?.page ?? 1} of {data?.totalPages ?? 1}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!data?.hasPreviousPage}
                  style={{ background: S.panel, border: `1px solid ${S.panelBorder}`, borderRadius: 12, color: data?.hasPreviousPage ? T.text : T.weakText, fontSize: 12, fontWeight: 700, padding: '10px 16px', cursor: data?.hasPreviousPage ? 'pointer' : 'not-allowed', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!data?.hasNextPage}
                  style={{ background: S.actionGradient, border: `1px solid ${S.accentBorder}`, borderRadius: 12, color: data?.hasNextPage ? S.buttonText : S.buttonText, fontSize: 12, fontWeight: 800, padding: '10px 16px', cursor: data?.hasNextPage ? 'pointer' : 'not-allowed', fontFamily: APP_UI_FONT, letterSpacing: '0.04em', opacity: data?.hasNextPage ? 1 : 0.45 }}>
                  Next Page
                </button>
              </div>
            </div>
          </>
        )}

        <section id="sample-forms" style={{ marginTop: 72 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sampleLabel, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>Built-in Sample Forms</div>
              <h2 style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Start From Curated Samples</h2>
              <p style={{ fontSize: 13, color: T.subText, margin: 0, maxWidth: 620, lineHeight: 1.7 }}>These are built-in examples, not public user submissions. Use them like an Overleaf-style starter gallery.</p>
            </div>
            <button onClick={onEnter} style={{ background: S.panel, border: `1px solid ${S.panelBorder}`, borderRadius: 12, color: T.text, fontSize: 12, fontWeight: 700, padding: '10px 18px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>Use In Builder</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {sampleForms.map((sample) => {
              const color = WORLD_COLORS[sample.worldTheme] ?? T.sampleLabel;
              const isH = hovCard === sample.id;
              return (
                <div key={sample.id}
                  onMouseEnter={() => setHovCard(sample.id)}
                  onMouseLeave={() => setHovCard(null)}
                  style={{ background: isH ? `linear-gradient(160deg, ${color}12, ${isLight ? 'rgba(255,255,255,0.96)' : 'rgba(6,0,20,0.95)'})` : T.cardBg, border: `1px solid ${isH ? color + '40' : T.panelBorderSoft}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.25s', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? `0 12px 32px rgba(0,0,0,${isLight ? 0.16 : 0.4}), 0 0 24px ${color}18` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isH ? color : T.sampleSubText, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {sample.badge} · {sample.worldTheme}
                      </div>
                      <h3 style={{ fontFamily: APP_DISPLAY_FONT, fontSize: 24, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.18, letterSpacing: '-0.02em' }}>{sample.title}</h3>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {sample.icon}
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: T.mutedText, lineHeight: 1.6, margin: 0 }}>{sample.description}</p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: T.text, background: T.panelBg, border: `1px solid ${T.panelBorderSoft}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sample.category}</span>
                    <span style={{ fontSize: 10, color: T.text, background: T.panelBg, border: `1px solid ${T.panelBorderSoft}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sample.fieldsCount} fields</span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.panelBorderSoft}` }}>
                    <span style={{ fontSize: 11, color: T.sampleSubText }}>Starter sample</span>
                    <button onClick={onEnter} style={{ background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.92))`, border: 'none', borderRadius: 12, color: '#1a0820', fontSize: 11, fontWeight: 800, padding: '10px 14px', cursor: 'pointer', fontFamily: APP_UI_FONT, letterSpacing: '0.04em' }}>Use Template</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div style={{ marginTop: 80, textAlign: 'center', borderTop: `1px solid ${T.navBorder}`, paddingTop: 60 }}>
          <p style={{ fontSize: 14, color: T.mutedText, marginBottom: 20 }}>Want to publish your own form here?</p>
          <button onClick={onEnter} style={{ background: S.actionGradient, border: `1px solid ${S.accentBorder}`, borderRadius: 12, color: S.buttonText, fontSize: 13, fontWeight: 700, padding: '13px 32px', cursor: 'pointer', letterSpacing: '0.04em', fontFamily: APP_UI_FONT, boxShadow: isLight ? '0 10px 24px rgba(171,81,0,0.18)' : `0 0 24px ${T.accentSoft}55`, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <PremiumIcon token="🚀" size={16} />Create & Publish a Form
          </button>
        </div>
      </div>
    </div>
  );
}
