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

    await expect(page.getByText(TEST_EVENT.title).first()).toBeVisible({ timeout: 8000 });
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

    await expect(page.getByText('Past Event Test').first()).toBeVisible({ timeout: 8000 });
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

    const updatedTitle = `Updated E2E Event ${Date.now()}`;
    await eventsPage.titleInput.fill(updatedTitle);
    await eventsPage.submitBtn.click();

    await expect(page.getByText(updatedTitle).first()).toBeVisible({ timeout: 8000 });
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
    const ts = Date.now();
    const titleA = `Edit Test A ${ts}`;
    const titleB = `Edit Test B ${ts}`;

    // Create two events with known different titles so the test is self-contained
    for (const title of [titleA, titleB]) {
      await eventsPage.goto();
      await eventsPage.newEventBtn.click();
      await eventsPage.fillEventForm({ ...TEST_EVENT, title });
      await eventsPage.submitBtn.click();
      await page.getByText(title).first().waitFor({ state: 'visible', timeout: 8000 });
    }

    await eventsPage.goto();

    const rowA = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: titleA }) })
      .filter({ has: page.getByRole('button', { name: /edit/i }) })
      .last();
    await rowA.getByRole('button', { name: /edit/i }).click();
    const firstTitle = await eventsPage.titleInput.inputValue();

    const rowB = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: titleB }) })
      .filter({ has: page.getByRole('button', { name: /edit/i }) })
      .last();
    await rowB.getByRole('button', { name: /edit/i }).click();
    const secondTitle = await eventsPage.titleInput.inputValue();

    expect(firstTitle).not.toBe(secondTitle);
  });
});

test.describe('WF-ADM-06: Events — RSVP', () => {
  test('happy path — create event with RSVP enabled and ticket URL', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const title = `RSVP+Ticket Event ${Date.now()}`;
    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm({
      ...TEST_EVENT,
      title,
      rsvpEnabled: true,
      ticketUrl: 'https://example.com/tickets',
    });
    await eventsPage.submitBtn.click();

    await expect(page.getByText(title).first()).toBeVisible({ timeout: 8000 });

    // Edit to verify fields were saved
    const targetRow = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: title }) })
      .filter({ has: page.getByRole('button', { name: /edit/i }) })
      .last();
    await targetRow.getByRole('button', { name: /edit/i }).click();

    await expect(eventsPage.rsvpCheckbox).toBeChecked();
    await expect(eventsPage.ticketUrlInput).toHaveValue('https://example.com/tickets');
  });

  test('happy path — admin can view RSVP list for event', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    // Find an event with RSVP enabled (RSVPs button visible)
    const rsvpBtns = eventsPage.getRsvpBtns();
    const count = await rsvpBtns.count();
    if (count === 0) test.skip();

    await rsvpBtns.first().click();

    // Modal should appear, then loading resolves to either table or empty state
    await expect(page.getByTestId('close-rsvp-modal-btn')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole('table').or(page.getByTestId('rsvp-list-empty'))
    ).toBeVisible({ timeout: 8000 });

    await page.getByTestId('close-rsvp-modal-btn').click();
    await expect(page.getByTestId('close-rsvp-modal-btn')).not.toBeVisible();
  });
});

test.describe('WF-ADM-05: Events — Delete', () => {
  test('happy path — delete event shows confirmation modal then removes from list', async ({ page }) => {
    const eventsPage = new AdminEventsPage(page);
    await eventsPage.goto();

    const toDelete = `Event To Delete ${Date.now()}`;

    // Create an event to delete
    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm({ ...TEST_EVENT, title: toDelete });
    await eventsPage.submitBtn.click();
    await expect(page.getByText(toDelete).first()).toBeVisible({ timeout: 8000 });

    // Click delete on the newly created event
    const targetRow = page.locator('div').filter({ has: page.getByRole('heading', { name: toDelete }) }).filter({ has: page.getByRole('button', { name: /delete/i }) }).last();
    await targetRow.getByRole('button', { name: /delete/i }).click();

    // Confirmation modal should appear
    await expect(eventsPage.confirmDeleteBtn).toBeVisible();
    await eventsPage.confirmDeleteBtn.click();

    await expect(page.getByText(toDelete)).not.toBeVisible({ timeout: 8000 });
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
