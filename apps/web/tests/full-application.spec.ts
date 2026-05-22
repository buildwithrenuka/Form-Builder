import { expect, test, type Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@formverse.io';
const DEMO_PASSWORD = 'Demo1234!';
const APP_STATE_KEY = 'tr_form_builder_app_state';
const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';

function uniqueEmail(prefix: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${suffix}@example.com`;
}

async function goHome(page: Page) {
  await page.goto('/');
  await expect(page.getByText(/Create Free Account|Choose Your Experience/i)).toBeVisible();
}

async function openLogin(page: Page) {
  await goHome(page);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByPlaceholder('Your email address...')).toBeVisible();
}

async function login(page: Page, email: string, password: string) {
  await openLogin(page);
  await page.getByPlaceholder('Your email address...').fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Choose Your Experience')).toBeVisible();
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

  await expect(page.getByText('Explore Forms')).toBeVisible();
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
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByText('Choose Your Runner')).toBeVisible();
  await page.getByRole('button', { name: /guy dangerous/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Choose Your World')).toBeVisible();
  await page.getByRole('button', { name: /jungle world/i }).click();
  await page.getByRole('button', { name: 'ENTER →' }).click();
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip/i }).click();
  await page.getByRole('button', { name: /feedback survey/i }).click();
  await page.getByRole('button', { name: /accept mission/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
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
  await expect(page.getByText(/tap to continue/i)).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await advanceTapCinematic(page);
  await page.getByRole('button', { name: /india kyc/i }).click();
  await page.getByRole('button', { name: /launch mission/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
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
  await expect(page.getByText(/tap to continue/i)).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await advanceTapCinematic(page);
  await page.getByRole('button', { name: /hero registration/i }).click();
  await page.getByRole('button', { name: /open this volume/i }).click();
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('heading', { name: /mythology · hero registration/i })).toBeVisible();
});