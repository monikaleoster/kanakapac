import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  publishedAt: string;
  expiresAt: string | null;
}

// WF-PUB-01: Browse Homepage
test.describe('WF-PUB-01: Homepage', () => {
  test('happy path — hero section and CTAs visible', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heading).toBeVisible();
    await expect(home.viewEventsBtn).toBeVisible();
    await expect(home.learnAboutBtn).toBeVisible();

    await expect(home.viewEventsBtn).toHaveAttribute('href', /\/events/);
    await expect(home.learnAboutBtn).toHaveAttribute('href', /\/about/);
  });

  test('happy path — upcoming events section shown', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.upcomingEventsSection).toBeVisible();
  });

  test('happy path — articles section shows a featured article and article grid', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.articlesSection).toBeVisible();

    // The "Latest News" section renders either a featured article (plus an
    // optional grid of further ones) or the empty-state message — never both.
    const featuredCount = await page.getByText(/^Featured$/).count();
    if (featuredCount > 0) {
      await expect(home.noNewsMsg).not.toBeVisible();
    } else {
      await expect(home.noNewsMsg).toBeVisible();
    }
  });

  test('happy path — announcements rail shown when there are active announcements', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // The rail is omitted entirely when there's nothing active to announce,
    // so only assert on it when the heading is actually present.
    const count = await home.announcementsSection.count();
    if (count > 0) {
      await expect(home.announcementsSection).toBeVisible();
    }
  });

  test('edge case — CTA links navigate to correct pages', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.viewEventsBtn.click();
    await expect(page).toHaveURL(/\/events/);

    await page.goBack();
    await home.learnAboutBtn.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('edge case — homepage is fresh (no stale cache)', async ({ page }) => {
    const home = new HomePage(page);
    const response = await page.goto('/');
    // force-dynamic pages should not be served from CDN cache with long TTLs
    const cacheControl = response?.headers()['cache-control'] ?? '';
    expect(cacheControl).not.toMatch(/max-age=[1-9]\d{3,}/);
  });

  test('edge case — max 3 event cards shown on homepage', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // If events exist, at most 3 should appear in the upcoming section
    const eventCards = home.getEventCards();
    const count = await eventCards.count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test('edge case — urgent announcement banner present when urgent announcements exist', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Check whether any urgent banner OR no urgent content is shown
    const urgentBannerCount = await home.urgentBanner.count();
    // We don't assert it MUST be there since content may vary, but if present it should contain text
    if (urgentBannerCount > 0) {
      await expect(home.urgentBanner.first()).not.toBeEmpty();
    }
  });
});

// WF-PUB-01: Announcements rail ordering — seeds deterministic data via the
// admin API instead of relying on whatever's already active, since the
// happy-path tests above are conditional and never actually exercise this.
test.describe('WF-PUB-01: Homepage — announcements rail ordering', () => {
  test.use({ storageState: 'tests/.auth/admin.json' });
  // fullyParallel is on globally, but these tests mutate the same
  // announcements table (seed/delete, snapshot/restore) — running them
  // concurrently could resurrect a deleted row via upsert.
  test.describe.configure({ mode: 'serial' });

  test('edge case — urgent announcements are shown ahead of normal ones', async ({ page, request }) => {
    // admin/announcements.spec.ts used to create fixed-title announcements
    // (e.g. "Urgent E2E Test") without ever deleting them, leaving permanently
    // active rows in the shared staging DB that crowd this rail's top-4 slice
    // ahead of anything this test seeds. That leak is fixed now, but purge any
    // rows it already left behind so this assertion isn't at the mercy of
    // whatever ran before it.
    const leakedTestTitles = new Set([
      'Urgent E2E Test',
      'E2E Test Announcement',
      'No Expiry Test',
      'Already Expired Test',
    ]);
    const staleRes = await request.get('/api/announcements');
    const stale: Announcement[] = await staleRes.json();
    await Promise.all(
      stale
        .filter((a) => leakedTestTitles.has(a.title) || /^Priority Change Test \d+$/.test(a.title))
        .map((a) => request.delete(`/api/announcements?id=${a.id}`))
    );

    const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const normalTitle = 'E2E Normal Test Announcement';
    const urgentTitle = 'E2E Urgent Test Announcement';

    const normalRes = await request.post('/api/announcements', {
      data: {
        title: normalTitle,
        content: 'Seeded by e2e test.',
        priority: 'normal',
        publishedAt: farFuture,
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const normalAnnouncement = await normalRes.json();

    const urgentRes = await request.post('/api/announcements', {
      data: {
        title: urgentTitle,
        content: 'Seeded by e2e test.',
        priority: 'urgent',
        publishedAt: farFuture,
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const urgentAnnouncement = await urgentRes.json();

    try {
      const home = new HomePage(page);
      await home.goto();

      await expect(home.announcementsSection).toBeVisible();

      const titles = await home.getAnnouncementCards().locator('h3').allTextContents();
      const urgentIndex = titles.indexOf(urgentTitle);
      const normalIndex = titles.indexOf(normalTitle);

      expect(urgentIndex).toBeGreaterThanOrEqual(0);
      expect(normalIndex).toBeGreaterThanOrEqual(0);
      expect(urgentIndex).toBeLessThan(normalIndex);
    } finally {
      await request.delete(`/api/announcements?id=${normalAnnouncement.id}`);
      await request.delete(`/api/announcements?id=${urgentAnnouncement.id}`);
    }
  });

  test('edge case — announcements rail is entirely omitted when there are no active announcements', async ({
    page,
    request,
  }) => {
    const now = Date.now();
    const past = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    const allRes = await request.get('/api/announcements');
    const allAnnouncements: Announcement[] = await allRes.json();
    const activeOriginals = allAnnouncements.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt).getTime() > now
    );

    // Deactivate every currently-active announcement so the homepage has
    // nothing to show, then restore each one's original expiresAt no matter
    // what happens in between.
    for (const announcement of activeOriginals) {
      await request.put('/api/announcements', {
        data: { ...announcement, expiresAt: past },
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const home = new HomePage(page);
      await home.goto();

      await expect(home.announcementsSection).toHaveCount(0);
    } finally {
      for (const original of activeOriginals) {
        await request.put('/api/announcements', {
          data: original,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  });
});
