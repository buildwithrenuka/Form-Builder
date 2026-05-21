import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Screen, Avatar, WorldTheme, FormField, FormVersion } from './types';
import { WORLDS } from './themes';
import { getSession, logout } from './auth';
import { type Country } from './globeData';
import { trpc, makeTrpcClient } from './trpc';
// shared
import { HomePage, type HomeTheme } from './components/HomePage';
import { LoginScreen } from './components/LoginScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { SharedFormView } from './components/SharedFormView';
import { ExperienceSelector } from './components/ExperienceSelector';
import { PricingPage } from './components/PricingPage';
import { DashboardPage } from './components/DashboardPage';
import { ExplorePage } from './components/ExplorePage';
// experience 1: temple run
import { GlobeExperienceFlow, LibraryExperienceFlow, TempleExperienceFlow } from './components/ExperienceFlows';
import { type LibraryWorld } from './libraryData';

const VERSIONS_KEY = 'tr_form_builder_versions';
const HOME_THEME_KEY = 'tr_form_builder_home_theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
const trpcClient  = makeTrpcClient();

function loadVersions(): FormVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistVersions(v: FormVersion[]) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v));
}

function loadHomeTheme(): HomeTheme {
  try {
    const raw = localStorage.getItem(HOME_THEME_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'rainbow' || raw === 'firecracker' || raw === 'jugnu') {
      return raw;
    }
  } catch {
    // Ignore storage failures and fall back to the default theme.
  }
  return 'dark';
}

function App() {
  // Detect shared form in URL on mount
  const [shareEncoded] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  });

  const [sharedSlug] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  });

  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('share')) return 'shared';
      if (params.get('slug')) return 'shared';
    }
    return 'home';
  });
  const [playerName, setPlayerName] = useState(() => getSession() ?? '');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [homeTheme, setHomeTheme] = useState<HomeTheme>(loadHomeTheme);

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

  // ── Experience 3: Library state ─────────────────────────────────
  const [libraryWorld, setLibraryWorld]   = useState<LibraryWorld | null>(null);
  const [libraryFields, setLibraryFields] = useState<FormField[]>([]);
  const [libraryTitle, setLibraryTitle]   = useState('Library Form');

  // After login we need to know which experience was picked
  // (pendingExp removed — experience is now chosen AFTER login)

  // Guard dashboard — redirect to login if not authenticated
  useEffect(() => {
    if (screen === 'dashboard' && !playerName) {
      setLoginMode('login');
      setScreen('login');
    }
  }, [screen, playerName]);

  useEffect(() => { persistVersions(versions); }, [versions]);
  useEffect(() => {
    localStorage.setItem(HOME_THEME_KEY, homeTheme);
  }, [homeTheme]);

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

  if (screen === 'shared') {
    if (shareEncoded) {
      return <SharedFormView encoded={shareEncoded} onBack={() => {
        window.history.replaceState({}, '', window.location.pathname);
        setScreen('home');
      }} />;
    }
    if (sharedSlug) {
      return <SharedFormView slug={sharedSlug} onBack={() => {
        window.history.replaceState({}, '', window.location.pathname);
        setScreen('home');
      }} />;
    }
  }

  return (
    <>
      {screen === 'home' && (
        <HomePage
          onEnter={() => { if (playerName) { setScreen('experiencePicker'); } else { setLoginMode('login'); setScreen('login'); } }}
          onLogin={() => { setLoginMode('login'); setScreen('login'); }}
          onRegister={() => { setLoginMode('register'); setScreen('login'); }}
          onTutorial={() => setScreen('tutorial')}
          onPricing={() => setScreen('pricing')}
          onExplore={() => setScreen('explore')}
          onDashboard={() => setScreen('dashboard')}
          playerName={playerName || undefined}
          theme={homeTheme}
          onThemeChange={setHomeTheme}
        />
      )}

      {screen === 'explore' && (
        <ExplorePage
          onBack={() => setScreen('home')}
          onEnter={() => { if (playerName) { setScreen('experiencePicker'); } else { setLoginMode('login'); setScreen('login'); } }}
          onViewForm={(slug) => {
            window.history.replaceState({}, '', `?slug=${slug}`);
            setScreen('shared');
          }}
        />
      )}

      {screen === 'pricing' && (
        <PricingPage
          onBack={() => setScreen('home')}
          onEnter={() => setScreen('experiencePicker')}
        />
      )}

      {screen === 'dashboard' && (
        playerName ? (
          <DashboardPage
            playerName={playerName}
            onBack={() => setScreen('experiencePicker')}
            onLogout={() => { logout(); setPlayerName(''); setScreen('home'); }}
            onViewForm={(slug) => {
              window.history.replaceState({}, '', `?slug=${slug}`);
              setScreen('shared');
            }}
          />
        ) : null
      )}

      {screen === 'tutorial' && (
        <TutorialScreen onComplete={() => setScreen('home')} />
      )}

      {screen === 'login' && (
        <LoginScreen
          theme={homeTheme === 'light' || homeTheme === 'rainbow' || homeTheme === 'firecracker' || homeTheme === 'jugnu' ? homeTheme : 'formverse'}
          initialMode={loginMode}
          onLogin={(name) => {
            setPlayerName(name);
            setScreen('experiencePicker');
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {/* ── Experience Picker ──────────────────────────────────────────── */}
      {screen === 'experiencePicker' && (
        <ExperienceSelector
          theme={homeTheme}
          onSelectTempleRun={() => setScreen('story')}
          onSelectGlobe={() => setScreen('globeIntro')}
          onSelectLibrary={() => setScreen('libraryIntro')}
          onLogout={handleLogout}
          onDashboard={() => setScreen('dashboard')}
        />
      )}

      <TempleExperienceFlow
        screen={screen}
        playerName={playerName}
        avatar={avatar}
        world={world}
        fields={fields}
        formTitle={formTitle}
        purposeId={purposeId}
        versions={versions}
        onScreenChange={setScreen}
        onAvatarChange={setAvatar}
        onWorldChange={setWorld}
        onFieldsChange={setFields}
        onFormTitleChange={setFormTitle}
        onPurposeIdChange={setPurposeId}
        onVersionsChange={setVersions}
        onRestoreVersion={restoreVersion}
        onLogout={() => { logout(); setPlayerName(''); setScreen('home'); }}
      />

      <GlobeExperienceFlow
        screen={screen}
        country={country}
        fields={globeFields}
        title={globeTitle}
        onScreenChange={setScreen}
        onCountryChange={setCountry}
        onFieldsChange={setGlobeFields}
        onTitleChange={setGlobeTitle}
        onLogout={handleLogout}
      />

      <LibraryExperienceFlow
        screen={screen}
        world={libraryWorld}
        fields={libraryFields}
        title={libraryTitle}
        onScreenChange={setScreen}
        onWorldChange={setLibraryWorld}
        onFieldsChange={setLibraryFields}
        onTitleChange={setLibraryTitle}
        onLogout={handleLogout}
      />
    </>
  );
}

export default function Root() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}