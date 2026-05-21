// ── Simple client-side session storage ─────────────────────────────────────
const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';

type SessionRecord = {
  name: string;
  email: string;
};

export function saveSession(session: SessionRecord, token: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearSession();
}

export function getSession(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    if (!localStorage.getItem(TOKEN_KEY)) {
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
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    if (!localStorage.getItem(TOKEN_KEY)) {
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
  return localStorage.getItem(TOKEN_KEY);
}
