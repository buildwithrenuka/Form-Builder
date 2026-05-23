import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';
const APP_STATE_KEY = 'tr_form_builder_app_state';
const HOME_THEME_KEY = 'tr_form_builder_home_theme';

function uniqueEmail(prefix: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${suffix}@example.com`;
}

test.use({
  video: 'on',
  viewport: { width: 1600, height: 900 },
});

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
  await page.waitForTimeout(900);
}

async function advanceRealmStory(page: Page) {
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByText('Choose Your Runner')).toBeVisible();
}

async function clickIntroButton(page: Page, label: RegExp) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(900);
}

async function advanceTapCinematic(page: Page, taps = 3) {
  for (let index = 0; index < taps; index += 1) {
    await page.mouse.click(980, 520);
    await page.waitForTimeout(700);
  }
}

async function openHomeWithTheme(page: Page, theme: 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu' = 'dark') {
  await page.addInitScript(
    ({ themeKey }) => {
      localStorage.removeItem('tr_form_builder_app_state');
      sessionStorage.clear();
      localStorage.setItem(themeKey, 'dark');
    },
    { themeKey: HOME_THEME_KEY },
  );

  await page.goto('/');
  await expect(page.getByText(/Create Free Account/i)).toBeVisible();
  if (theme !== 'dark') {
    await switchHomeTheme(page, theme);
  }
}

async function switchHomeTheme(page: Page, theme: 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu') {
  const currentThemeLabel = page.getByRole('button', { name: /dark|light|rainbow|firecracker|jugnu/i }).last();
  await currentThemeLabel.click();
  await page.getByRole('menuitemradio', { name: new RegExp(theme, 'i') }).click();
  await expect(page.getByRole('button', { name: new RegExp(theme, 'i') }).last()).toBeVisible();
}

async function openPublicForm(page: Page, slug: string, title: RegExp | string) {
  await page.addInitScript(() => {
    localStorage.removeItem('tr_form_builder_app_state');
    sessionStorage.clear();
  });

  await page.goto(`/?slug=${slug}`);
  await expect(page.getByText(title)).toBeVisible();
  await page.waitForTimeout(1200);
}

async function scrollHomePage(page: Page) {
  await page.goto('/');
  await expect(page.getByText(/Create Free Account/i)).toBeVisible();
  await page.waitForTimeout(1000);

  for (const ratio of [0.18, 0.36, 0.58, 0.8, 1] as const) {
    await page.evaluate((nextRatio) => {
      const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      window.scrollTo({ top: Math.max(0, maxScroll * nextRatio), behavior: 'instant' as ScrollBehavior });
    }, ratio);
    await page.waitForTimeout(1200);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1000);
}

async function registerAndLogin(page: Page) {
  const email = uniqueEmail('realm-video-user');
  const password = 'QuestPass123!';

  await page.getByRole('button', { name: /create free account/i }).click();
  await expect(page.getByPlaceholder('Your explorer name...')).toBeVisible();
  await page.getByPlaceholder('Your explorer name...').fill('Video Explorer');
  await page.waitForTimeout(700);
  await page.getByPlaceholder('Your email address...').fill(email);
  await page.waitForTimeout(700);
  await page.locator('input[type="password"]').nth(0).fill(password);
  await page.waitForTimeout(700);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.waitForTimeout(700);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Choose Your Experience')).toBeVisible();
  await page.waitForTimeout(1400);

  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page.getByText(/Create Free Account/i)).toBeVisible();
  await page.waitForTimeout(1200);

  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByPlaceholder('Your email address...')).toBeVisible();
  await page.getByPlaceholder('Your email address...').fill(email);
  await page.waitForTimeout(700);
  await page.locator('input[type="password"]').first().fill(password);
  await page.waitForTimeout(700);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Choose Your Experience')).toBeVisible();
  await page.waitForTimeout(1400);
}

async function buildAndPublishRealmRunnerForm(page: Page) {
  await page.getByRole('heading', { name: /realm runner/i }).click();
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByText('Choose Your Runner')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /guy dangerous/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Choose Your World')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /jungle world/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'ENTER →' }).click();
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByRole('button', { name: /feedback survey/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /feedback survey/i }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /accept mission/i }).click();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText(/published/i)).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1200);
}

async function copyShareLink(page: Page) {
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('button', { name: /copied/i })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1000);
}

test('records homepage to published Realm Runner submission flow', async ({ page, context }) => {
  test.slow();

  await scrollHomePage(page);
  await registerAndLogin(page);
  await buildAndPublishRealmRunnerForm(page);
  await copyShareLink(page);

  await page.getByRole('button', { name: /dashboard/i }).click();
  await expect(page.getByText('Creator Dashboard')).toBeVisible();
  await expect(page.getByText(/feedback survey/i).first()).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'View' }).first().click();
  await expect(page.getByText(/feedback survey/i)).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1600);
  const sharedUrl = page.url();

  const submitPage = await context.newPage();
  await submitPage.goto(sharedUrl);
  await expect(submitPage.getByText(/feedback survey/i)).toBeVisible({ timeout: 12000 });
  await submitPage.waitForTimeout(1200);
  await submitPage.getByPlaceholder('A legendary runner').fill('Cora Runner');
  await submitPage.waitForTimeout(700);
  await submitPage.getByPlaceholder('runner@quest.io').fill(uniqueEmail('realm-share-submit'));
  await submitPage.waitForTimeout(700);
  await submitPage.getByText('Speed Run').click();
  await submitPage.waitForTimeout(700);
  await submitPage.getByPlaceholder('What kind of run are you preparing for?').fill('Testing the shared published form.');
  await submitPage.waitForTimeout(1000);
  await submitPage.getByRole('button', { name: /submit form/i }).click();
  await expect(submitPage.getByText('Submitted!')).toBeVisible({ timeout: 12000 });
  await submitPage.waitForTimeout(1800);
  await submitPage.close();
});

test('records a home theme showcase', async ({ page }) => {
  test.slow();

  await openHomeWithTheme(page);
  await page.waitForTimeout(1400);
  await page.getByText(/5 visual modes: Dark, Light, Rainbow, Firecracker, Jugnu/i).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  for (const theme of ['light', 'rainbow', 'firecracker', 'jugnu', 'dark'] as const) {
    await switchHomeTheme(page, theme);
    await page.waitForTimeout(1600);
  }

  await page.getByText(/Three Ways to Build Forms/i).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.getByText(/Try Real Public Forms/i).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
});

test('records a Realm Runner preview walk-through', async ({ page }) => {
  test.slow();

  await openExperiencePicker(page);
  await page.getByRole('heading', { name: /realm runner/i }).hover();
  await page.waitForTimeout(900);
  await page.getByRole('heading', { name: /realm runner/i }).click();

  await page.waitForTimeout(2200);
  await advanceRealmStory(page);
  await page.waitForTimeout(1200);

  await page.getByRole('button', { name: /guy dangerous/i }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page.getByText('Choose Your World')).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /jungle world/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'ENTER →' }).click();

  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByRole('button', { name: /feedback survey/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /feedback survey/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /accept mission/i }).click();

  await expect(page.getByRole('button', { name: 'Review & Publish' })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  await expect(page.getByText(/preview mode/i)).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await page.waitForTimeout(2200);
});

test('records a Globe Explorer preview walk-through', async ({ page }) => {
  test.slow();

  await openExperiencePicker(page);
  await page.getByRole('heading', { name: /globe explorer/i }).hover();
  await page.waitForTimeout(700);
  await page.getByRole('heading', { name: /globe explorer/i }).click();

  await clickIntroButton(page, /continue/i);
  await clickIntroButton(page, /continue/i);
  await clickIntroButton(page, /start building/i);

  await expect(page.getByText(/select a country to begin building/i)).toBeVisible();
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: /india/i }).click();

  await expect(page.getByText(/tap to continue/i)).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await advanceTapCinematic(page);
  await expect(page.getByRole('button', { name: /india kyc/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /india kyc/i }).click();
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /launch mission/i }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  await expect(page.getByRole('heading', { name: /india · india kyc/i })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await page.waitForTimeout(1800);
});

test('records a Library preview walk-through', async ({ page }) => {
  test.slow();

  await openExperiencePicker(page);
  await page.getByRole('heading', { name: /the library/i }).hover();
  await page.waitForTimeout(700);
  await page.getByRole('heading', { name: /the library/i }).click();

  await clickIntroButton(page, /continue/i);
  await clickIntroButton(page, /continue/i);
  await clickIntroButton(page, /enter library/i);

  await expect(page.getByText(/choose your world/i)).toBeVisible();
  await page.waitForTimeout(1100);
  await page.getByRole('heading', { name: 'Mythology' }).click();

  await expect(page.getByText(/tap to continue/i)).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await advanceTapCinematic(page);
  await expect(page.getByRole('button', { name: /hero registration/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /hero registration/i }).click();
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /open this volume/i }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  await expect(page.getByRole('heading', { name: /mythology · hero registration/i })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await page.waitForTimeout(1800);
});

test('records a Realm Runner public submission flow', async ({ page }) => {
  test.slow();

  await openPublicForm(page, 'jungle-expedition-registration', 'Jungle Expedition Registration');
  await page.getByPlaceholder('A legendary runner').fill('Ava Pathfinder');
  await page.waitForTimeout(800);
  await page.getByPlaceholder('runner@quest.io').fill(uniqueEmail('temple-public-video'));
  await page.waitForTimeout(800);
  await page.getByText('Speed Run').click();
  await page.waitForTimeout(900);
  await page.getByPlaceholder('What kind of run are you preparing for?').fill('Preparing for the jungle sprint.');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
  await page.waitForTimeout(1800);
});

test('records a Globe Explorer public submission flow', async ({ page }) => {
  test.slow();

  await openPublicForm(page, 'japan-journey-intake', 'Japan Journey Intake');
  await page.getByPlaceholder('Full passport name').fill('Maya Traveler');
  await page.waitForTimeout(800);
  await page.getByPlaceholder('traveler@example.com').fill(uniqueEmail('globe-public-video'));
  await page.waitForTimeout(800);
  await page.locator('input[type="date"]').fill('2026-06-15');
  await page.waitForTimeout(800);
  await page.locator('select').selectOption('Tourism');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
  await page.waitForTimeout(1800);
});

test('records a Library public submission flow', async ({ page }) => {
  test.slow();

  await openPublicForm(page, 'mythic-hero-archive', 'Mythic Hero Archive');
  await page.getByPlaceholder('Name of the champion').fill('Lyra Archivist');
  await page.waitForTimeout(800);
  await page.locator('select').selectOption('Oracle');
  await page.waitForTimeout(800);
  await page.getByPlaceholder('What story should the archive remember?').fill('Guardian of the oldest stories.');
  await page.waitForTimeout(800);
  await page.getByPlaceholder('hero@archive.io').fill(uniqueEmail('library-public-video'));
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await expect(page.getByText('Submitted!')).toBeVisible();
  await page.waitForTimeout(1800);
});