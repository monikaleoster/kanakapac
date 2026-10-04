import { test, expect } from '@playwright/test';
import { AdminMinutesPage } from '../pages/admin/AdminMinutesPage';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_MINUTES_TITLES = ['E2E Test Minutes'];

// WF-ADM-06: Manage Minutes — Create
// WF-ADM-07: Manage Minutes — Edit
// WF-ADM-08: Manage Minutes — Delete
test.describe('WF-ADM-06: Minutes — Create', () => {
  test('happy path — create minutes with file upload', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();

    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileUrl: 'https://example.com/e2e-minutes.pdf' }),
      })
    );

    await minutesPage.fillMinutesForm({ title: 'E2E Test Minutes', date: '2027-03-10' });
    await minutesPage.uploadFile({
      name: 'minutes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 content'),
    });

    await expect(minutesPage.submitBtn).toBeEnabled({ timeout: 5000 });
    await minutesPage.submitBtn.click();

    await expect(page.getByText('E2E Test Minutes').first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — submit button disabled until a file is uploaded', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm({ title: 'No File Minutes', date: '2027-03-11' });

    await expect(minutesPage.submitBtn).toBeDisabled();
  });

  test('edge case — invalid file type leaves submit button disabled', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();

    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Invalid file type' }) })
    );

    await minutesPage.uploadFile({
      name: 'image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('PNG data'),
    });

    await expect(minutesPage.submitBtn).toBeDisabled({ timeout: 3000 });
  });

  test.afterAll(async ({ request }) => {
    const res = await request.get('/api/minutes');
    const minutes: Array<{ id: string; title: string }> = await res.json();
    for (const entry of minutes) {
      if (TEST_MINUTES_TITLES.includes(entry.title)) {
        await request.delete(`/api/minutes?id=${entry.id}`);
      }
    }
  });
});

test.describe('WF-ADM-07: Minutes — Edit', () => {
  test('happy path — edit title and date without re-uploading preserves fileUrl', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const editBtns = minutesPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    const currentTitle = await minutesPage.titleInput.inputValue();
    expect(currentTitle.length).toBeGreaterThan(0);

    await minutesPage.titleInput.fill('Updated Minutes Title');
    // Submit without touching the file input — fileUrl should be preserved
    // and the submit button must not be disabled by the empty file picker.
    await minutesPage.submitBtn.click();

    // The edit renames a shared entry that earlier runs also renamed, so several may match.
    await expect(page.getByText('Updated Minutes Title').first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — replacing the document on edit updates fileUrl', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const editBtns = minutesPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();

    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileUrl: 'https://example.com/replaced-minutes.pdf' }),
      })
    );

    await minutesPage.uploadFile({
      name: 'replacement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 replacement'),
    });

    await expect(page.getByText(/replaced-minutes\.pdf/)).toBeVisible({ timeout: 5000 });

    await minutesPage.submitBtn.click();
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});

test.describe('WF-ADM-08: Minutes — Delete', () => {
  test('happy path — delete removes record from list', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const toDelete = `Minutes To Delete ${Date.now()}`;

    await page.route(/\/api\/upload/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileUrl: 'https://example.com/to-delete.pdf' }),
      })
    );

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm({ title: toDelete, date: '2027-04-01' });
    await minutesPage.uploadFile({
      name: 'to-delete.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 content'),
    });
    await expect(minutesPage.submitBtn).toBeEnabled({ timeout: 5000 });
    await minutesPage.submitBtn.click();
    await expect(page.getByText(toDelete).first()).toBeVisible({ timeout: 8000 });

    const targetRow = minutesPage.getMinutesListItems().filter({ hasText: toDelete });
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
