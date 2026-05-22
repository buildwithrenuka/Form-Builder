import { beforeEach, describe, expect, it } from 'vitest';
import { buildSubmissionLockKey, hasSubmissionLock, setSubmissionLock } from './submissionLock';

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
});