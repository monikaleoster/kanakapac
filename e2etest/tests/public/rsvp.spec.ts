import { test, expect } from '@playwright/test';
import { RsvpPage } from '../pages/RsvpPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';

const TICKET_URL = 'https://example.com/tickets';
const RSVP_EVENT_TITLE = `RSVP Test Event ${Date.now()}`;
const TICKET_EVENT_TITLE = `Ticket Test Event ${Date.now()}`;

// Helper: create an event via the admin UI and return the event detail URL.
async function createEventAndGetUrl(
  adminPage: AdminEventsPage,
  data: { title: string; rsvpEnabled?: boolean; ticketUrl?: string }
): Promise<string> {
  await adminPage.goto();
  await adminPage.newEventBtn.click();
  await adminPage.fillEventForm({
    title: data.title,
    date: '2027-09-01',
    time: '10:00',
    location: 'Test Hall',
    description: 'Created by RSVP E2E test',
    rsvpEnabled: data.rsvpEnabled,
    ticketUrl: data.ticketUrl,
  });
  await adminPage.submitBtn.click();
  // Wait for the event to appear in the admin list — confirms creation succeeded
  await adminPage.page.getByText(data.title).first().waitFor({ state: 'visible', timeout: 10000 });

  // Find the event via the public events API to get its ID
  const res = await adminPage.page.request.get('/api/events');
  if (!res.ok()) {
    throw new Error(`GET /api/events returned ${res.status()} — admin session may have expired`);
  }
  const events: { id: string; title: string }[] = await res.json();
  const event = events.find((e) => e.title === data.title);
  if (!event) throw new Error(`Event "${data.title}" not found after creation`);
  return `/events/${event.id}`;
}

test.describe('WF-PUB-RSVP: Event RSVP', () => {
  test('happy path — RSVP modal submits and shows success', async ({ page, browser }) => {
    // Create the event via admin (needs auth)
    const adminContext = await browser.newContext({ storageState: 'tests/.auth/admin.json' });
    const adminPage = new AdminEventsPage(adminContext.newPage ? await adminContext.newPage() : page);
    const eventUrl = await createEventAndGetUrl(adminPage, {
      title: RSVP_EVENT_TITLE,
      rsvpEnabled: true,
    });
    await adminContext.close();

    // Visit as a public user
    await page.goto(eventUrl);
    const rsvpPage = new RsvpPage(page);

    await expect(rsvpPage.goingBtn).toBeVisible();
    await rsvpPage.fillAndSubmit('Test Parent', `rsvp-happy-${Date.now()}@example.com`);
    await expect(rsvpPage.successMsg).toBeVisible({ timeout: 8000 });
  });

  test('edge case — duplicate email shows already-registered message', async ({ page, browser }) => {
    const email = `dup-${Date.now()}@example.com`;

    const adminContext = await browser.newContext({ storageState: 'tests/.auth/admin.json' });
    const adminPage = new AdminEventsPage(adminContext.newPage ? await adminContext.newPage() : page);
    const eventUrl = await createEventAndGetUrl(adminPage, {
      title: `Dup RSVP Test ${Date.now()}`,
      rsvpEnabled: true,
    });
    await adminContext.close();

    // First RSVP
    await page.goto(eventUrl);
    const rsvpPage = new RsvpPage(page);
    await rsvpPage.fillAndSubmit('Test Parent', email);
    await expect(rsvpPage.successMsg).toBeVisible({ timeout: 8000 });

    // Second RSVP with same email — reload page and try again
    await page.reload();
    await rsvpPage.fillAndSubmit('Test Parent', email);
    await expect(rsvpPage.duplicateMsg).toBeVisible({ timeout: 8000 });
  });

  test('happy path — ticket URL button present and has correct href', async ({ page, browser }) => {
    const adminContext = await browser.newContext({ storageState: 'tests/.auth/admin.json' });
    const adminPage = new AdminEventsPage(adminContext.newPage ? await adminContext.newPage() : page);
    const eventUrl = await createEventAndGetUrl(adminPage, {
      title: TICKET_EVENT_TITLE,
      ticketUrl: TICKET_URL,
    });
    await adminContext.close();

    await page.goto(eventUrl);
    const ticketBtn = page.getByRole('link', { name: /buy tickets/i });
    await expect(ticketBtn).toBeVisible();
    await expect(ticketBtn).toHaveAttribute('href', TICKET_URL);
    await expect(ticketBtn).toHaveAttribute('target', '_blank');
  });

  test('edge case — Going button not shown when rsvpEnabled is false', async ({ page, browser }) => {
    const adminContext = await browser.newContext({ storageState: 'tests/.auth/admin.json' });
    const adminPage = new AdminEventsPage(adminContext.newPage ? await adminContext.newPage() : page);
    const eventUrl = await createEventAndGetUrl(adminPage, {
      title: `No RSVP Event ${Date.now()}`,
    });
    await adminContext.close();

    await page.goto(eventUrl);
    await expect(page.getByRole('button', { name: /going/i })).not.toBeVisible();
  });
});
