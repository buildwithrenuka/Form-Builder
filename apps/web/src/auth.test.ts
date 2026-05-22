import { beforeEach, describe, expect, it } from 'vitest';
import { clearSession, getSession, getSessionEmail, getToken, logout, saveSession } from './auth';

describe('auth session helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists and restores the active session', () => {
    saveSession({ name: 'Ava', email: 'ava@example.com' }, 'token-123');

    expect(getSession()).toBe('Ava');
    expect(getSessionEmail()).toBe('ava@example.com');
    expect(getToken()).toBe('token-123');
    expect(localStorage.getItem('fq_token')).toBeNull();
    expect(sessionStorage.getItem('fq_token')).toBe('token-123');
  });

  it('clears stale or malformed session state', () => {
    sessionStorage.setItem('fq_session', JSON.stringify('Legacy User'));

    expect(getSession()).toBeNull();
    expect(sessionStorage.getItem('fq_session')).toBeNull();
  });

  it('migrates legacy localStorage auth into sessionStorage', () => {
    localStorage.setItem('fq_session', JSON.stringify({ name: 'Ava', email: 'ava@example.com' }));
    localStorage.setItem('fq_token', 'token-123');

    expect(getSession()).toBe('Ava');
    expect(getToken()).toBe('token-123');
    expect(localStorage.getItem('fq_session')).toBeNull();
    expect(localStorage.getItem('fq_token')).toBeNull();
    expect(sessionStorage.getItem('fq_session')).toContain('ava@example.com');
  });

  it('removes session data on logout', () => {
    saveSession({ name: 'Ava', email: 'ava@example.com' }, 'token-123');

    logout();

    expect(getSession()).toBeNull();
    expect(getSessionEmail()).toBeNull();
    expect(getToken()).toBeNull();
    clearSession();
  });
});