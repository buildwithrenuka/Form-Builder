const STORAGE_KEY = 'formverse_submission_lock';
const RESPONDENT_TOKEN_STORAGE_KEY = 'formverse_respondent_tokens';

function readStore(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, number>) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage write failures and keep the form usable.
  }
}

function readTokenStore(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(RESPONDENT_TOKEN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeTokenStore(store: Record<string, string>) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(RESPONDENT_TOKEN_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage write failures and keep the form usable.
  }
}

function makeRespondentToken(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `resp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function buildSubmissionLockKey(scope: 'form' | 'share', identifier: string): string {
  return `${scope}:${identifier}`;
}

export function buildRespondentTokenKey(scope: 'form', identifier: string): string {
  return `${scope}:${identifier}`;
}

export function hasSubmissionLock(key: string): boolean {
  return Number.isFinite(readStore()[key]);
}

export function setSubmissionLock(key: string) {
  const store = readStore();
  store[key] = Date.now();
  writeStore(store);
}

export function getOrCreateRespondentToken(key: string): string {
  const store = readTokenStore();
  const existing = store[key];
  if (typeof existing === 'string' && existing.length >= 16) {
    return existing;
  }

  const token = makeRespondentToken();
  store[key] = token;
  writeTokenStore(store);
  return token;
}