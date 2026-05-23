import { beforeEach, describe, expect, it } from 'vitest';
import { buildRespondentTokenKey, buildSubmissionLockKey, getOrCreateRespondentToken, hasSubmissionLock, setSubmissionLock } from './submissionLock';

describe('submissionLock', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and reads a form submission lock', () => {
    const key = buildSubmissionLockKey('form', 'form-123');

    expect(hasSubmissionLock(key)).toBe(false);

    setSubmissionLock(key);

    expect(hasSubmissionLock(key)).toBe(true);
  });

  it('keeps share locks scoped to their identifier', () => {
    const firstKey = buildSubmissionLockKey('share', 'alpha');
    const secondKey = buildSubmissionLockKey('share', 'beta');

    setSubmissionLock(firstKey);

    expect(hasSubmissionLock(firstKey)).toBe(true);
    expect(hasSubmissionLock(secondKey)).toBe(false);
  });

  it('reuses the same respondent token for the same form key', () => {
    const key = buildRespondentTokenKey('form', 'slug-123');

    const firstToken = getOrCreateRespondentToken(key);
    const secondToken = getOrCreateRespondentToken(key);

    expect(firstToken).toBe(secondToken);
    expect(firstToken.length).toBeGreaterThanOrEqual(16);
  });

  it('scopes respondent tokens per form key', () => {
    const firstToken = getOrCreateRespondentToken(buildRespondentTokenKey('form', 'alpha'));
    const secondToken = getOrCreateRespondentToken(buildRespondentTokenKey('form', 'beta'));

    expect(firstToken).not.toBe(secondToken);
  });
});