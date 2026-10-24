import { Page, expect, test } from '@playwright/test';

/**
 * Routing behaviour, asserted against the real app in a real browser.
 *
 * Scope is deliberately narrow, and `.claude/skills/run-the-app/SKILL.md` owns
 * the statement of where the line sits. In short: the Campaign service is
 * covered at Seam A and component rendering at Seam B, so what is left for here
 * is the router alone.
 */

const screenHeading = (page: Page, name: string) => page.getByRole('heading', { name, level: 1 });

const navigation = (page: Page) => page.getByRole('navigation');

const brandLink = (page: Page) => page.getByRole('link', { name: 'DnD Campaign Manager' });

test.describe('routes resolve to the screen they claim', () => {
  test('/campaigns renders the Campaign list inside the Layout', async ({ page }) => {
    await page.goto('/campaigns');

    // The screen itself...
    await expect(screenHeading(page, 'Campaigns')).toBeVisible();
    // ...rendered inside the app shell, not standalone.
    await expect(brandLink(page)).toBeVisible();
    await expect(navigation(page)).toBeVisible();
  });

  test('/campaigns/new renders the record-a-Campaign form inside the Layout', async ({ page }) => {
    await page.goto('/campaigns/new');

    await expect(screenHeading(page, 'Record a campaign')).toBeVisible();
    await expect(navigation(page)).toBeVisible();
  });

  test('/login renders the sign-in screen, standalone with no app shell', async ({ page }) => {
    await page.goto('/login');

    await expect(screenHeading(page, 'Sign in')).toBeVisible();
    await expect(navigation(page)).toHaveCount(0);
    await expect(brandLink(page)).toHaveCount(0);
  });
});

test.describe('redirects land', () => {
  test('an old Dashboard bookmark lands on the Campaign list', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/campaigns');
    await expect(screenHeading(page, 'Campaigns')).toBeVisible();
  });

  test('the root path lands on sign-in', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/login');
    await expect(screenHeading(page, 'Sign in')).toBeVisible();
  });

  test('an unknown path lands on sign-in', async ({ page }) => {
    await page.goto('/no-such-page');

    await expect(page).toHaveURL('/login');
    await expect(screenHeading(page, 'Sign in')).toBeVisible();
  });
});

test.describe('the navigation marks itself active', () => {
  test('the Campaigns link is marked as the current page while on a Campaign screen', async ({
    page,
  }) => {
    await page.goto('/campaigns');

    // `aria-current`, not the CSS class: this is what a User on a screen reader
    // is told, so it survives the stylesheet being rewritten.
    const campaignsLink = navigation(page).getByRole('link', { name: 'Campaigns' });
    await expect(campaignsLink).toHaveAttribute('aria-current', 'page');
  });

  test('the Campaigns link stays current on a screen within the section', async ({ page }) => {
    // `routerLinkActive` matches by prefix, so recording a Campaign still
    // counts as being in Campaigns. That is the behaviour we want: a User
    // filling in the form has not left the section.
    await page.goto('/campaigns/new');

    const campaignsLink = navigation(page).getByRole('link', { name: 'Campaigns' });
    await expect(campaignsLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('a click arrives', () => {
  test('the list CTA takes a User to the record-a-Campaign form', async ({ page }) => {
    await page.goto('/campaigns');

    await page.getByRole('link', { name: 'Record a campaign' }).click();

    await expect(page).toHaveURL('/campaigns/new');
    await expect(screenHeading(page, 'Record a campaign')).toBeVisible();
  });

  test('cancelling the form takes a User back to the list', async ({ page }) => {
    await page.goto('/campaigns/new');

    await page.getByRole('link', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/campaigns');
    await expect(screenHeading(page, 'Campaigns')).toBeVisible();
  });

  test('the brand takes a User home from anywhere in the app', async ({ page }) => {
    await page.goto('/campaigns/new');

    await brandLink(page).click();

    await expect(page).toHaveURL('/campaigns');
    await expect(screenHeading(page, 'Campaigns')).toBeVisible();
  });
});
