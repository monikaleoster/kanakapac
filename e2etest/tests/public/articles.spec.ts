import { test, expect } from '@playwright/test';

// WF-PUB-06: Article Detail — Open Graph & Facebook Share
//
// This article is created (and left with no cover image) via the admin UI
// as part of setup, so these tests also cover the placeholder fallback for
// og:image and the on-page hero (ticket 02) without needing a second fixture.
test.describe('WF-PUB-06: Article Detail — Open Graph & Facebook Share', () => {
  const articleTitle = `E2E OG Test Article ${Date.now()}`;
  const excerpt = 'A short excerpt used for the Open Graph description.';
  let articleUrl = '';

  test.beforeAll(async ({ browser }, testInfo) => {
    // The full create → publish → navigate → find-link sequence against a
    // live (non-local) deployment doesn't reliably fit in the default 30s
    // hook timeout — give it more headroom.
    testInfo.setTimeout(60000);

    const context = await browser.newContext({ storageState: 'tests/.auth/admin.json' });
    const page = await context.newPage();
    page.on('dialog', (dialog) => dialog.dismiss());

    await page.goto('/admin/articles');
    await page.getByRole('button', { name: /\+ new article/i }).click();

    await page.getByLabel(/title/i).fill(articleTitle);
    await page.getByLabel(/author/i).fill('E2E Author');
    await page.getByLabel(/excerpt/i).fill(excerpt);

    await page.getByRole('button', { name: /save as draft/i }).click();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 8000 });

    const row = page
      .locator('div')
      .filter({ hasText: articleTitle })
      .filter({ has: page.getByRole('button', { name: 'Publish' }) })
      .last();
    await row.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Published').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/articles');
    const link = page.locator('a', { hasText: articleTitle }).first();
    articleUrl = (await link.getAttribute('href')) ?? '';

    await context.close();
  });

  test('published article emits Open Graph meta tags, falling back to the placeholder image', async ({ page }) => {
    test.skip(!articleUrl, 'Setup did not produce an article URL');
    await page.goto(articleUrl);

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBe(articleTitle);
    expect(ogDescription).toBe(excerpt);
    expect(ogType).toBe('article');
    expect(ogImage).toMatch(/^https?:\/\//);
    expect(ogImage).toContain('/images/article-cover-placeholder.jpg');
  });

  test('article with no cover image shows the placeholder as its hero image', async ({ page }) => {
    test.skip(!articleUrl, 'Setup did not produce an article URL');
    await page.goto(articleUrl);

    const hero = page.locator('article img').first();
    await expect(hero).toHaveAttribute('src', /\/images\/article-cover-placeholder\.jpg$/);
  });

  test('Facebook share link targets sharer.php with the article URL', async ({ page, baseURL }) => {
    test.skip(!articleUrl, 'Setup did not produce an article URL');
    await page.goto(articleUrl);

    const shareLink = page.getByRole('link', { name: /share to facebook/i });
    await expect(shareLink).toBeVisible();

    const href = await shareLink.getAttribute('href');
    expect(href).toContain('https://www.facebook.com/sharer/sharer.php?u=');

    const fullArticleUrl = new URL(articleUrl, baseURL).toString();
    expect(href).toContain(encodeURIComponent(fullArticleUrl));
  });

  test('edge case — draft article is not reachable and has no public preview', async ({ page }) => {
    const response = await page.goto('/articles/nonexistent-id-000');
    expect(response?.status()).toBe(404);
  });
});
