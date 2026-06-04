# Bug Report v2 — Kanaka PAC E2E Test Run

**Date:** 2026-05-30  
**Environment:** https://kanakapac.vercel.app (production)  
**Browser:** Chromium (Desktop), Pixel 5 (Mobile)  
**Total Failing Tests:** 10 across 5 distinct bugs

---

## Summary

All failures in this run trace back to one root cause: **local code fixes have not been deployed to Vercel**. The test suite targets production (`https://kanakapac.vercel.app`) by default, but the fixes from BUG-04 through BUG-08 (Navigation, FloatingPromo, contact page, minutes page) exist only on the local `bugfix` branch. Until the branch is merged and deployed, every test that exercises those features will fail against production.

One additional failure (BUG-V2-05) is a genuine test design issue unrelated to deployment.

---

## BUG-V2-01 — Navigation: `aria-label` Not Present on Deployed `<nav>`

**Affects:** All nav tests — desktop and mobile  
**Severity:** High  
**Failed tests:** WF-PUB-11 (2 tests), WF-PUB-12 (2 tests)

### Error

```
Error: expect(locator).toBeVisible() failed
Locator: locator('nav[aria-label="Main navigation"]').getByRole('link', { name: /^Home$/i })
Error: element(s) not found
```

### What Happened

`NavigationPage.getNavLink()` scopes all link lookups to `nav[aria-label="Main navigation"]`. The fix that adds this `aria-label` to `Navigation.tsx` exists locally but has not been deployed. The production `<nav>` element has no `aria-label`, so the scoped locator finds zero elements and every link assertion fails.

The page snapshot confirms the links **are** in the DOM — they are children of a `navigation` landmark that has no accessible name:

```yaml
- navigation:          # ← no aria-label on this element
  - link "Home": ...
  - link "Events": ...
```

### Why It Matters

Without `aria-label`, the `<nav>` has no accessible name, which is a WCAG 2.4.1 violation. Screen readers cannot distinguish the main navigation from other nav regions on the page.

### Fix

Deploy the `bugfix` branch to Vercel. No code change is needed — the fix already exists in `src/components/Navigation.tsx`.

**Affected tests:**
- `WF-PUB-11: happy path — all nav links visible on desktop`
- `WF-PUB-11: happy path — nav links navigate to correct URLs`
- `WF-PUB-12: happy path — hamburger tap opens mobile menu with all links`
- `WF-PUB-12: happy path — tapping a nav link closes the menu`

---

## BUG-V2-02 — FloatingPromo: `data-testid="promo-tooltip"` Not on Deployed Component

**Affects:** `/` — FloatingPromo tooltip tests  
**Severity:** Medium  
**Failed tests:** WF-PUB-13 (3 tests)

### Error

```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('promo-tooltip')
Error: element(s) not found
```

### What Happened

The test locates the tooltip via `page.getByTestId('promo-tooltip')`. The fix that adds `data-testid="promo-tooltip"` to the tooltip `<div>` in `FloatingPromo.tsx` exists locally but has not been deployed.

The page snapshot confirms the tooltip content **does** render after clicking the button — the paragraphs and consultation link are visible:

```yaml
- paragraph: ✨ Built by Vector Local
- paragraph: Need a stunning website for your organization? Let's talk!
- link "Book a Free Consultation":
  - /url: https://www.vectorlocal.ca
```

The tooltip renders correctly; it just has no `data-testid` attribute in production, so the locator cannot find it.

### Fix

Deploy the `bugfix` branch. The fix is already in `src/components/FloatingPromo.tsx`.

**Affected tests:**
- `WF-PUB-13: happy path — clicking promo button toggles tooltip`
- `WF-PUB-13: happy path — tooltip has consultation link opening in new tab`
- `WF-PUB-13: edge case — clicking outside tooltip does NOT close it`

---

## BUG-V2-03 — Contact Page: Email Still Rendered as Plain Text in Production

**Affects:** `/contact`  
**Severity:** Medium  
**Failed tests:** WF-PUB-08 (2 tests)

### Error

```
Error: expect(locator).toBeVisible() failed
Locator: locator('a[href^="mailto:"]').first()
Error: element(s) not found
```

### What Happened

The test expects a `<a href="mailto:...">` link for the PAC email address. The fix that wraps the email in a `mailto:` anchor exists locally but has not been deployed. In production, the email is still rendered as a plain `<p>` tag.

The page snapshot confirms the email is on the page but not as a link:

```yaml
- paragraph: Email
- paragraph: kcpacpresident@gmail.com    # ← plain text, not a link
```

### Fix

Deploy the `bugfix` branch. The fix is already in `src/app/contact/page.tsx` and `src/components/ContactForm.tsx`.

> **Note:** `ContactForm.tsx` is a new file added during the BUG-07 fix. It must be explicitly staged with `git add src/components/ContactForm.tsx` before committing — it was showing as untracked in git status, which previously caused a Vercel build failure (`Module not found: Can't resolve '@/components/ContactForm'`). Confirm this file is included in the commit before deploying.

**Affected tests:**
- `WF-PUB-08: happy path — contact info section present`
- `WF-PUB-08: happy path — email link opens mail client`

---

## BUG-V2-04 — Minutes Page: Subscribe Form and Card Locator Missing in Production

**Affects:** `/minutes`  
**Severity:** Medium  
**Failed tests:** WF-PUB-04 (2 tests)

### Error (subscribe form)

```
Error: expect(locator).toBeVisible() failed
Locator: locator('form').filter({ has: getByRole('button', { name: /subscribe/i }) })
Error: element(s) not found
```

### Error (empty state check)

```
Error: expect(received).toBeTruthy()
Received: false
```

### What Happened

**Subscribe form:** The fix that adds `<SubscribeForm />` to `src/app/minutes/page.tsx` exists locally but has not been deployed. The production `/minutes` page has no subscribe form. The page snapshot confirms: the main section contains only the minutes list and footer — no subscribe form.

**Empty state check:** The test checks `hasCards || hasEmptyState`. The `getMinutesCards()` locator searches for `[data-testid="minutes-card"]`, but the fix that adds this attribute to `MinutesCard.tsx` has not been deployed either. So `hasCards` is always `false`. With actual minutes in the DB, `hasEmptyState` is also `false`. Both sides of the OR are false → assertion fails.

### Fix

Deploy the `bugfix` branch. Both fixes are already in:
- `src/app/minutes/page.tsx` (subscribe form)
- `src/components/MinutesCard.tsx` (`data-testid="minutes-card"`)

**Affected tests:**
- `WF-PUB-04: happy path — subscribe form present`
- `WF-PUB-04: edge case — empty state when no minutes`

---

## BUG-V2-05 — Subscribe Form: Duplicate Email Test Fails After Success State

**Affects:** `/` — subscribe form  
**Severity:** Low  
**Failed tests:** WF-PUB-09 (1 test)

### Error

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]').last()
```

### What Happened

This failure is a **test design issue**, not a deployment problem.

The test subscribes with `duplicate@example.com`, waits for the success message, then tries to fill the email input a second time. However, after a successful subscribe, `SubscribeForm` transitions to a success state and **replaces the form with a success message** — removing the email `<input>` from the DOM entirely.

The page snapshot at the time of failure shows:

```yaml
- generic: You are now subscribed to updates!   # ← form has been replaced
```

The locator `input[type="email"]` no longer exists, so `fill()` times out.

### Root Cause

The test assumes the subscribe form resets after a successful submission. The actual component behaviour is to show a permanent success state. The assumption is wrong.

### Suggested Fix (test-side)

Reload the page between the two subscribe attempts, so the form is in its initial state for the second attempt:

```ts
test('edge case — duplicate email shows success (silently handled)', async ({ page }) => {
  // First subscribe
  await page.goto('/');
  await page.locator('input[type="email"]').last().fill('duplicate@example.com');
  await page.getByRole('button', { name: /subscribe/i }).last().click();
  await expect(page.getByText(/subscribed|success/i)).toBeVisible({ timeout: 8000 });

  // Reload to reset form state, then subscribe again
  await page.reload();
  await page.locator('input[type="email"]').last().fill('duplicate@example.com');
  await page.getByRole('button', { name: /subscribe/i }).last().click();
  await expect(page.getByText(/subscribed|success/i)).toBeVisible({ timeout: 8000 });
});
```

**File to change:** `e2etest/tests/public/subscribe.spec.ts` lines 81–98

---

## Action Plan

| Priority | Action | Owner |
|----------|--------|-------|
| **1 — Immediate** | Deploy `bugfix` branch to Vercel (merge PR into `claude/pac-website-setup-rrA6W`) | Dev |
| **2 — Before merge** | Confirm `ContactForm.tsx` is staged: `git add src/components/ContactForm.tsx` | Dev |
| **3 — After deploy** | Run `PLAYWRIGHT_BASE_URL=https://kanakapac.vercel.app npx playwright test --project=chromium` and verify BUG-V2-01 through BUG-V2-04 resolve | Dev |
| **4 — Low priority** | Fix duplicate-email test in `subscribe.spec.ts` (page reload between attempts) | Dev |

---

## Expected Pass Rate After Deployment

| Category | Current | After Deploy |
|----------|---------|--------------|
| Navigation (WF-PUB-11, 12) | Failing | Passing |
| FloatingPromo (WF-PUB-13) | Failing | Passing |
| Contact page (WF-PUB-08) | Failing | Passing |
| Minutes subscribe/cards (WF-PUB-04) | Failing | Passing |
| Duplicate email (WF-PUB-09) | Failing | Failing (test-side fix needed) |

Deploying the branch should recover 9 of the 10 failing tests. Only the duplicate-email test requires a separate code change.