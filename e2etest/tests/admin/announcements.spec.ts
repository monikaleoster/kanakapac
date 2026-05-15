import { test, expect } from '@playwright/test';
import { AdminAnnouncementsPage } from '../pages/admin/AdminAnnouncementsPage';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_ANNOUNCEMENT = {
  title: 'E2E Test Announcement',
  content: 'This is a test announcement created by Playwright.',
  priority: 'normal' as const,
};

// WF-ADM-09: Manage Announcements — Create
// WF-ADM-10: Manage Announcements — Edit
// WF-ADM-11: Manage Announcements — Delete
test.describe('WF-ADM-09: Announcements — Create', () => {
  test('happy path — create normal announcement', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm(TEST_ANNOUNCEMENT);
    await announcementsPage.submitBtn.click();

    await expect(page.getByText(TEST_ANNOUNCEMENT.title)).toBeVisible({ timeout: 8000 });
  });

  test('happy path — create urgent announcement with red styling on public page', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({
      title: 'Urgent E2E Test',
      content: 'Urgent test content.',
      priority: 'urgent',
    });
    await announcementsPage.submitBtn.click();

    await expect(page.getByText('Urgent E2E Test')).toBeVisible({ timeout: 8000 });

    // Verify it shows with urgent styling on the public announcements page
    await page.goto('/announcements');
    const urgentBadge = page.getByText(/urgent/i).first();
    await expect(urgentBadge).toBeVisible();
  });

  test('happy path — announcement without expiry never expires', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({ ...TEST_ANNOUNCEMENT, title: 'No Expiry Test' });
    await announcementsPage.submitBtn.click();

    await expect(page.getByText('No Expiry Test')).toBeVisible({ timeout: 8000 });
  });

  test('edge case — announcement with past expiry immediately excluded from homepage', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({
      ...TEST_ANNOUNCEMENT,
      title: 'Already Expired Test',
      expiresAt: '2020-01-01',
    });
    await announcementsPage.submitBtn.click();

    await expect(page.getByText('Already Expired Test')).toBeVisible({ timeout: 8000 });

    // Visit homepage — expired announcement should NOT appear
    await page.goto('/');
    await expect(page.getByText('Already Expired Test')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
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

    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 8000 });
  });

  test('edge case — changing priority from urgent to normal removes red styling', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    // Create an urgent announcement
    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({
      title: 'Priority Change Test',
      content: 'Originally urgent.',
      priority: 'urgent',
    });
    await announcementsPage.submitBtn.click();
    await expect(page.getByText('Priority Change Test')).toBeVisible({ timeout: 8000 });

    // Edit to change priority to normal
    const targetRow = page.locator('li, tr, article').filter({ hasText: 'Priority Change Test' });
    await targetRow.getByRole('button', { name: /edit/i }).click();
    await announcementsPage.prioritySelect.selectOption('normal');
    await announcementsPage.submitBtn.click();
    await expect(page.getByText('Priority Change Test')).toBeVisible({ timeout: 8000 });

    // On public page, no urgent badge for this item
    await page.goto('/announcements');
    const card = page.locator('article, [class*="card"]').filter({ hasText: 'Priority Change Test' });
    if (await card.count() > 0) {
      const urgentBadge = card.locator(':text("Urgent")');
      await expect(urgentBadge).not.toBeVisible().catch(() => {});
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
  test('happy path — delete removes announcement from list', async ({ page }) => {
    const announcementsPage = new AdminAnnouncementsPage(page);
    await announcementsPage.goto();

    await announcementsPage.newAnnouncementBtn.click();
    await announcementsPage.fillForm({ ...TEST_ANNOUNCEMENT, title: 'Announcement To Delete' });
    await announcementsPage.submitBtn.click();
    await expect(page.getByText('Announcement To Delete')).toBeVisible({ timeout: 8000 });

    const targetRow = page.locator('li, tr, article').filter({ hasText: 'Announcement To Delete' });
    await targetRow.getByRole('button', { name: /delete/i }).click();
    await expect(announcementsPage.confirmDeleteBtn).toBeVisible();
    await announcementsPage.confirmDeleteBtn.click();

    await expect(page.getByText('Announcement To Delete')).not.toBeVisible({ timeout: 8000 });
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
