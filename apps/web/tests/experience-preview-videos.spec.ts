import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'fq_session';
const TOKEN_KEY = 'fq_token';
const APP_STATE_KEY = 'tr_form_builder_app_state';

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

async function clickTemplateCard(page: Page, label: RegExp) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(1200);
}

async function advanceTapCinematic(page: Page, taps = 3) {
  for (let index = 0; index < taps; index += 1) {
    await page.mouse.click(980, 520);
    await page.waitForTimeout(700);
  }
}

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

  await expect(page.getByRole('button', { name: /preview/i })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: /preview/i }).click();

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
  await expect(page.getByRole('button', { name: /preview/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1600);
  await clickTemplateCard(page, /contact us/i);
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /preview/i }).click();

  await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible({ timeout: 8000 });
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
  await expect(page.getByRole('button', { name: /preview/i })).toBeVisible({ timeout: 12000 });
  await page.waitForTimeout(1600);
  await clickTemplateCard(page, /event registration/i);
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /preview/i }).click();

  await expect(page.getByRole('heading', { name: /event registration/i })).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3200);
  await page.getByRole('button', { name: /submit form/i }).click();
  await page.waitForTimeout(1800);
});