# Bug Fixes — Event RSVP Tests

Failures identified from the Playwright HTML report run on 2026-05-31.

## Status

| # | Bug | Status |
|---|-----|--------|
| 1 | RSVP public tests: "Event not found after creation" | ✅ Fixed |
| 2 | Admin RSVP modal: stuck on "Loading…" | ✅ Fixed |
| 3 | "Edit second event" test: identical titles | ✅ Fixed |

---

## Bug 1 — All 4 public RSVP tests fail: "Event not found after creation" ✅ Fixed

**Tests:** `WF-PUB-RSVP` (all 4)  
**File:** `e2etest/tests/public/rsvp.spec.ts:32`  
**Error:** `Error: Event "RSVP Test Event 1780252017036" not found after creation`

### Root cause

`createEventAndGetUrl` calls `waitForLoadState('networkidle')` after clicking Submit, then immediately queries `GET /api/events`. The networkidle event fires once pending requests drop to zero, but in React the form submit handler calls `fetchEvents()` as a **fire-and-forget** (not awaited). There is a window where networkidle can resolve _before_ the re-fetch from `fetchEvents()` completes — meaning the admin context's page sees idle state between the POST response and the GET triggered by `fetchEvents()`. The subsequent `GET /api/events` call in the test helper then runs before the new event is visible.

Additionally the events created in this run (`1780252017...` timestamps) are entirely absent from the database snapshot seen in the WF-ADM-06 error report, which confirms events are not making it through at all in the `browser.newContext()` auth flow.

### Fix — `e2etest/tests/public/rsvp.spec.ts`

Replace the `waitForLoadState('networkidle')` synchronisation with a positive assertion that the new event appears in the admin list. This proves the event was created before we query the API for its ID.

```ts
// BEFORE
await adminPage.submitBtn.click();
await adminPage.page.waitForLoadState('networkidle');

// AFTER
await adminPage.submitBtn.click();
// Wait until the event appears in the admin list — confirms creation succeeded
await adminPage.page.getByText(data.title).first().waitFor({ state: 'visible', timeout: 10000 });
```

Also add an error guard on the API response so failures surface a useful message:

```ts
const res = await adminPage.page.request.get('/api/events');
if (!res.ok()) {
  throw new Error(`GET /api/events returned ${res.status()} — admin session may have expired`);
}
const events: { id: string; title: string }[] = await res.json();
```

---

## Bug 2 — Admin RSVP list modal: "Loading..." never resolves in test ✅ Fixed

**Test:** `WF-ADM-06: Events — RSVP > happy path — admin can view RSVP list for event`  
**File:** `e2etest/tests/admin/events.spec.ts:151`  
**Error:** `expect(received).toBeTruthy()` — `hasRsvps || hasEmpty` is `false`

### Root cause

The test checks `hasRsvps` and `hasEmpty` using point-in-time `.isVisible()` calls immediately after the modal's close button becomes visible. At that instant `rsvpLoading` is still `true` so the modal shows "Loading…" — neither the table nor the "No RSVPs yet." paragraph is rendered yet. Both `.isVisible()` calls return `false` and the assertion fails.

The page snapshot confirms this: `paragraph [ref=e32]: Loading...` is the only child of the modal at the time of failure.

### Fix A — Test: wait for loading to finish before asserting

```ts
// BEFORE
await expect(page.getByTestId('close-rsvp-modal-btn')).toBeVisible({ timeout: 5000 });
const hasRsvps = await page.getByRole('table').isVisible().catch(() => false);
const hasEmpty = await page.getByText(/no rsvps yet/i).isVisible().catch(() => false);
expect(hasRsvps || hasEmpty).toBeTruthy();

// AFTER
await expect(page.getByTestId('close-rsvp-modal-btn')).toBeVisible({ timeout: 5000 });
// Wait for loading to finish — either content or empty state must appear
await expect(
  page.getByRole('table').or(page.getByTestId('rsvp-list-empty'))
).toBeVisible({ timeout: 8000 });
```

### Fix B — App: add `data-testid` to the loading and empty states

This makes the test locator unambiguous and removes reliance on visible text strings.

In `src/app/admin/events/page.tsx`, update the RSVP modal body:

```tsx
// BEFORE
{rsvpLoading ? (
  <p className="text-gray-500 text-center py-4">Loading...</p>
) : rsvpList.length === 0 ? (
  <p className="text-gray-500 text-center py-4">No RSVPs yet.</p>
) : (

// AFTER
{rsvpLoading ? (
  <p data-testid="rsvp-list-loading" className="text-gray-500 text-center py-4">Loading...</p>
) : rsvpList.length === 0 ? (
  <p data-testid="rsvp-list-empty" className="text-gray-500 text-center py-4">No RSVPs yet.</p>
) : (
```

---

## Bug 3 — "Clicking edit on second event resets form" test fails with identical titles ✅ Fixed

**Test:** `WF-ADM-04: Events — Edit > edge case — clicking edit on second event resets form to that event`  
**File:** `e2etest/tests/admin/events.spec.ts:104`  
**Error:** `expect(received).not.toBe(expected) — Expected: not "Updated E2E Event"`

### Root cause

The `WF-ADM-04 happy path` test edits the first event and renames it to the hardcoded string `"Updated E2E Event"`. After many test runs this string has accumulated in the database: the page snapshot shows 5+ consecutive events all titled `"Updated E2E Event"`. When the second test clicks `editBtns.first()` and `editBtns.nth(1)`, both pre-fill with `"Updated E2E Event"` so `firstTitle === secondTitle` and the assertion fails.

### Fix — `e2etest/tests/admin/events.spec.ts`

Use a unique timestamp-based title in the edit test instead of a hardcoded string. This prevents the test from polluting shared data with an identical title every run.

```ts
// BEFORE
const updatedTitle = 'Updated E2E Event';
await eventsPage.titleInput.fill(updatedTitle);

// AFTER
const updatedTitle = `Updated E2E Event ${Date.now()}`;
await eventsPage.titleInput.fill(updatedTitle);
```

The second test (`clicking edit on second event resets form`) depends on at least two events with **different** titles existing. After the fix above the database will not accumulate identical titles, but the test is still fragile if run in isolation against a clean database containing only one event. A more robust version creates two known events at the start:

```ts
test('edge case — clicking edit on second event resets form to that event', async ({ page }) => {
  const eventsPage = new AdminEventsPage(page);
  const ts = Date.now();
  const titleA = `Edit Test A ${ts}`;
  const titleB = `Edit Test B ${ts}`;

  // Create two events with known different titles
  for (const title of [titleA, titleB]) {
    await eventsPage.goto();
    await eventsPage.newEventBtn.click();
    await eventsPage.fillEventForm({ ...TEST_EVENT, title });
    await eventsPage.submitBtn.click();
    await page.getByText(title).first().waitFor({ state: 'visible', timeout: 8000 });
  }

  await eventsPage.goto();
  const editBtns = eventsPage.getEditBtns();

  // Click edit on the first of our two known events
  const rowA = page.locator('div').filter({ has: page.getByRole('heading', { name: titleA }) }).last();
  await rowA.getByRole('button', { name: /edit/i }).click();
  const firstTitle = await eventsPage.titleInput.inputValue();

  const rowB = page.locator('div').filter({ has: page.getByRole('heading', { name: titleB }) }).last();
  await rowB.getByRole('button', { name: /edit/i }).click();
  const secondTitle = await eventsPage.titleInput.inputValue();

  expect(firstTitle).not.toBe(secondTitle);
});
```

---

## Summary of changes required

| # | File | Change type |
|---|------|-------------|
| 1 | `e2etest/tests/public/rsvp.spec.ts` | Replace `waitForLoadState('networkidle')` with positive title assertion; add `res.ok()` guard |
| 2 | `e2etest/tests/admin/events.spec.ts` | Wait for `rsvp-list-empty` testid instead of point-in-time `.isVisible()` |
| 2 | `src/app/admin/events/page.tsx` | Add `data-testid` to loading and empty state paragraphs in RSVP modal |
| 3 | `e2etest/tests/admin/events.spec.ts` | Use unique timestamp title in edit test; rewrite second-event test to create its own events |
