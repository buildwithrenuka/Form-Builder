// ── Simple client-side session storage ─────────────────────────────────────
const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';

type SessionRecord = {
  name: string;
  email: string;
};

function migrateLegacyAuthState() {
  const legacySession = localStorage.getItem(SESSION_KEY);
  const legacyToken = localStorage.getItem(TOKEN_KEY);

  if (sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem(TOKEN_KEY)) {
    if (legacySession) localStorage.removeItem(SESSION_KEY);
    if (legacyToken) localStorage.removeItem(TOKEN_KEY);
    return;
  }

  if (legacySession && legacyToken) {
    sessionStorage.setItem(SESSION_KEY, legacySession);
    sessionStorage.setItem(TOKEN_KEY, legacyToken);
  }

  if (legacySession) localStorage.removeItem(SESSION_KEY);
  if (legacyToken) localStorage.removeItem(TOKEN_KEY);
}

export function saveSession(session: SessionRecord, token: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearSession();
}

export function getSession(): string | null {
  try {
    migrateLegacyAuthState();

    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      clearSession();
      return null;
    }
    const session = JSON.parse(raw) as SessionRecord | string;
    if (typeof session === 'string') {
      clearSession();
      return null;
    }
    return session.name;
  } catch {
    clearSession();
    return null;
  }
}

export function getSessionEmail(): string | null {
  try {
    migrateLegacyAuthState();

    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      clearSession();
      return null;
    }
    const session = JSON.parse(raw) as SessionRecord | string;
    if (typeof session === 'string') {
      clearSession();
      return null;
    }
    return session.email;
  } catch {
    clearSession();
    return null;
  }
}

export function getToken(): string | null {
  migrateLegacyAuthState();
  return sessionStorage.getItem(TOKEN_KEY);
}
