import { expect, test, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';

const DEMO_EMAIL = 'demo@formverse.io';
const DEMO_PASSWORD = 'Demo1234!';
const APP_STATE_KEY = 'tr_form_builder_app_state';
const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';
const API_BASE_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3002';
const LOCAL_DEV_JWT_SECRET = 'formquest-local-dev-secret-change-me';
const DEMO_USER_ID = 'demo-user-formverse-01';

function uniqueEmail(prefix: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${suffix}@example.com`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createLocalDevToken(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64Url(JSON.stringify({ sub: userId, iat: now, exp: now + (7 * 24 * 60 * 60) }));
  const signature = createHmac('sha256', LOCAL_DEV_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${header}.${payload}.${signature}`;
}

async function goHome(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Create Free Account', exact: true })
      .or(page.getByRole('button', { name: 'Choose Your Experience', exact: true }))
      .first(),
  ).toBeVisible();
}

async function openLogin(page: Page) {
  await goHome(page);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByPlaceholder('Your email address...')).toBeVisible();
}

async function seedSession(page: Page, email: string, password: string, screen: 'experiencePicker' | 'dashboard' = 'experiencePicker') {
  if (API_BASE_URL === 'http://localhost:3002' && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    await page.goto('/');
    await page.evaluate(({ sessionKey, tokenKey, appStateKey, nextScreen, token }) => {
      sessionStorage.setItem(sessionKey, JSON.stringify({ name: 'Demo Creator', email: 'demo@formverse.io' }));
      sessionStorage.setItem(tokenKey, token);

      const raw = localStorage.getItem(appStateKey);
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem(appStateKey, JSON.stringify({ ...current, screen: nextScreen, loginMode: 'login' }));
    }, {
      sessionKey: SESSION_KEY,
      tokenKey: TOKEN_KEY,
      appStateKey: APP_STATE_KEY,
      nextScreen: screen,
      token: createLocalDevToken(DEMO_USER_ID),
    });
    await page.goto('/');
    return;
  }

  const response = await fetch(`${API_BASE_URL}/trpc/auth.login?batch=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      0: { email, password },
    }),
  });

  if (!response.ok) {
    throw new Error(`Seed auth failed with status ${response.status}`);
  }

  const payload = await response.json() as Array<{ result?: { data?: { token?: string; user?: { name: string; email: string } } } }>;
  const token = payload[0]?.result?.data?.token;
  const user = payload[0]?.result?.data?.user;

  if (!token || !user) {
    throw new Error('Seed auth response did not include a session token');
  }

  await page.goto('/');
  await page.evaluate(({ sessionKey, tokenKey, appStateKey, token: nextToken, user: nextUser, nextScreen }) => {
    sessionStorage.setItem(sessionKey, JSON.stringify({ name: nextUser.name, email: nextUser.email }));
    sessionStorage.setItem(tokenKey, nextToken);

    const raw = localStorage.getItem(appStateKey);
    const current = raw ? JSON.parse(raw) : {};
    localStorage.setItem(appStateKey, JSON.stringify({ ...current, screen: nextScreen, loginMode: 'login' }));
  }, {
    sessionKey: SESSION_KEY,
    tokenKey: TOKEN_KEY,
    appStateKey: APP_STATE_KEY,
    token,
    user,
    nextScreen: screen,
  });
  await page.goto('/');
}

async function login(page: Page, email: string, password: string) {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    await seedSession(page, email, password);
    await expect(
      page.getByText('Choose Your Experience').or(page.getByText('Creator Dashboard')).or(page.getByRole('button', { name: /dashboard/i })).first(),
    ).toBeVisible();
    return;
  }

  await openLogin(page);
  await page.getByPlaceholder('Your email address...').fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(
    page.getByText('Choose Your Experience').or(page.getByText('Creator Dashboard')).or(page.getByRole('button', { name: /dashboard/i })).first(),
  ).toBeVisible();
}

async function openExperiencePicker(page: Page) {
  await page.addInitScript(
    ({ sessionKey, tokenKey, appStateKey }) => {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({ name: 'Preview Operator', email: 'preview@formverse.test' }),
      );
      sessionStorage.setItem(tokenKey, 'preview-token');
      localStorage.setItem(
        appStateKey,
        JSON.stringify({
          screen: 'experiencePicker',
          loginMode: 'login',
        }),
      );
    },
    {
      sessionKey: SESSION_KEY,
      tokenKey: TOKEN_KEY,
      appStateKey: APP_STATE_KEY,
    },
  );

  await page.goto('/');
  await expect(page.getByText('Choose Your Experience')).toBeVisible();
}

async function resetToExplore(page: Page) {
  await page.addInitScript(([appStateKey]) => {
    localStorage.setItem(appStateKey, JSON.stringify({
      screen: 'explore',
      loginMode: 'login',
      avatarId: null,
      worldId: null,
      fields: [],
      formTitle: 'My Adventure Form',
      purposeId: '',
      countryId: null,
      globeFields: [],
      globeTitle: 'Globe Form',
      libraryWorldId: null,
      libraryFields: [],
      libraryTitle: 'Library Form',
    }));
  }, [APP_STATE_KEY]);
}

async function submitTemplePublicForm(page: Page) {
  await page.goto('/?slug=jungle-expedition-registration');
  await expect(page.getByText('Jungle Expedition Registration')).toBeVisible();
  await page.getByPlaceholder('A legendary runner').fill('Ava Pathfinder');
  await page.getByPlaceholder('runner@quest.io').fill(uniqueEmail('temple-public'));
  await page.getByText('Speed Run').click();
  await page.getByPlaceholder('What kind of run are you preparing for?').fill('Preparing for the jungle sprint.');
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
}

async function submitRealmRunnerSharedForm(page: Page, values: {
  runnerName: string;
  email: string;
  runType?: 'Speed Run' | 'Marathon' | 'Obstacle Course';
  notes: string;
}) {
  await expect(page.getByPlaceholder('A legendary runner')).toBeVisible();
  await page.getByPlaceholder('A legendary runner').fill(values.runnerName);
  await page.getByPlaceholder('runner@quest.io').fill(values.email);
  await page.getByText(values.runType ?? 'Speed Run').click();
  await page.getByPlaceholder('What kind of run are you preparing for?').fill(values.notes);
  await page.getByRole('button', { name: /submit form|update response/i }).click();
}

async function submitCreatedRealmSurveyForm(page: Page, values: {
  name: string;
  email: string;
  feedback: string;
  recommendation?: 'Definitely Yes' | 'Probably Yes' | 'Not Sure' | 'Probably Not' | 'Definitely Not';
}) {
  await expect(page.getByPlaceholder('Optional — leave blank to stay anonymous')).toBeVisible();
  await page.getByPlaceholder('Optional — leave blank to stay anonymous').fill(values.name);
  await page.getByPlaceholder('Optional — for follow-up').fill(values.email);
  await page.getByRole('button', { name: '★' }).nth(4).click();
  await page.getByPlaceholder('Tell us what you loved...').fill(values.feedback);
  await page.getByRole('radio', { name: values.recommendation ?? 'Definitely Yes' }).check();
  await page.getByRole('button', { name: /submit form|update response/i }).click();
}

async function advanceCountryCinematic(page: Page, steps = 3) {
  const cinematic = page.getByTestId('country-cinematic');
  const heading = cinematic.getByRole('heading', { level: 2 });

  for (let index = 0; index < steps; index += 1) {
    const advanceButton = page.getByTestId('country-cinematic-advance');
    const label = (await advanceButton.textContent()) ?? '';
    const panelTitle = (await heading.textContent()) ?? '';
    await advanceButton.click();

    if (/start building/i.test(label)) {
      await expect(cinematic).toBeHidden({ timeout: 5000 });
      break;
    }

    await expect(heading).not.toHaveText(panelTitle, { timeout: 5000 });
  }
}

async function advanceLibraryCinematic(page: Page, steps = 3) {
  const cinematic = page.getByTestId('library-world-cinematic');
  const heading = cinematic.getByRole('heading', { level: 2 });

  for (let index = 0; index < steps; index += 1) {
    const advanceButton = page.getByTestId('library-world-cinematic-advance');
    const label = (await advanceButton.textContent()) ?? '';
    const panelTitle = (await heading.textContent()) ?? '';
    await advanceButton.click();

    if (/start building/i.test(label)) {
      await expect(cinematic).toBeHidden({ timeout: 5000 });
      break;
    }

    await expect(heading).not.toHaveText(panelTitle, { timeout: 5000 });
  }
}

async function createRealmRunnerForm(page: Page, formTitle: string, allowResponseEdits: boolean) {
  await login(page, DEMO_EMAIL, DEMO_PASSWORD);
  const customSlug = slugify(formTitle);

  await page.evaluate((appStateKey) => {
    localStorage.setItem(appStateKey, JSON.stringify({
      screen: 'experiencePicker',
      loginMode: 'login',
    }));
  }, APP_STATE_KEY);
  await page.goto('/');
  await expect(page.getByText('Choose Your Experience')).toBeVisible();

  await page.getByRole('heading', { name: /realm runner/i }).click();
  await expect(page.getByTestId('story-intro-skip')).toBeVisible();
  await page.getByTestId('story-intro-skip').click();
  await expect(page.getByText('Choose Your Runner')).toBeVisible();
  await page.getByRole('button', { name: /guy dangerous/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Choose Your World')).toBeVisible();
  await page.getByRole('button', { name: /jungle world/i }).click();
  await page.getByRole('button', { name: 'ENTER →' }).click();
  await expect(page.getByTestId('world-cinematic-skip')).toBeVisible({ timeout: 12000 });
  await page.getByTestId('world-cinematic-skip').click();
  await page.getByRole('button', { name: /feedback survey/i }).click();
  await page.getByRole('button', { name: /accept mission/i }).click();

  await expect(page.getByPlaceholder('Untitled Form...')).toBeVisible({ timeout: 12000 });
  await page.getByPlaceholder('Untitled Form...').fill(formTitle);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByPlaceholder('optional-custom-slug').fill(customSlug);

  const allowEditsCheckbox = page.getByTestId('builder-allow-response-edits').locator('input[type="checkbox"]');
  if (allowResponseEdits) {
    await allowEditsCheckbox.check();
  } else {
    await allowEditsCheckbox.uncheck();
  }

  await page.getByRole('button', { name: 'Review & Publish', exact: true }).click();
  await page.getByTestId('builder-publish-button').click();
  await expect(page.getByTestId('builder-publish-button')).toContainText(/unpublish/i, { timeout: 12000 });

  await page.getByRole('button', { name: 'Share & History', exact: true }).click();
  await page.getByTestId('builder-share-button').click();
  await expect(page.getByTestId('builder-share-button')).toContainText(/copied/i);

  return `${new URL(page.url()).origin}/?slug=${customSlug}`;
}

async function submitGlobePublicForm(page: Page) {
  await page.goto('/?slug=japan-journey-intake');
  await expect(page.getByText('Japan Journey Intake')).toBeVisible();
  await page.getByPlaceholder('Full passport name').fill('Maya Traveler');
  await page.getByPlaceholder('traveler@example.com').fill(uniqueEmail('globe-public'));
  await page.locator('input[type="date"]').fill('2026-06-15');
  await page.locator('select').selectOption('Tourism');
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
}

async function submitLibraryPublicForm(page: Page) {
  await page.goto('/?slug=mythic-hero-archive');
  await expect(page.getByText('Mythic Hero Archive')).toBeVisible();
  await page.getByPlaceholder('Name of the champion').fill('Lyra Archivist');
  await page.locator('select').selectOption('Oracle');
  await page.getByPlaceholder('What story should the archive remember?').fill('Guardian of the oldest stories.');
  await page.getByPlaceholder('hero@archive.io').fill(uniqueEmail('library-public'));
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
}

async function advanceTapCinematic(page: Page, taps = 3) {
  for (let index = 0; index < taps; index += 1) {
    await page.mouse.click(980, 520);
    await page.waitForTimeout(700);
  }
}

test('covers home gallery and explore discovery surfaces', async ({ page }) => {
  await resetToExplore(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Explore Forms' })).toBeVisible();
  await page.getByPlaceholder('Search forms...').fill('Japan');
  await expect(page.getByText(/Japan Journey Intake/i)).toBeVisible();
  await page.getByRole('button', { name: 'Globe Explorer' }).click();
  await expect(page.getByText(/Japan Journey Intake/i)).toBeVisible();
  await page.getByRole('button', { name: /Build Your Own/i }).click();
  await expect(page.getByPlaceholder('Your email address...')).toBeVisible();
});

test('covers register, login, forgot password, and invalid reset handling', async ({ page }) => {
  const email = uniqueEmail('e2e-user');
  const password = 'QuestPass123!';

  await openLogin(page);
  await page.getByRole('button', { name: /register/i }).click();
  await page.getByPlaceholder('Your explorer name...').fill('E2E Explorer');
  await page.getByPlaceholder('Your email address...').fill(email);
  await page.locator('input[type="password"]').nth(0).fill(password);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Choose Your Experience')).toBeVisible();

  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page.getByText(/Create Free Account/i)).toBeVisible();

  await login(page, email, password);
  await page.getByRole('button', { name: /sign out/i }).click();

  await openLogin(page);
  await page.getByRole('button', { name: /forgot password\?/i }).click();
  await page.getByPlaceholder('Your email address...').fill(uniqueEmail('missing-account'));
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('If an account exists, a reset link has been sent to that email.')).toBeVisible();

  await page.goto('/?resetToken=invalid-token-value-12345678901234567890');
  await expect(page.getByText(/SET A NEW/i)).toBeVisible();
  await page.locator('input[type="password"]').nth(0).fill('RenewedPass123!');
  await page.locator('input[type="password"]').nth(1).fill('RenewedPass123!');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('This password reset link is invalid or has expired.')).toBeVisible();
});

test('covers public respondent flow for Realm Runner', async ({ page }) => {
  await submitTemplePublicForm(page);
});

test('allows different browsers to submit the same public form but blocks repeat submission in one browser', async ({ page, browser }) => {
  const sharedEmail = uniqueEmail('realm-default-browser-a');

  await page.goto('/?slug=jungle-expedition-registration');
  const publicUrl = page.url();
  await submitRealmRunnerSharedForm(page, {
    runnerName: 'Browser One Runner',
    email: sharedEmail,
    notes: 'First browser submission should succeed.',
  });
  await expect(page.getByText('Submitted!')).toBeVisible();

  await page.goto(publicUrl);
  await expect(page.getByTestId('shared-form-status-title')).toHaveText('Already Submitted');

  const secondContext = await browser.newContext();
  try {
    const secondPage = await secondContext.newPage();
    await secondPage.goto(publicUrl);
    await submitRealmRunnerSharedForm(secondPage, {
      runnerName: 'Browser Two Runner',
      email: uniqueEmail('realm-default-browser-b'),
      notes: 'A different browser should still be allowed to submit.',
    });
    await expect(secondPage.getByText('Submitted!')).toBeVisible();
  } finally {
    await secondContext.close();
  }
});

test('allows the creator to enable response edits for the same browser', async ({ page }) => {
  const formTitle = `Editable Realm Survey ${Date.now()}`;
  const sharedUrl = await createRealmRunnerForm(page, formTitle, true);

  await page.goto(sharedUrl);
  await submitCreatedRealmSurveyForm(page, {
    name: 'Editable Runner',
    email: uniqueEmail('realm-editable-user'),
    feedback: 'Initial response from the same browser.',
  });
  await expect(page.getByText('Submitted!')).toBeVisible();

  await page.goto(sharedUrl);
  await expect(page.getByTestId('shared-form-edit-banner')).toBeVisible();
  await expect(page.locator('input[value="Editable Runner"]').first()).toBeVisible();
  await page.getByPlaceholder('Tell us what you loved...').fill('Updated response from the same browser.');
  await page.getByRole('button', { name: /update response/i }).click();
  await expect(page.getByTestId('shared-form-status-title')).toHaveText('Response Updated!');
});

test('covers public respondent flow for Globe Explorer', async ({ page }) => {
  await submitGlobePublicForm(page);
});

test('covers public respondent flow for The Library', async ({ page }) => {
  await submitLibraryPublicForm(page);
});

test('covers creator dashboard and admin analytics with the seeded demo account', async ({ page }) => {
  await login(page, DEMO_EMAIL, DEMO_PASSWORD);

  await page.getByRole('button', { name: /dashboard/i }).click();
  await expect(page.getByText('Creator Dashboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Forms' })).toBeVisible();

  await page.getByRole('button', { name: /responses/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Responses' })).toBeVisible();
  await expect(
    page.getByText('No responses yet').or(page.getByText('Response #1')),
  ).toBeVisible();
  const firstResponseCard = page.getByText('Response #1');
  if (await firstResponseCard.isVisible()) {
    await firstResponseCard.click();
    await expect(page.getByText('Response Details')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  }

  await page.getByRole('button', { name: 'My Forms' }).click();
  await page.getByRole('button', { name: /analytics/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  await expect(page.getByText('Total Responses')).toBeVisible();

  await page.getByRole('button', { name: 'My Forms' }).click();
  await page.getByRole('button', { name: /admin/i }).click();
  await expect(page.getByText('Admin Dashboard')).toBeVisible();
  await page.getByRole('button', { name: 'Activity' }).click();
  await expect(page.getByText('Top Forms')).toBeVisible();
  await page.getByRole('button', { name: 'Users' }).click();
  await expect(page.getByText('All Users')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Admins$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Members$/ }).first()).toBeVisible();
});

test('covers the realm runner guided flow into preview', async ({ page }) => {
  await openExperiencePicker(page);

  await page.getByRole('heading', { name: /realm runner/i }).click();
  await expect(page.getByTestId('story-intro-skip')).toBeVisible();
  await page.getByTestId('story-intro-skip').click();
  await expect(page.getByText('Choose Your Runner')).toBeVisible();
  await page.getByRole('button', { name: /guy dangerous/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Choose Your World')).toBeVisible();
  await page.getByRole('button', { name: /jungle world/i }).click();
  await page.getByRole('button', { name: 'ENTER →' }).click();
  await expect(page.getByTestId('world-cinematic-skip')).toBeVisible({ timeout: 12000 });
  await page.getByTestId('world-cinematic-skip').click();
  await page.getByRole('button', { name: /feedback survey/i }).click();
  await page.getByRole('button', { name: /accept mission/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByTestId('builder-preview-button').click();
  await expect(page.getByText(/preview mode/i)).toBeVisible();
});

test('covers the globe explorer guided flow into preview', async ({ page }) => {
  await openExperiencePicker(page);

  await page.getByRole('heading', { name: /globe explorer/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /start building/i }).click();
  await expect(page.getByText(/select a country to begin building/i)).toBeVisible();
  await page.getByRole('button', { name: /india/i }).click();
  await expect(page.getByTestId('country-cinematic-advance')).toBeVisible({ timeout: 8000 });
  await advanceCountryCinematic(page);
  await page.getByRole('button', { name: /launch mission/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByTestId('builder-preview-button').click();
  await expect(page.getByRole('heading', { name: /india · india kyc/i })).toBeVisible();
});

test('covers the library guided flow into preview', async ({ page }) => {
  await openExperiencePicker(page);

  await page.getByRole('heading', { name: /the library/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /enter library/i }).click();
  await expect(page.getByText(/choose your world/i)).toBeVisible();
  await page.getByRole('heading', { name: 'Mythology' }).click();
  await expect(page.getByTestId('library-world-cinematic-advance')).toBeVisible({ timeout: 8000 });
  await advanceLibraryCinematic(page);
  await page.getByRole('button', { name: /hero registration/i }).click();
  await page.getByRole('button', { name: /open this volume/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByTestId('builder-preview-button').click();
  await expect(page.getByRole('heading', { name: /mythology · hero registration/i })).toBeVisible();
});