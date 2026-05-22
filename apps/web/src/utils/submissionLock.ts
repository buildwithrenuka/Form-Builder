const STORAGE_KEY = 'formverse_submission_lock';

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

export function buildSubmissionLockKey(scope: 'form' | 'share', identifier: string): string {
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