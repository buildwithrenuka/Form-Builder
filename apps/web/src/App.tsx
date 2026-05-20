import { useState, useEffect } from 'react';
import { Screen, Avatar, WorldTheme, FormField, FormVersion } from './types';
import { WORLDS } from './themes';
import { getSession, logout } from './auth';
import { type Country } from './globeData';
// shared
import { HomePage } from './components/HomePage';
import { LoginScreen } from './components/LoginScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { SharedFormView } from './components/SharedFormView';
import { ExperienceSelector } from './components/ExperienceSelector';
// experience 1: temple run
import { StoryIntro } from './components/StoryIntro';
import { AvatarSelector } from './components/AvatarSelector';
import { WorldSelector } from './components/WorldSelector';
import { WorldCinematic } from './components/WorldCinematic';
import { WorldDoorTransition } from './components/WorldDoorTransition';
import { MapPurposeScreen } from './components/MapPurposeScreen';
import { FormBuilder } from './components/FormBuilder';
import { FormPreview } from './components/FormPreview';
// experience 2: globe
import { GlobeIntro } from './components/GlobeIntro';
import { GlobeSelector } from './components/GlobeSelector';
import { CountryCinematic } from './components/CountryCinematic';
import { GlobeFormBuilder } from './components/GlobeFormBuilder';

const VERSIONS_KEY = 'tr_form_builder_versions';

function loadVersions(): FormVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistVersions(v: FormVersion[]) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v));
}

function App() {
  // Detect shared form in URL on mount
  const [shareEncoded] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  });

  const [screen, setScreen] = useState<Screen>(() => shareEncoded ? 'shared' : 'home');
  const [playerName, setPlayerName] = useState(() => getSession() ?? '');

  // ── Experience 1: Temple Run state ──────────────────────────────────────
  const [avatar, setAvatar]       = useState<Avatar | null>(null);
  const [world, setWorld]         = useState<WorldTheme | null>(null);
  const [fields, setFields]       = useState<FormField[]>([]);
  const [formTitle, setFormTitle] = useState('My Adventure Form');
  const [purposeId, setPurposeId] = useState<string>('');
  const [versions, setVersions]   = useState<FormVersion[]>(loadVersions);

  // ── Experience 2: Globe state ───────────────────────────────────────────
  const [country, setCountry]           = useState<Country | null>(null);
  const [globeFields, setGlobeFields]   = useState<FormField[]>([]);
  const [globeTitle, setGlobeTitle]     = useState('Globe Form');

  // After login we need to know which experience was picked
  const [pendingExp, setPendingExp]     = useState<'temple-run' | 'globe' | null>(null);

  useEffect(() => { persistVersions(versions); }, [versions]);

  function restoreVersion(v: FormVersion) {
    setFormTitle(v.formTitle);
    setFields(v.fields);
    const w = WORLDS.find(x => x.id === v.worldId);
    if (w) setWorld(w);
  }

  function handleLogout() {
    logout();
    setPlayerName('');
    setScreen('home');
  }

  if (screen === 'shared' && shareEncoded) {
    return <SharedFormView encoded={shareEncoded} onBack={() => {
      window.history.replaceState({}, '', window.location.pathname);
      setScreen('home');
    }} />;
  }

  return (
    <>
      {screen === 'home' && (
        <HomePage
          onEnter={() => setScreen('experiencePicker')}
          onTutorial={() => setScreen('tutorial')}
        />
      )}

      {screen === 'tutorial' && (
        <TutorialScreen onComplete={() => setScreen('home')} />
      )}

      {/* ── Experience Picker ──────────────────────────────────────────── */}
      {screen === 'experiencePicker' && (
        <ExperienceSelector
          onSelectTempleRun={() => {
            setPendingExp('temple-run');
            setScreen('login');
          }}
          onSelectGlobe={() => {
            setPendingExp('globe');
            setScreen('login');
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          theme={pendingExp === 'globe' ? 'globe' : 'temple-run'}
          onLogin={(name) => {
            setPlayerName(name);
            if (pendingExp === 'globe') setScreen('globeIntro');
            else setScreen('story');
          }}
        />
      )}

      {/* ── Experience 1: Temple Run ───────────────────────────────────── */}
      {screen === 'story' && (
        <StoryIntro
          playerName={playerName}
          onComplete={() => setScreen('avatar')}
        />
      )}

      {screen === 'avatar' && (
        <AvatarSelector
          onSelect={(a) => { setAvatar(a); setScreen('world'); }}
          onBack={() => setScreen('story')}
        />
      )}

      {screen === 'world' && avatar && (
        <WorldSelector
          avatar={avatar}
          onSelect={(w) => { setWorld(w); setScreen('worldDoor'); }}
          onBack={() => setScreen('avatar')}
        />
      )}

      {screen === 'worldDoor' && world && (
        <WorldDoorTransition
          world={world}
          onComplete={() => setScreen('worldCinematic')}
        />
      )}

      {screen === 'worldCinematic' && avatar && world && (
        <WorldCinematic
          world={world}
          avatar={avatar}
          onComplete={() => setScreen('mapPurpose')}
        />
      )}

      {screen === 'mapPurpose' && avatar && world && (
        <MapPurposeScreen
          world={world}
          avatar={avatar}
          onSelect={(initialFields, title, pid) => {
            setFields(initialFields);
            setFormTitle(title);
            setPurposeId(pid);
            setScreen('builder');
          }}
          onBack={() => setScreen('world')}
        />
      )}

      {screen === 'builder' && avatar && world && (
        <FormBuilder
          world={world}
          avatar={avatar}
          fields={fields}
          formTitle={formTitle}
          versions={versions}
          purposeId={purposeId}
          onFieldsChange={setFields}
          onTitleChange={setFormTitle}
          onVersionsChange={setVersions}
          onRestore={restoreVersion}
          onPreview={() => setScreen('preview')}
          onBack={() => setScreen('world')}
          onLogout={() => { logout(); setPlayerName(''); setScreen('home'); }}
        />
      )}

      {screen === 'preview' && avatar && world && (
        <FormPreview
          world={world}
          avatar={avatar}
          fields={fields}
          formTitle={formTitle}
          onBack={() => setScreen('builder')}
        />
      )}

      {/* ── Experience 2: Globe ────────────────────────────────────────── */}
      {screen === 'globeIntro' && (
        <GlobeIntro onComplete={() => setScreen('globeSelector')} />
      )}

      {screen === 'globeSelector' && (
        <GlobeSelector
          onSelect={(c) => { setCountry(c); setScreen('countryCinematic'); }}
          onBack={() => setScreen('experiencePicker')}
        />
      )}

      {screen === 'countryCinematic' && country && (
        <CountryCinematic
          country={country}
          onComplete={() => setScreen('globeBuilder')}
        />
      )}

      {screen === 'globeBuilder' && country && (
        <GlobeFormBuilder
          country={country}
          playerName={playerName}
          onBack={() => setScreen('globeSelector')}
          onLogout={handleLogout}
          onPreview={(f, t) => {
            setGlobeFields(f);
            setGlobeTitle(t);
            setScreen('globePreview');
          }}
        />
      )}

      {screen === 'globePreview' && country && (
        <GlobePreviewScreen
          country={country}
          fields={globeFields}
          title={globeTitle}
          onBack={() => setScreen('globeBuilder')}
        />
      )}
    </>
  );
}

// ── Inline Globe Preview (reuses FormPreview layout, country-themed) ───────
function GlobePreviewScreen({ country, fields, title, onBack }: {
  country: import('./globeData').Country;
  fields: FormField[];
  title: string;
  onBack: () => void;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `radial-gradient(ellipse at 50% 0%, ${country.color}22 0%, #03001c 60%, #000 100%)`,
      overflow: 'auto',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: 680, margin: '0 auto',
        padding: '40px 20px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${country.color}44`,
            color: '#fff', borderRadius: 8,
            padding: '7px 16px', cursor: 'pointer', fontSize: 13,
          }}>← Edit</button>
          <span style={{ fontSize: 32 }}>{country.emoji}</span>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              {country.name} · {country.tagline}
            </div>
          </div>
        </div>

        {/* Fields preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(field => {
            if (field.type === 'section') return (
              <div key={field.id} style={{
                borderTop: `2px solid ${country.color}44`,
                paddingTop: 12,
                color: country.accentColor, fontWeight: 700, fontSize: 14,
              }}>
                {field.label}
              </div>
            );
            return (
              <div key={field.id}>
                <label style={{
                  display: 'block', color: 'rgba(255,255,255,0.8)',
                  fontSize: 13, fontWeight: 600, marginBottom: 6,
                }}>
                  {field.label}
                  {field.required && <span style={{ color: country.accentColor, marginLeft: 4 }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    rows={3}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${country.color}44`,
                      borderRadius: 8, padding: '10px 14px',
                      color: '#fff', fontSize: 14, resize: 'vertical',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                ) : field.type === 'select' ? (
                  <select style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${country.color}44`,
                    borderRadius: 8, padding: '10px 14px',
                    color: '#fff', fontSize: 14, outline: 'none',
                  }}>
                    <option value="">Select...</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map(o => (
                      <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="radio" name={field.id} value={o} />
                        {o}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map(o => (
                      <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="checkbox" value={o} />
                        {o}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'rating' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Array.from({ length: field.max || 5 }, (_, i) => (
                      <span key={i} style={{ fontSize: 28, cursor: 'pointer', opacity: 0.4 }}>⭐</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {field.prefix && (
                      <span style={{
                        background: `${country.color}22`, border: `1px solid ${country.color}44`,
                        borderRight: 'none', borderRadius: '8px 0 0 8px',
                        padding: '10px 12px', color: country.accentColor, fontSize: 14, fontWeight: 700,
                      }}>{field.prefix}</span>
                    )}
                    <input
                      type={field.type === 'number' || field.type === 'currency' ? 'number' : field.type}
                      placeholder={field.placeholder}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${country.color}44`,
                        borderRadius: field.prefix ? '0 8px 8px 0' : 8,
                        padding: '10px 14px', color: '#fff', fontSize: 14,
                        outline: 'none', boxSizing: 'border-box' as const,
                      }}
                    />
                  </div>
                )}
                {field.helperText && (
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>
                    {field.helperText}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        {fields.length > 0 && (
          <button style={{
            marginTop: 32,
            background: `linear-gradient(135deg, ${country.color}, ${country.accentColor})`,
            border: 'none', color: '#fff',
            borderRadius: 10, padding: '14px 32px',
            fontWeight: 800, fontSize: 16, cursor: 'pointer',
            boxShadow: `0 4px 20px ${country.glowColor}`,
          }}>
            Submit Form
          </button>
        )}
      </div>
    </div>
  );
}

export default App;