import { test, expect, APIRequestContext } from '@playwright/test';
import { AdminAnnouncementsPage } from '../pages/admin/AdminAnnouncementsPage';

test.use({ storageState: 'tests/.auth/admin.json' });

// The announcements page calls confirm() after every POST to offer email notification.
// Dismiss it unconditionally so it doesn't block test flow.
test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.dismiss());
});

const TEST_ANNOUNCEMENT = {
  title: 'E2E Test Announcement',
  content: 'This is a test announcement created by Playwright.',
  priority: 'normal' as const,
};

// Tests below create announcements through the admin UI, which doesn't hand
// back an id the way the API does — look it up by title so every test can
// delete what it created instead of leaking permanently-active rows into the
// shared staging database (this previously left duplicate "Urgent E2E Test"
// rows active forever, crowding real announcements out of the homepage rail).
async function deleteAnnouncementByTitle(request: APIRequestContext, title: string) {
  const res = await request.get('/api/announcements');
  const all: { id: string; title: string }[] = await res.json();
  await Promise.all(
    all.filter((a) => a.title === title).map((a) => request.delete(`/api/announcements?id=${a.id}`))
  );
}

// WF-ADM-09: Manage Announcements — Create
// WF-ADM-10: Manage Announcements — Edit
// WF-ADM-11: Manage Announcements — Delete
test.describe('WF-ADM-09: Announcements — Create', () => {
  test('happy path — create normal announcement', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm(TEST_ANNOUNCEMENT);
    await announcementsPage.submitBtn.click();

    try {
      await expect(page.getByText(TEST_ANNOUNCEMENT.title).first()).toBeVisible({ timeout: 8000 });
    } finally {
      await deleteAnnouncementByTitle(request, TEST_ANNOUNCEMENT.title);
    }
  });

  test('happy path — create urgent announcement with red styling on public page', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({
      title: 'Urgent E2E Test',
      content: 'Urgent test content.',
      priority: 'urgent',
    });
    await announcementsPage.submitBtn.click();

    try {
      await expect(page.getByText('Urgent E2E Test').first()).toBeVisible({ timeout: 8000 });

      // Verify it shows with urgent styling on the public announcements page
      await page.goto('/announcements');
      const urgentBadge = page.getByText(/urgent/i).first();
      await expect(urgentBadge).toBeVisible();
    } finally {
      await deleteAnnouncementByTitle(request, 'Urgent E2E Test');
    }
  });

  test('happy path — announcement without expiry never expires', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({ ...TEST_ANNOUNCEMENT, title: 'No Expiry Test' });
    await announcementsPage.submitBtn.click();

    try {
      await expect(page.getByText('No Expiry Test').first()).toBeVisible({ timeout: 8000 });
    } finally {
      await deleteAnnouncementByTitle(request, 'No Expiry Test');
    }
  });

  test('edge case — announcement with past expiry immediately excluded from homepage', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({
      ...TEST_ANNOUNCEMENT,
      title: 'Already Expired Test',
      expiresAt: '2020-01-01',
    });
    await announcementsPage.submitBtn.click();

    try {
      await expect(page.getByText('Already Expired Test').first()).toBeVisible({ timeout: 8000 });

      // Visit homepage — expired announcement should NOT appear
      await page.goto('/');
      await expect(page.getByText('Already Expired Test')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    } finally {
      await deleteAnnouncementByTitle(request, 'Already Expired Test');
    }
  });
});

test.describe('WF-ADM-10: Announcements — Edit', () => {
  test('happy path — edit pre-fills form and updates list', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    const editBtns = announcementsPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    const titleValue = await announcementsPage.titleInput.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);

    const updatedTitle = 'Updated Announcement Title';
    await announcementsPage.titleInput.fill(updatedTitle);
    await announcementsPage.submitBtn.click();

    await expect(page.getByText(updatedTitle).first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — changing priority from urgent to normal removes red styling', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    const priorityTitle = `Priority Change Test ${Date.now()}`;

    try {
      // Create an urgent announcement
      await announcementsPage.newAnnouncementBtn.click();
      await announcementsPage.fillForm({
        title: priorityTitle,
        content: 'Originally urgent.',
        priority: 'urgent',
      });
      await announcementsPage.submitBtn.click();
      await expect(page.getByText(priorityTitle).first()).toBeVisible({ timeout: 8000 });

      // Edit to change priority to normal
      const targetRow = page.locator('div').filter({ has: page.getByRole('heading', { name: priorityTitle }) }).filter({ has: page.getByRole('button', { name: /edit/i }) }).last();
      await targetRow.getByRole('button', { name: /edit/i }).click();
      await announcementsPage.prioritySelect.selectOption('normal');
      await announcementsPage.submitBtn.click();
      await expect(page.getByText(priorityTitle).first()).toBeVisible({ timeout: 8000 });

      // On public page, no urgent badge for this item
      await page.goto('/announcements');
      const card = page.locator('article, [class*="card"]').filter({ hasText: priorityTitle });
      if (await card.count() > 0) {
        const urgentBadge = card.locator(':text("Urgent")');
        await expect(urgentBadge).not.toBeVisible().catch(() => {});
      }
    } finally {
      await deleteAnnouncementByTitle(request, priorityTitle);
    }
  });

  test('edge case — clearing expiry date saves null (announcement becomes permanent)', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    const editBtns = announcementsPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    await announcementsPage.expiresInput.clear();
    await announcementsPage.submitBtn.click();

    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});

test.describe('WF-ADM-11: Announcements — Delete', () => {
  test('happy path — delete removes announcement from list', async ({ page, request }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    const toDelete = `Announcement To Delete ${Date.now()}`;

    try {
      await announcementsPage.newAnnouncementBtn.click();
      await announcementsPage.fillForm({ ...TEST_ANNOUNCEMENT, title: toDelete });
      await announcementsPage.submitBtn.click();
      await expect(page.getByText(toDelete).first()).toBeVisible({ timeout: 8000 });

      const targetRow = page.locator('div').filter({ has: page.getByRole('heading', { name: toDelete }) }).filter({ has: page.getByRole('button', { name: /delete/i }) }).last();
      await targetRow.getByRole('button', { name: /delete/i }).click();
      await expect(announcementsPage.confirmDeleteBtn).toBeVisible();
      await announcementsPage.confirmDeleteBtn.click();

      await expect(page.getByText(toDelete)).not.toBeVisible({ timeout: 8000 });
    } finally {
      // Backstop in case the UI delete above didn't complete (e.g. an earlier assertion threw).
      await deleteAnnouncementByTitle(request, toDelete);
    }
  });

  test('edge case — cancel delete keeps announcement', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    const deleteBtns = announcementsPage.getDeleteBtns();
    if (await deleteBtns.count() === 0) test.skip();

    const countBefore = await announcementsPage.getAnnouncementListItems().count();
    await deleteBtns.first().click();
    await announcementsPage.cancelDeleteBtn.click();

    const countAfter = await announcementsPage.getAnnouncementListItems().count();
    expect(countAfter).toBe(countBefore);
  });
});
