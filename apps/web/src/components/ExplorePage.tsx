import { useState } from 'react';
import { FormVerseLogo } from './Logo';
import { trpc } from '../trpc';
import { ALL_TEMPLATES } from '../formTemplates';

type Props = { onBack: () => void; onViewForm: (slug: string) => void; onEnter: () => void };

const C = {
  bg: '#060014', purple: '#7c3aed', purpleL: '#a78bfa',
  cyan: '#00e5ff', gold: '#ffd700', magenta: '#ff0080',
};

const WORLD_COLORS: Record<string, string> = {
  'temple-run': '#f97316',
  temple: '#f97316',
  globe: '#c9a84c',
  library: '#a855f7',
};

const CATEGORIES = ['All', 'Temple Run', 'Globe Explorer', 'The Library', 'Registration', 'Survey', 'Quiz'];

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
    title: 'Temple Feedback Quest',
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

export function ExplorePage({ onBack, onViewForm, onEnter }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [hovCard, setHovCard] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.forms.listPublic.useQuery({ limit: 20 }, {
    staleTime: 60_000,
  });

  type Form = NonNullable<typeof data>[number];

  const forms = ((data ?? []) as Form[]).filter((f: Form) => {
    const q = search.toLowerCase();
    const haystack = [f.title, f.description ?? '', f.worldTheme ?? ''].join(' ').toLowerCase();
    const matchSearch = !q || haystack.includes(q);
    const matchCat = category === 'All'
      || (category === 'Temple Run' && (f.worldTheme ?? '').includes('temple'))
      || (category === 'Globe Explorer' && (f.worldTheme ?? '').includes('globe'))
      || (category === 'The Library' && (f.worldTheme ?? '').includes('library'))
      || (STARTER_KEYWORDS[category]?.some((keyword) => haystack.includes(keyword)) ?? false);
    return matchSearch && matchCat;
  });

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
      || (category === 'Temple Run' && sample.worldTheme.includes('temple'))
      || (category === 'Globe Explorer' && sample.worldTheme.includes('globe'))
      || (category === 'The Library' && sample.worldTheme.includes('library'))
      || (STARTER_KEYWORDS[category]?.some((keyword) => haystack.includes(keyword)) ?? false);
    return matchSearch && matchCat;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
        <div style={{ position: 'absolute', top: '10%', right: '0', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '0', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,0,20,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.1)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormVerseLogo size={30} textSize={12} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: C.purpleL, fontSize: 12, fontWeight: 600, padding: '7px 16px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>← Back</button>
          <button onClick={onEnter} style={{ background: 'linear-gradient(135deg, #5b21b6, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em' }}>🚀 Build Your Own</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 100, padding: '5px 18px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Public Form Gallery</span>
          </div>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#f2e9ff', margin: '0 0 14px', background: `linear-gradient(140deg, ${C.purpleL}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(8, 4, 26, 0.26)' }}>
            Explore Forms
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(200,185,255,0.55)', maxWidth: 480, margin: '0 auto' }}>
            Browse and fill public forms created by the community. No account required.
          </p>
        </div>

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search forms..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, color: '#fff', fontSize: 14, padding: '11px 14px 11px 42px', outline: 'none', fontFamily: "'Rajdhani', sans-serif", boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ background: category === cat ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)', border: `1px solid ${category === cat ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: category === cat ? C.purpleL : 'rgba(167,139,250,0.5)', fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em', transition: 'all 0.18s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.4)', marginBottom: 20, letterSpacing: '0.08em' }}>
            {forms.length} form{forms.length !== 1 ? 's' : ''} found
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', height: 180, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>⚠️</span>
            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#ff7777' }}>Could not load forms</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Make sure the API server is running.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && forms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🔭</span>
            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, color: '#fff', marginBottom: 8 }}>No forms found</p>
            <p style={{ fontSize: 13, color: 'rgba(167,139,250,0.4)', marginBottom: 28 }}>{search ? 'Try a different search term.' : 'No real public forms have been published yet. Built-in sample forms are available below.'}</p>
            <button onClick={() => document.getElementById('sample-forms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ background: 'linear-gradient(135deg, #5b21b6, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.1em' }}>See Built-in Samples</button>
          </div>
        )}

        {/* Form cards grid */}
        {!isLoading && forms.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {forms.map((form: Form) => {
              const color = WORLD_COLORS[form.worldTheme ?? ''] ?? C.purpleL;
              const isH = hovCard === form.id;
              return (
                <div key={form.id}
                  onMouseEnter={() => setHovCard(form.id)}
                  onMouseLeave={() => setHovCard(null)}
                  style={{ background: isH ? `linear-gradient(160deg, ${color}12, rgba(6,0,20,0.95))` : 'rgba(255,255,255,0.025)', border: `1px solid ${isH ? color + '35' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.25s', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? `0 12px 32px rgba(0,0,0,0.4), 0 0 24px ${color}18` : 'none', cursor: 'pointer' }}
                  onClick={() => onViewForm(form.slug)}>

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isH ? color : 'rgba(167,139,250,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {form.worldTheme ?? 'General'}
                      </div>
                      <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 15, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.3 }}>{form.title}</h3>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {form.worldTheme?.includes('temple') ? '🏛️' : form.worldTheme?.includes('globe') ? '✈️' : form.worldTheme?.includes('library') ? '📚' : '📋'}
                    </div>
                  </div>

                  {form.description && (
                    <p style={{ fontSize: 12, color: 'rgba(167,139,250,0.4)', lineHeight: 1.6, margin: 0 }}>{form.description}</p>
                  )}

                  {/* Footer */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                      <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.4)' }}>Public · Active</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isH ? color : 'rgba(167,139,250,0.5)', letterSpacing: '0.06em' }}>Fill Form →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <section id="sample-forms" style={{ marginTop: 72 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>Built-in Sample Forms</div>
              <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Start From Curated Samples</h2>
              <p style={{ fontSize: 13, color: 'rgba(200,185,255,0.5)', margin: 0, maxWidth: 620, lineHeight: 1.7 }}>These are built-in examples, not public user submissions. Use them like an Overleaf-style starter gallery.</p>
            </div>
            <button onClick={onEnter} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, padding: '10px 18px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>Use In Builder</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {sampleForms.map((sample) => {
              const color = WORLD_COLORS[sample.worldTheme] ?? C.gold;
              const isH = hovCard === sample.id;
              return (
                <div key={sample.id}
                  onMouseEnter={() => setHovCard(sample.id)}
                  onMouseLeave={() => setHovCard(null)}
                  style={{ background: isH ? `linear-gradient(160deg, ${color}12, rgba(6,0,20,0.95))` : 'rgba(255,255,255,0.025)', border: `1px solid ${isH ? color + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.25s', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? `0 12px 32px rgba(0,0,0,0.4), 0 0 24px ${color}18` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isH ? color : 'rgba(255,215,160,0.58)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {sample.badge} · {sample.worldTheme}
                      </div>
                      <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 15, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.3 }}>{sample.title}</h3>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {sample.icon}
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'rgba(167,139,250,0.45)', lineHeight: 1.6, margin: 0 }}>{sample.description}</p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sample.category}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sample.fieldsCount} fields</span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,215,160,0.62)' }}>Starter sample</span>
                    <button onClick={onEnter} style={{ background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.92))`, border: 'none', borderRadius: 10, color: '#1a0820', fontSize: 11, fontWeight: 800, padding: '10px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>Use Template</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div style={{ marginTop: 80, textAlign: 'center', borderTop: '1px solid rgba(124,58,237,0.1)', paddingTop: 60 }}>
          <p style={{ fontSize: 14, color: 'rgba(167,139,250,0.4)', marginBottom: 20 }}>Want to publish your own form here?</p>
          <button onClick={onEnter} style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed, #00bcd4)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, padding: '13px 32px', cursor: 'pointer', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
            🚀 Create & Publish a Form
          </button>
        </div>
      </div>
    </div>
  );
}
