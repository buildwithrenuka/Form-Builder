// ── Simple localStorage auth ────────────────────────────────────────────────
// This is a client-side demo auth — not for production secrets.

const USERS_KEY = 'fq_users';
const SESSION_KEY = 'fq_session';

type UserRecord = { name: string; passwordHash: string };

function simpleHash(s: string): string {
  // djb2 — deterministic, good enough for a demo app
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function loadUsers(): Record<string, UserRecord> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}');
  } catch { return {}; }
}

function saveUsers(users: Record<string, UserRecord>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(name: string, password: string): { ok: true } | { ok: false; error: string } {
  const key = name.trim().toLowerCase();
  if (!key) return { ok: false, error: 'Explorer name cannot be empty.' };
  if (password.length < 3) return { ok: false, error: 'Secret code must be at least 3 characters.' };
  const users = loadUsers();
  if (users[key]) return { ok: false, error: 'That explorer name is already taken!' };
  users[key] = { name: name.trim(), passwordHash: simpleHash(password) };
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, name.trim());
  return { ok: true };
}

export function login(name: string, password: string): { ok: true; name: string } | { ok: false; error: string } {
  const key = name.trim().toLowerCase();
  if (!key) return { ok: false, error: 'An explorer must have a name!' };
  const users = loadUsers();
  const record = users[key];
  if (!record) return { ok: false, error: 'Explorer not found. Register first!' };
  if (record.passwordHash !== simpleHash(password)) return { ok: false, error: 'Wrong secret code!' };
  localStorage.setItem(SESSION_KEY, record.name);
  return { ok: true, name: record.name };
}

export function loginAsGuest(): string {
  const name = 'Guest Explorer';
  localStorage.setItem(SESSION_KEY, name);
  return name;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}
