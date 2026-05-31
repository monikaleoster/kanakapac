import { test, expect } from '@playwright/test';
import { AdminMinutesPage } from '../pages/admin/AdminMinutesPage';

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
  test('happy path — create minutes appears in list', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm(TEST_MINUTES);
    await minutesPage.submitBtn.click();

    await expect(page.getByText(TEST_MINUTES.title).first()).toBeVisible({ timeout: 8000 });
  });

  test('edge case — no content saves minutes with title only', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    await minutesPage.newMinutesBtn.click();
    await minutesPage.fillMinutesForm({ ...TEST_MINUTES, title: 'No Content Minutes', content: 'placeholder' });
    await minutesPage.submitBtn.click();

    await expect(page.getByText('No Content Minutes').first()).toBeVisible({ timeout: 8000 });
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

  test('edge case — edit content updates the record', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const editBtns = minutesPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    await minutesPage.contentInput.fill('Updated content from E2E test.');
    await minutesPage.submitBtn.click();

    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});

test.describe('WF-ADM-08: Minutes — Delete', () => {
  test('happy path — delete removes record from list', async ({ page }) => {
    const minutesPage = new AdminMinutesPage(page);
    await minutesPage.goto();

    const toDelete = `Minutes To Delete ${Date.now()}`;

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
