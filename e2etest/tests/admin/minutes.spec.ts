import { test, expect } from '@playwright/test';
import { AdminMinutesPage } from '../pages/admin/AdminMinutesPage';
import path from 'path';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_MINUTES = {
  title: 'E2E Test Minutes',
  date: '2027-03-10',
  content: '## Agenda\n- Item 1\n- Item 2\n\nMeeting adjourned.',
};

// WF-ADM-06: Manage Minutes — Create
// WF-ADM-07: Manage Minutes — Edit
// WF-ADM-08: Manage Minutes — Delete
test.describe('WF-ADM-06: Minutes — Create', () => {
  test('happy path — create minutes without file', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm(TEST_MINUTES);
    await minutesPage.submitBtn.click();

    await expect(page.getByText(TEST_MINUTES.title).first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — invalid file type rejected by upload API', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();

    // Intercept the upload endpoint to simulate rejection
    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Invalid file type' }) })
    );

    // Trigger file upload with a fake file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await minutesPage.fileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('fake file content'),
    });

    // Upload error should be visible
    const errorVisible = await page.getByText(/invalid|error|failed/i).first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('edge case — no file selected saves minutes with content preview', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm({ ...TEST_MINUTES, title: 'No File Minutes' });
    await minutesPage.submitBtn.click();

    await expect(page.getByText('No File Minutes').first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('WF-ADM-07: Minutes — Edit', () => {
  test('happy path — edit pre-fills form and saves changes', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const editBtns = minutesPage.getEditBtns();
    const count = await editBtns.count();
    if (count === 0) test.skip();

    await editBtns.first().click();

    const titleValue = await minutesPage.titleInput.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);

    const updatedTitle = 'Updated Minutes Title';
    await minutesPage.titleInput.fill(updatedTitle);
    await minutesPage.submitBtn.click();

    await expect(page.getByText(updatedTitle).first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — re-upload sets new fileUrl (old file orphaned)', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const editBtns = minutesPage.getEditBtns();
    const count = await editBtns.count();
    if (count === 0) test.skip();

    await editBtns.first().click();

    // Intercept upload to return a mock new URL
    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileUrl: 'https://example.com/new-file.pdf' }),
      })
    );

    const fileChooserPromise = page.waitForEvent('filechooser');
    await minutesPage.fileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'new-minutes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    });

    // Upload should succeed — filename or URL change visible in form
    const uploadFeedback = page.getByText(/new-minutes\.pdf|uploaded/i);
    await expect(uploadFeedback).toBeVisible({ timeout: 5000 });
  });
});

test.describe('WF-ADM-08: Minutes — Delete', () => {
  test('happy path — delete removes record from list', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const toDelete = `Minutes To Delete ${Date.now()}`;

    // Create a minutes record to delete
    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm({ ...TEST_MINUTES, title: toDelete });
    await minutesPage.submitBtn.click();
    await expect(page.getByText(toDelete).first()).toBeVisible({ timeout: 8000 });

    const targetRow = page.locator('div').filter({ has: page.getByRole('heading', { name: toDelete }) }).filter({ has: page.getByRole('button', { name: /delete/i }) }).last();
    await targetRow.getByRole('button', { name: /delete/i }).click();

    await expect(minutesPage.confirmDeleteBtn).toBeVisible();
    await minutesPage.confirmDeleteBtn.click();

    await expect(page.getByText(toDelete)).not.toBeVisible({ timeout: 8000 });
  });

  test('edge case — cancel delete keeps record in list', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const deleteBtns = minutesPage.getDeleteBtns();
    if (await deleteBtns.count() === 0) test.skip();

    const itemsBefore = await minutesPage.getMinutesListItems().count();
    await deleteBtns.first().click();
    await minutesPage.cancelDeleteBtn.click();

    const itemsAfter = await minutesPage.getMinutesListItems().count();
    expect(itemsAfter).toBe(itemsBefore);
  });
});
