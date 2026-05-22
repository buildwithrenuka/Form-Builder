import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Screen, Avatar, WorldTheme, FormField, FormVersion } from './types';
import { AVATARS, WORLDS } from './themes';
import { getSession, getSessionEmail, logout } from './auth';
import { COUNTRIES, type Country } from './globeData';
import { trpc, makeTrpcClient, API_BASE } from './trpc';
// shared
import { HomePage, type HomeTheme } from './components/HomePage';
import { LoginScreen } from './components/LoginScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { SharedFormView } from './components/SharedFormView';
import { SubmissionConfirmedPage } from './components/SubmissionConfirmedPage';
import { ExperienceSelector } from './components/ExperienceSelector';
import { PricingPage } from './components/PricingPage';
import { DashboardPage } from './components/DashboardPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { ExplorePage } from './components/ExplorePage';
// experience 1: realm runner
import { GlobeExperienceFlow, LibraryExperienceFlow, TempleExperienceFlow } from './components/ExperienceFlows';
import { LIBRARY_WORLDS, type LibraryWorld } from './libraryData';

const VERSIONS_KEY = 'tr_form_builder_versions';
const HOME_THEME_KEY = 'tr_form_builder_home_theme';
const APP_STATE_KEY = 'tr_form_builder_app_state';

type PersistedAppState = {
  screen: Screen;
  loginMode: 'login' | 'register';
  avatarId: string | null;
  worldId: string | null;
  fields: FormField[];
  formTitle: string;
  purposeId: string;
  countryId: string | null;
  globeFields: FormField[];
  globeTitle: string;
  libraryWorldId: LibraryWorld['id'] | null;
  libraryFields: FormField[];
  libraryTitle: string;
};

const AUTH_SCREENS = new Set<Screen>([
  'experiencePicker',
  'dashboard',
  'story',
  'avatar',
  'world',
  'worldDoor',
  'worldCinematic',
  'mapPurpose',
  'builder',
  'preview',
  'globeIntro',
  'globeSelector',
  'countryPortal',
  'countryCinematic',
  'globeMission',
  'globeBuilder',
  'globePreview',
  'libraryIntro',
  'librarySelector',
  'libraryPortal',
  'libraryCinematic',
  'libraryMission',
  'libraryBuilder',
  'libraryPreview',
]);

function loadAppState(): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    if (!parsed || typeof parsed.screen !== 'string') return null;
    return {
      screen: parsed.screen as Screen,
      loginMode: parsed.loginMode === 'register' ? 'register' : 'login',
      avatarId: typeof parsed.avatarId === 'string' ? parsed.avatarId : null,
      worldId: typeof parsed.worldId === 'string' ? parsed.worldId : null,
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      formTitle: typeof parsed.formTitle === 'string' ? parsed.formTitle : 'My Adventure Form',
      purposeId: typeof parsed.purposeId === 'string' ? parsed.purposeId : '',
      countryId: typeof parsed.countryId === 'string' ? parsed.countryId : null,
      globeFields: Array.isArray(parsed.globeFields) ? parsed.globeFields : [],
      globeTitle: typeof parsed.globeTitle === 'string' ? parsed.globeTitle : 'Globe Form',
      libraryWorldId: typeof parsed.libraryWorldId === 'string' ? parsed.libraryWorldId as LibraryWorld['id'] : null,
      libraryFields: Array.isArray(parsed.libraryFields) ? parsed.libraryFields : [],
      libraryTitle: typeof parsed.libraryTitle === 'string' ? parsed.libraryTitle : 'Library Form',
    };
  } catch {
    return null;
  }
}

function persistAppState(state: PersistedAppState) {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

function clearAppState() {
  localStorage.removeItem(APP_STATE_KEY);
}

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
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [persistedAppState] = useState<PersistedAppState | null>(() => loadAppState());

  const [screen, setScreen] = useState<Screen>(() => {
    if (params?.get('confirmation')) return 'submissionConfirmed';
    if (params?.get('share')) return 'shared';
    if (params?.get('slug')) return 'shared';
    if (params?.get('resetToken')) return 'login';
    return persistedAppState?.screen && persistedAppState.screen !== 'shared' ? persistedAppState.screen : 'home';
  });
  const [playerName, setPlayerName] = useState(() => getSession() ?? '');
  const [sessionEmail, setSessionEmail] = useState(() => getSessionEmail() ?? '');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>(persistedAppState?.loginMode ?? 'login');
  const [homeTheme, setHomeTheme] = useState<HomeTheme>(loadHomeTheme);

  // ── Experience 1: Realm Runner state ────────────────────────────────────
  const [avatar, setAvatar]       = useState<Avatar | null>(() => AVATARS.find((entry) => entry.id === persistedAppState?.avatarId) ?? null);
  const [world, setWorld]         = useState<WorldTheme | null>(() => WORLDS.find((entry) => entry.id === persistedAppState?.worldId) ?? null);
  const [fields, setFields]       = useState<FormField[]>(persistedAppState?.fields ?? []);
  const [formTitle, setFormTitle] = useState(persistedAppState?.formTitle ?? 'My Adventure Form');
  const [purposeId, setPurposeId] = useState<string>(persistedAppState?.purposeId ?? '');
  const [versions, setVersions]   = useState<FormVersion[]>(loadVersions);

  // ── Experience 2: Globe state ───────────────────────────────────────────
  const [country, setCountry]           = useState<Country | null>(() => COUNTRIES.find((entry) => entry.id === persistedAppState?.countryId) ?? null);
  const [globeFields, setGlobeFields]   = useState<FormField[]>(persistedAppState?.globeFields ?? []);
  const [globeTitle, setGlobeTitle]     = useState(persistedAppState?.globeTitle ?? 'Globe Form');

  // ── Experience 3: Library state ─────────────────────────────────
  const [libraryWorld, setLibraryWorld]   = useState<LibraryWorld | null>(() => LIBRARY_WORLDS.find((entry) => entry.id === persistedAppState?.libraryWorldId) ?? null);
  const [libraryFields, setLibraryFields] = useState<FormField[]>(persistedAppState?.libraryFields ?? []);
  const [libraryTitle, setLibraryTitle]   = useState(persistedAppState?.libraryTitle ?? 'Library Form');
  const { data: currentUser } = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(playerName),
    retry: false,
    staleTime: 60_000,
  });

  // After login we need to know which experience was picked
  // (pendingExp removed — experience is now chosen AFTER login)

  // Guard dashboard — redirect to login if not authenticated
  useEffect(() => {
    if (AUTH_SCREENS.has(screen) && !playerName) {
      setLoginMode('login');
      setScreen('login');
      return;
    }

    if ((screen === 'world' || screen === 'worldDoor' || screen === 'worldCinematic' || screen === 'mapPurpose' || screen === 'builder' || screen === 'preview') && !avatar) {
      setScreen('story');
      return;
    }

    if ((screen === 'worldDoor' || screen === 'worldCinematic' || screen === 'mapPurpose' || screen === 'builder' || screen === 'preview') && !world) {
      setScreen('world');
      return;
    }

    if ((screen === 'countryPortal' || screen === 'countryCinematic' || screen === 'globeMission' || screen === 'globeBuilder' || screen === 'globePreview') && !country) {
      setScreen('globeSelector');
      return;
    }

    if ((screen === 'libraryPortal' || screen === 'libraryCinematic' || screen === 'libraryMission' || screen === 'libraryBuilder' || screen === 'libraryPreview') && !libraryWorld) {
      setScreen('librarySelector');
    }
  }, [screen, playerName, avatar, world, country, libraryWorld]);

  useEffect(() => { persistVersions(versions); }, [versions]);
  useEffect(() => {
    localStorage.setItem(HOME_THEME_KEY, homeTheme);
  }, [homeTheme]);
  useEffect(() => {
    persistAppState({
      screen,
      loginMode,
      avatarId: avatar?.id ?? null,
      worldId: world?.id ?? null,
      fields,
      formTitle,
      purposeId,
      countryId: country?.id ?? null,
      globeFields,
      globeTitle,
      libraryWorldId: libraryWorld?.id ?? null,
      libraryFields,
      libraryTitle,
    });
  }, [screen, loginMode, avatar, world, fields, formTitle, purposeId, country, globeFields, globeTitle, libraryWorld, libraryFields, libraryTitle]);

  function restoreVersion(v: FormVersion) {
    setFormTitle(v.formTitle);
    setFields(v.fields);
    const w = WORLDS.find(x => x.id === v.worldId);
    if (w) setWorld(w);
  }

  function handleLogout() {
    logout();
    clearAppState();
    setPlayerName('');
    setSessionEmail('');
    setScreen('home');
  }

  const canAccessAdmin = currentUser?.isAdmin ?? false;

  const shareEncoded = params?.get('share') ?? null;
  const sharedSlug = params?.get('slug') ?? null;
  const confirmationFormTitle = params?.get('formTitle') ?? null;
  const confirmationResponseId = params?.get('responseId') ?? null;
  const confirmationSubmittedAt = params?.get('submittedAt') ?? null;
  const confirmationSlug = params?.get('slug') ?? null;

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

  if (screen === 'submissionConfirmed') {
    return (
      <SubmissionConfirmedPage
        formTitle={confirmationFormTitle}
        responseId={confirmationResponseId}
        submittedAt={confirmationSubmittedAt}
        onBackHome={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setScreen('home');
        }}
        onSubmitAnother={confirmationSlug
          ? () => {
              window.history.replaceState({}, '', `?slug=${encodeURIComponent(confirmationSlug)}`);
              setScreen('shared');
            }
          : undefined}
      />
    );
  }

  return (
    <>
      {screen === 'home' && (
        <HomePage
          onEnter={() => { if (playerName) { setScreen('experiencePicker'); } else { setLoginMode('login'); setScreen('login'); } }}
          onLogin={() => { setLoginMode('login'); setScreen('login'); }}
          onRegister={() => { setLoginMode('register'); setScreen('login'); }}
          onTutorial={() => setScreen('tutorial')}
          onApiDocs={() => window.open(`${API_BASE}/docs`, '_blank', 'noopener,noreferrer')}
          onPricing={() => setScreen('pricing')}
          onExplore={() => setScreen('explore')}
          onViewForm={(slug) => {
            window.history.replaceState({}, '', `?slug=${slug}`);
            setScreen('shared');
          }}
          onDashboard={() => setScreen('dashboard')}
          onAdmin={canAccessAdmin ? () => setScreen('admin') : undefined}
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
          theme={homeTheme}
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
            onAdmin={canAccessAdmin ? () => setScreen('admin') : undefined}
            onViewForm={(slug) => {
              window.history.replaceState({}, '', `?slug=${slug}`);
              setScreen('shared');
            }}
          />
        ) : null
      )}

      {screen === 'admin' && (
        playerName ? (
          <AdminDashboardPage
            onBack={() => setScreen('experiencePicker')}
            onLogout={handleLogout}
            theme={homeTheme}
          />
        ) : null
      )}

      {screen === 'tutorial' && (
        <TutorialScreen onComplete={() => setScreen('home')} onBack={() => setScreen('home')} />
      )}

      {screen === 'login' && (
        <LoginScreen
          theme={homeTheme === 'light' || homeTheme === 'rainbow' || homeTheme === 'firecracker' || homeTheme === 'jugnu' ? homeTheme : 'formverse'}
          initialMode={loginMode}
          onLogin={(name) => {
            setPlayerName(name);
            setSessionEmail(getSessionEmail() ?? '');
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
          onAdmin={canAccessAdmin ? () => setScreen('admin') : undefined}
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
        purposeId={purposeId}
        onScreenChange={setScreen}
        onCountryChange={setCountry}
        onFieldsChange={setGlobeFields}
        onTitleChange={setGlobeTitle}
        onPurposeIdChange={setPurposeId}
        onLogout={handleLogout}
      />

      <LibraryExperienceFlow
        screen={screen}
        world={libraryWorld}
        fields={libraryFields}
        title={libraryTitle}
        purposeId={purposeId}
        onScreenChange={setScreen}
        onWorldChange={setLibraryWorld}
        onFieldsChange={setLibraryFields}
        onTitleChange={setLibraryTitle}
        onPurposeIdChange={setPurposeId}
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