import { test, expect } from '@playwright/test';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_EVENT = {
  title: 'E2E Test Event',
  date: '2027-06-15',
  time: '10:00',
  location: 'Test Gymnasium',
  description: 'Created by Playwright E2E test',
};

// WF-ADM-03: Manage Events — Create
// WF-ADM-04: Manage Events — Edit
// WF-ADM-05: Manage Events — Delete
test.describe('WF-ADM-03: Events — Create', () => {
  test('happy path — create a new event and verify it appears in list', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm(TEST_EVENT);
    await eventsPage.submitBtn.click();

    await expect(page.getByText(TEST_EVENT.title)).toBeVisible({ timeout: 8000 });
  });

  test('edge case — required fields enforce HTML5 validation', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    await eventsPage.newEventBtn.click();
    // Leave title empty and try to submit
    await eventsPage.dateInput.fill('2027-06-15');
    await eventsPage.timeInput.fill('10:00');
    await eventsPage.locationInput.fill('Some Location');
    await eventsPage.descriptionInput.fill('Some description');
    await eventsPage.submitBtn.click();

    // HTML5 required validation should block — form stays open
    await expect(eventsPage.titleInput).toBeVisible();
  });

  test('edge case — past date is accepted without error', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm({ ...TEST_EVENT, title: 'Past Event Test', date: '2020-01-01' });
    await eventsPage.submitBtn.click();

    await expect(page.getByText('Past Event Test')).toBeVisible({ timeout: 8000 });
  });
});

test.describe('WF-ADM-04: Events — Edit', () => {
  test('happy path — edit an existing event', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const editBtns = eventsPage.getEditBtns();
    const count = await editBtns.count();
    if (count === 0) test.skip();

    await editBtns.first().click();

    const updatedTitle = 'Updated E2E Event';
    await eventsPage.titleInput.fill(updatedTitle);
    await eventsPage.submitBtn.click();

    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 8000 });
  });

  test('edge case — clicking edit pre-fills form with existing data', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const editBtns = eventsPage.getEditBtns();
    const count = await editBtns.count();
    if (count === 0) test.skip();

    await editBtns.first().click();

    // Title should be pre-filled (not empty)
    const titleValue = await eventsPage.titleInput.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);
  });

  test('edge case — clicking edit on second event resets form to that event', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const editBtns = eventsPage.getEditBtns();
    const count = await editBtns.count();
    if (count < 2) test.skip();

    await editBtns.first().click();
    const firstTitle = await eventsPage.titleInput.inputValue();

    await editBtns.nth(1).click();
    const secondTitle = await eventsPage.titleInput.inputValue();

    expect(firstTitle).not.toBe(secondTitle);
  });
});

test.describe('WF-ADM-05: Events — Delete', () => {
  test('happy path — delete event shows confirmation modal then removes from list', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    // Create an event to delete
    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm({ ...TEST_EVENT, title: 'Event To Delete' });
    await eventsPage.submitBtn.click();
    await expect(page.getByText('Event To Delete')).toBeVisible({ timeout: 8000 });

    const deleteBtns = eventsPage.getDeleteBtns();
    const count = await deleteBtns.count();
    if (count === 0) test.skip();

    // Click delete on the newly created event
    const targetRow = page.locator('li, tr, article').filter({ hasText: 'Event To Delete' });
    await targetRow.getByRole('button', { name: /delete/i }).click();

    // Confirmation modal should appear
    await expect(eventsPage.confirmDeleteBtn).toBeVisible();
    await eventsPage.confirmDeleteBtn.click();

    await expect(page.getByText('Event To Delete')).not.toBeVisible({ timeout: 8000 });
  });

  test('edge case — cancel in delete modal keeps event in list', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const deleteBtns = eventsPage.getDeleteBtns();
    const count = await deleteBtns.count();
    if (count === 0) test.skip();

    const itemsBefore = await eventsPage.getEventListItems().count();
    await deleteBtns.first().click();
    await eventsPage.cancelDeleteBtn.click();

    const itemsAfter = await eventsPage.getEventListItems().count();
    expect(itemsAfter).toBe(itemsBefore);
  });
});
