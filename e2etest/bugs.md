# Bug Report — Kanaka PAC E2E Test Run (2026-05-15)

**Environment:** https://kanakapac.vercel.app  
**Browser:** Chromium (Desktop), Pixel 5 (Mobile)  
**Total Failures:** 55 tests across 8 distinct bugs

---

## BUG-01 — Admin Create Forms: Title Input Never Appears

**Affects:** Announcements (`/admin/announcements`), Events (`/admin/events`), Minutes (`/admin/minutes`), Team (`/admin/team`)  
**Severity:** Critical — blocks all admin write operations  
**Failed tests:** WF-ADM-03, WF-ADM-06, WF-ADM-09, WF-ADM-10 (partial), WF-ADM-11, WF-ADM-15, WF-ADM-17  
**Cascading skips:** 13 Edit/Delete tests that depend on Create working first

### Steps to Reproduce
1. Log in to admin at `/admin` with password `pac-admin-2026`
2. Navigate to `/admin/announcements` (or `/admin/events`, `/admin/minutes`, `/admin/team`)
3. Click the **"+ New Announcement"** (or equivalent) button
4. Observe the page after clicking

### Actual Outcome
The create form does not render a visible, accessible title input after clicking the new record button. The page either:
- does not open the form at all
- renders a form where inputs are not associated with a `<label>` containing "Title"

Test times out after 30s waiting for `getByLabel(/title/i)`.

### Expected Outcome
Clicking the "New" button should open a form (inline, modal, or panel) containing a labeled **Title** input field immediately ready to accept text.

### Assessment
**Root cause:** Every admin form across `announcements`, `events`, `minutes`, and `team` uses `<label>` as a visual sibling to `<input>` inside a `<div>`, but never sets `htmlFor` on the label or `id` on the input. Playwright's `getByLabel()` resolves inputs via the ARIA accessibility tree, which requires either an explicit `htmlFor`/`id` pairing or a wrapping `<label>`. Neither pattern is used, so the association does not exist in the accessibility tree and `getByLabel(/title/i)` never resolves.

**Impacted components:** `src/app/admin/announcements/page.tsx`, `src/app/admin/events/page.tsx`, `src/app/admin/minutes/page.tsx`, `src/app/admin/team/page.tsx` — all form `<label>` + `<input>` pairs.

**Secondary issue:** Delete confirmation uses the native `confirm()` browser dialog rather than a custom modal. Playwright auto-dismisses `confirm()` returning `true`, so cancel-delete tests that expect a `cancelDeleteBtn` UI element will also fail.

**Proposed fix:** Add matching `htmlFor`/`id` to every label/input pair in all four admin pages. For delete flows, replace `confirm()` with a proper inline confirmation modal and use dedicated `data-testid` attributes on confirm/cancel buttons.

```tsx
// Before
<label className="...">Title</label>
<input type="text" ... />

// After
<label htmlFor="ann-title" className="...">Title</label>
<input id="ann-title" type="text" ... />
```

### Final Proposal
**Classification:** Genuine code defect (accessibility) + test infrastructure failure (cascading).

**Critical correction to assessment:** The assessment overgeneralises the delete modal issue. `events/page.tsx` already has a proper custom confirmation modal with Cancel/Confirm buttons. The `confirm()` dialog is only in `announcements`, `minutes`, and `team`. This distinction matters for prioritisation — events delete tests could pass once the `htmlFor`/`id` fix is in place, since the modal already exists.

**Recommended action: fix production code.**

The missing `htmlFor`/`id` pairing is a genuine WCAG 2.1 SC 1.3.1 accessibility violation — screen readers cannot identify form fields, making the admin panel inaccessible. This must be fixed regardless of test outcomes.

**Implementation guidance:**
- Apply `htmlFor`/`id` to all label/input pairs in `announcements`, `events`, `minutes`, `team`, and `settings` pages in one batch PR. Use namespaced IDs (e.g., `event-title`, `ann-title`) rather than bare `title` to avoid conflicts if forms are ever co-rendered.
- For `announcements`, `minutes`, and `team`: replace `confirm()` with inline modals matching the pattern already implemented in `events/page.tsx`. Use `data-testid="confirm-delete-btn"` and `data-testid="cancel-delete-btn"` on those buttons.
- Do **not** change the test page objects — once the code is fixed, `getByLabel()` will resolve correctly.

**Additional bug found in `team/page.tsx`:** The `handleMove` API calls (lines 104–105, 115–116) are missing `headers: { "Content-Type": "application/json" }`. The server will not parse the JSON body, causing reorder to silently fail. Fix alongside the `htmlFor`/`id` changes.

**Testing recommendation:** After fixing, the 26 timed-out tests and 13 cascading skips should recover. Run the full suite and verify delete cancel flows specifically.

---

## BUG-02 — Settings Page: "School Name" Field Not Found

**Affects:** `/admin/settings`  
**Severity:** High  
**Failed tests:** WF-ADM-23 (3 of 7 tests)

### Steps to Reproduce
1. Log in to admin
2. Navigate to `/admin/settings`
3. Look for a field labeled **"School Name"**

### Actual Outcome
No input with the label "School Name" is present on the page. The field is either absent, uses different label text, or the `<label>` element is not properly associated with its `<input>` (missing `htmlFor` / `id` pairing).

### Expected Outcome
The Settings page should display a labeled input field for **School Name** pre-filled with the current value, along with other school/PAC info fields (PAC Name, Email, Meeting Time).

### Assessment
**Root cause:** Identical to BUG-01 — all `<label>` elements in `src/app/admin/settings/page.tsx` are siblings to their inputs with no `htmlFor`/`id` association. `getByLabel(/school name/i)` cannot resolve.

**Secondary bug found:** The logo upload handler in `handleSubmit` reads `data.url` (line 47) but the `/api/upload` route returns `{ fileUrl: publicUrl }`. This key mismatch means `logoUrl` is always set to `undefined` — logo uploads silently fail to persist even when the API call succeeds.

**Impacted components:** `src/app/admin/settings/page.tsx` (all labels), `src/app/api/upload/route.ts` (response key `fileUrl` vs consumed as `url`).

**Proposed fix:** Add `htmlFor`/`id` pairs to all settings form fields. Fix the logo URL key mismatch:

```ts
// settings/page.tsx line 47 — change:
logoUrl = data.url;
// to:
logoUrl = data.fileUrl;
```

### Final Proposal
**Classification:** Genuine code defect (accessibility + data loss bug).

**Recommended action: fix production code on both issues.**

The `htmlFor`/`id` fix is the same batch work as BUG-01 — include settings in that PR.

The `data.url` → `data.fileUrl` key mismatch is a silent data-loss bug worse than the assessment implies. On every settings save that includes a new logo upload, the handler sets `logoUrl = data.url` which is `undefined`. The subsequent `POST /api/settings` then persists `logoUrl: undefined`, **actively clearing** any previously stored logo URL. This regression happens on every save even if logo upload "succeeds". Fix this immediately in the same PR.

**Architectural consideration:** The upload API (`/api/upload`) is shared across minutes, policies, and settings but returns a single response shape `{ fileUrl }`. There is no type contract enforced — a TypeScript interface for the upload response would have caught this at compile time.

**Recommended follow-up:** Define a typed response interface for `/api/upload` and share it between the API route and all consumers:

```ts
// lib/types.ts
export interface UploadResponse { fileUrl: string; }
```

Use it in `settings/page.tsx` as `const data: UploadResponse = await uploadRes.json()` to get a compile-time error if the key ever changes again.

---

## BUG-03 — File Upload Validation Not Enforced (Minutes + Policies)

**Affects:** `/admin/minutes` (create), `/admin/policies` (create)  
**Severity:** High — security/data integrity  
**Failed tests:** WF-ADM-06 edge case, WF-ADM-12 edge case

### Steps to Reproduce — Minutes

1. Log in to admin and navigate to `/admin/minutes`
2. Click the New Minutes button and open the create form
3. Upload a file with name `malware.exe` and MIME type `application/octet-stream`
4. Observe any error message

### Actual Outcome
No error or rejection message appears. The invalid file type is silently accepted by the upload handler (`/api/upload`).

### Expected Outcome
The API should return a 400 error for non-PDF/non-allowed file types, and the UI should display an error message such as "Invalid file type".

---

### Steps to Reproduce — Policies

1. Log in to admin and navigate to `/admin/policies`
2. Click New Policy and fill in the Title field
3. Upload a file with name `image.png` and MIME type `image/png` (invalid type for a policy document)
4. Observe the state of the **Save/Submit** button

### Actual Outcome
After the upload API returns a 400 (invalid file type), the Submit button is **enabled** — allowing the form to be submitted without a valid file URL.

### Expected Outcome
After a failed upload, the submit button should remain **disabled** since no valid `fileUrl` was set. The button should only enable after a successful file upload.

### Assessment
**Root cause — Minutes:** `handleFileChange` in `src/app/admin/minutes/page.tsx` (line 73–76) catches upload errors with `console.error()` and `alert()`. The browser `alert()` is auto-dismissed by Playwright and no in-page error state is rendered. After dismissal, the page shows no visible error text, so `page.getByText(/invalid|error|failed/i)` returns nothing.

**Root cause — Policies:** `handleFileChange` in `src/app/admin/policies/page.tsx` (line 66–73) has the same `alert()` pattern. The submit button's `disabled={!form.fileUrl}` logic is actually correct — when upload fails, `form.fileUrl` stays `""` and the button stays disabled. However, the `submitBtn` locator in `AdminPoliciesPage.ts` uses `/save|submit|create/i` which does not match the actual button label "Upload Policy" / "Update Policy", so the test asserts against the wrong element.

**Impacted components:** `src/app/admin/minutes/page.tsx:73`, `src/app/admin/policies/page.tsx:66`, `tests/pages/admin/AdminPoliciesPage.ts` (locator mismatch — test-side fix).

**Proposed fix:** Replace `alert()` with React state for error display in both pages:

```tsx
const [uploadError, setUploadError] = useState("");

// in catch block:
setUploadError("File upload failed. Invalid file type.");

// in JSX, below the file input:
{uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
```

Clear `uploadError` on successful upload. Also update the `submitBtn` locator in the page object to match "Upload Policy" / "Update Policy".

### Final Proposal
**Classification:** Mixed — UX code defect (error surfacing) + test locator mismatch + unaddressed business logic gap.

**Recommended action: fix both code and tests, and clarify requirements.**

The assessment correctly identifies the `alert()` anti-pattern but misses a deeper issue: **the `/api/upload` endpoint has no concept of upload context** — it allows `image/png` and `image/jpeg` for all upload types (minutes, policies, settings logo). Uploading a PNG as a policy document will succeed in production. The `image/png` type should only be valid for the settings logo upload, not for minutes PDFs or policy documents. This is an architectural gap, not just a UI feedback issue.

**Three separate fixes required:**

**Fix 1 — Code: replace `alert()` with in-page error state** in `admin/minutes/page.tsx` and `admin/policies/page.tsx`. See proposed fix in Assessment.

**Fix 2 — Architecture: add upload context to `/api/upload`** so file type validation is caller-aware:
```ts
// Accept an optional `context` query param: 'document' | 'image'
const context = url.searchParams.get('context') ?? 'document';
const validTypes = context === 'image'
  ? ['image/png', 'image/jpeg', 'image/jpg']
  : ['application/pdf', 'application/msword', '...'];
```
Pass `context=image` from settings, `context=document` from minutes/policies.

**Fix 3 — Test: update `AdminPoliciesPage.ts` `submitBtn` locator** to match actual button text `"Upload Policy"` / `"Update Policy"`:
```ts
this.submitBtn = page.getByRole('button', { name: /upload policy|update policy/i });
```

**Trade-off:** The context-based upload API adds complexity but closes a real security gap — an admin could accidentally (or intentionally) attach an executable to a policy document record if MIME type spoofing bypasses client-side `accept` attribute filtering. Worth the small complexity increase.

---

## BUG-04 — Navigation: Duplicate Link Elements Cause Strict Mode Failures

**Affects:** Desktop nav, mobile nav — all pages  
**Severity:** Medium  
**Failed tests:** WF-PUB-11 (3 tests), WF-PUB-12 (2 tests)

### Steps to Reproduce
1. Open any page (e.g., `/`) in a desktop-width browser (1280×800)
2. Open browser DevTools
3. Run `document.querySelectorAll('a[href="/events"]')` in the console
4. Count the results

### Actual Outcome
The query returns **4 elements** — both the desktop nav link and the mobile nav link for "Events" are present in the DOM simultaneously, even at desktop width. The mobile nav links are visually hidden via CSS but remain in the accessibility tree, so Playwright's `getByRole('link', { name: /Events/i })` resolves to multiple matches and throws a strict mode violation error.

Same issue applies to all nav links (Minutes, About, Policies, Contact, Announcements, Admin).

### Expected Outcome
At desktop width, the mobile nav links should either be removed from the DOM entirely or marked with `aria-hidden="true"` so that accessibility queries and `getByRole` resolve to exactly one visible element per link name.

### Assessment
**Root cause:** `NavigationPage.getNavLink(name)` builds `page.getByRole('link', { name: new RegExp(name, 'i') })` — a substring match on the accessible name. On `/`, the homepage contains multiple links whose text includes "events": the desktop nav's `"Events"`, the hero CTA `"View Upcoming Events"`, and the section footer `"View All Events →"`. All three match `/events/i`, triggering a strict mode violation when any test calls `.click()` or a visibility assertion on the unscoped locator.

The mobile nav in `src/components/Navigation.tsx` is conditionally rendered (`{mobileOpen && ...}`) so it is not in the DOM by default. The duplicate matches come entirely from page content links on the homepage, not from dual nav rendering.

**Impacted components:** `src/components/Navigation.tsx` (no `aria-label` on the `<nav>`), `tests/pages/NavigationPage.ts:27` (`getNavLink` selector is too broad).

**Proposed fix — app side:** Add `aria-label="Main navigation"` to the `<nav>` element so tests can scope to it:

```tsx
// Navigation.tsx
<nav aria-label="Main navigation">
```

**Proposed fix — test side:** Scope the locator to the nav element:

```ts
getNavLink(name: string) {
  return this.page.locator('nav[aria-label="Main navigation"]')
    .getByRole('link', { name: new RegExp(`^${name}$`, 'i') });
}
```

### Final Proposal
**Classification:** Primarily a test fixture defect; minor accessibility gap in production code.

**Critical correction to assessment:** The assessment states "4 elements" in the original Actual Outcome section. Code review shows the mobile nav is conditionally rendered and would only add a 4th element if `mobileOpen` is true — which it isn't by default. The actual duplicate count on the homepage is 3: desktop nav "Events", hero CTA "View Upcoming Events", section link "View All Events →". The "4 elements" likely includes a link I did not identify, or reflects test infrastructure reporting both projects (chromium + mobile-chrome) in the same error output. Either way, the fix direction is the same.

**Recommended action: fix both code (one line) and test (one method).**

Both changes are trivial and should be done together.

**App-side fix:** Add `aria-label="Main navigation"` to the `<nav>` in `Navigation.tsx`. This is independently valuable — it correctly exposes the nav landmark to assistive technologies and is required for WCAG 2.4.1 (Bypass Blocks).

**Test-side fix:** Update `NavigationPage.getNavLink()` to scope within the labeled nav and use an exact match regex (`^Events$`), preventing substring collisions with page content links.

**Architectural note:** The test was authored to run from `/` which is the richest page for content link collisions. A better test strategy is to navigate to a content-sparse page (e.g., `/policies`) before exercising nav links, or use a `beforeEach` page that has no event/announcement content links. This reduces fragility without requiring code changes for future features that may add more "events"-containing links.

---

## BUG-05 — FloatingPromo Tooltip: Text Mismatch / Multiple Matches

**Affects:** All public pages  
**Severity:** Medium  
**Failed tests:** WF-PUB-13 (8 tests across chromium + mobile-chrome)

### Steps to Reproduce
1. Open the homepage `/` at desktop width (1280×800)
2. Locate the floating button (fixed, bottom of screen)
3. Click the floating promo button
4. Observe the tooltip that appears

### Actual Outcome
The tooltip text does not match `/vector local|book a free/i`. Either:
- The text has changed to something else (e.g. the word "Vector Local" no longer appears)
- Multiple elements in the DOM match this pattern simultaneously (strict mode violation), possibly because the tooltip text appears in both a hidden and visible state

Clicking the button does not produce a uniquely visible tooltip matching the expected pattern.

### Expected Outcome
Clicking the floating promo button should toggle a tooltip containing the text **"Vector Local"** or **"Book a Free"** (consultation link). The tooltip should be a single element, uniquely identifiable, with:
- A visible link to vectorlocal.ca (or similar)
- `target="_blank"` on the consultation link
- Toggle off when the button is clicked a second time
- **Not** close when clicking elsewhere on the page

### Assessment
**Root cause:** `NavigationPage.floatingPromoTooltip` is `page.getByText(/vector local|book a free/i)`. When the tooltip is visible, three separate elements match this pattern simultaneously:
1. The `<p>` element: `"✨ Built by Vector Local"` → matches `/vector local/i`
2. The `<span>` inside it: `"Vector Local"` → also matches `/vector local/i`
3. The `<a>` link: `"Book a Free Consultation"` → matches `/book a free/i`

Playwright's `getByText` traverses all elements and finds all three, triggering a strict mode violation on `.toBeVisible()`.

The `FloatingPromo.tsx` component logic (toggle, conditional render, click-outside behavior) is correct. This is a locator specificity issue.

**Impacted components:** `src/components/FloatingPromo.tsx` (missing `data-testid`), `tests/pages/NavigationPage.ts:23` (locator too broad).

**Proposed fix:** Add `data-testid="promo-tooltip"` to the tooltip container in `FloatingPromo.tsx`:

```tsx
{showTooltip && (
  <div data-testid="promo-tooltip" className="mb-3 bg-white rounded-xl ...">
```

Update the page object locator:
```ts
this.floatingPromoTooltip = page.getByTestId('promo-tooltip');
```

### Final Proposal
**Classification:** Test fixture defect. The production component is correctly implemented.

**Recommended action: fix test only (page object locator) + add `data-testid` to the component.**

The `FloatingPromo` component behaviour — conditional render, toggle on click, no click-outside dismissal — is all correct and aligns with the test's expected behaviour. The only failure is the locator resolving to multiple elements.

Adding `data-testid="promo-tooltip"` to the tooltip container is the minimal, correct change. It adds no functional overhead and follows standard React/Next.js testing conventions. Alternative CSS-based selectors (e.g., `[class*="animate-fade-in"]`) are fragile because Tailwind class names can change during refactors.

**Unintended side effect to verify:** The test `WF-PUB-13 edge case — clicking outside tooltip does NOT close it` asserts the tooltip stays visible after clicking outside. This expectation is correct — there is no click-outside handler in the component. Confirm this test passes after the locator fix, since the behaviour is correct but was previously untestable due to the strict mode violation.

**Follow-up:** The `getConsultationLink()` method in `NavigationPage.ts` uses `getByRole('link', { name: /book a free consultation/i })`. After the tooltip is consistently findable via `data-testid`, verify this locator also works within the tooltip scope:
```ts
getConsultationLink() {
  return this.floatingPromoTooltip.getByRole('link', { name: /book a free consultation/i });
}
```
Scoping it to the tooltip container prevents future collisions if similar text appears elsewhere on the page.

---

## BUG-06 — Homepage Hero Heading Text Mismatch

**Affects:** `/` homepage  
**Severity:** Medium  
**Failed tests:** WF-PUB-01 (1 test)

### Steps to Reproduce
1. Navigate to `https://kanakapac.vercel.app/`
2. Look for an `<h1>` or `<h2>` heading in the hero section
3. Note the exact text

### Actual Outcome
No heading element with the text matching `/welcome to kanaka pac/i` is found on the page. The hero heading either:
- Uses different text (e.g., "Kanaka PAC" without "Welcome to")
- Is not a semantic heading element (`<h1>`/`<h2>`) — possibly a `<p>` or `<div>`

### Expected Outcome
The homepage hero section should contain a semantic heading (h1 or h2) with text **"Welcome to Kanaka PAC"** (case-insensitive match). The page should also have visible CTA links: "View Upcoming Events" (→ `/events`) and "Learn About PAC" (→ `/about`).

### Assessment
**Root cause:** The `<h1>` in `src/app/page.tsx:23` renders `Welcome to {settings.pacName}` where `settings.pacName` is read dynamically from Supabase via `getSchoolSettings()`. The `defaultSettings.pacName` is `"Kanaka PAC"` (`src/lib/types.ts:64`), which would match `/welcome to kanaka pac/i`. However, if a different value has been saved to Supabase (e.g., `"Kanaka Creek Elementary PAC"` or an empty string), the heading no longer matches the test expectation.

The CTA links `"View Upcoming Events"` and `"Learn About PAC"` are hardcoded strings and should always pass — the heading is the only failure point.

**Impacted components:** `src/app/page.tsx:23–25`, Supabase `settings` table `pacName` field.

**Proposed fix (two options):**
1. Ensure the Supabase `settings` row has `pacName = "Kanaka PAC"` to match the test and the school's expected branding.
2. Make the test more resilient by asserting the heading starts with "Welcome to" without hardcoding the PAC name: `getByRole('heading', { name: /^welcome to/i })`.

Option 1 is preferred since it validates real production content. Option 2 is a fallback if the PAC name is expected to change.

### Final Proposal
**Classification:** Environment/data management issue masquerading as a code defect. The code is correct; the test is brittle by design.

**Recommended action: update the test — do not change production code or Supabase data to satisfy a test.**

The heading `Welcome to {settings.pacName}` is the correct implementation — it renders dynamically from the settings table, which is the intended design. Hardcoding the heading to "Welcome to Kanaka PAC" to match the test would regress the settings feature. Updating the Supabase row to match the test expectation is operationally fragile — any future settings change by an admin would re-break the test.

**Root architectural issue:** This E2E suite runs against the live production Vercel deployment with a real Supabase database. Asserting on dynamic user-managed content (pac name, email, logo) in production E2E tests is inherently brittle. Tests should assert on **structure and behaviour**, not **content** that an admin can change at any time.

**Recommended test fix:**
```ts
// HomePage.ts — replace:
this.heading = page.getByRole('heading', { name: /welcome to kanaka pac/i });
// with:
this.heading = page.getByRole('heading', { level: 1 });
// and in the test:
await expect(home.heading).toBeVisible();
await expect(home.heading).toContainText(/welcome to/i);
```
This validates the heading exists, is an `h1`, and starts with "Welcome to" without asserting the specific PAC name.

**Follow-up:** Audit the full test suite for other assertions on dynamic content (settings-derived text, team member names, etc.) and apply the same structural assertion pattern. This reduces flakiness as the site's content evolves.

---

## BUG-07 — Contact Page: No Email Link + Form Navigates Away on Submit

**Affects:** `/contact`  
**Severity:** Medium  
**Failed tests:** WF-PUB-08 (2 tests)

### Steps to Reproduce — Missing Email Link

1. Navigate to `/contact`
2. Look for any `<a href="mailto:...">` link on the page

### Actual Outcome
No `mailto:` link is found anywhere on the contact page. The PAC email address is either displayed as plain text (not a link) or not displayed at all (settings not configured).

### Expected Outcome
The contact page should display a **clickable email link** in the format `<a href="mailto:pac@example.com">` in the contact info section alongside other contact details.

---

### Steps to Reproduce — Form Navigates Away

1. Navigate to `/contact`
2. Fill in Name: `Test User`, Email: `test@example.com`, Subject: `Test Subject`, Message: `Test message`
3. Click the **Send Message** (or equivalent) submit button
4. Observe the page URL after clicking

### Actual Outcome
Clicking the submit button navigates away from `/contact` to a different URL. The URL after submit is not `https://kanakapac.vercel.app/contact`.

### Expected Outcome
Submitting the contact form should either:
- Stay on `/contact` and show a success/error message inline, or
- Make an API call and show feedback without a page navigation

The URL should remain `https://kanakapac.vercel.app/contact` after submission.

### Assessment
**Root cause 1 — Missing email link:** In `src/app/contact/page.tsx:44–46`, the PAC email is rendered as a plain `<p>` tag:
```
<p className="text-gray-600">{settings.email}</p>
```
There is no `<a href="mailto:...">` wrapper. The comment at line 183 ("This form will open your email client") suggests mailto was intended but never implemented.

**Root cause 2 — Form navigates away:** The `<form>` element has no `action`, `method`, or `onSubmit` handler. Without `e.preventDefault()`, clicking the submit button triggers the browser's default form submission — a `GET` request to the current URL with field values as query params (`/contact?name=Test+User&email=...`), changing the URL. The contact page is a server component (`async function ContactPage()`), so there is no client-side submit handler available.

**Impacted components:** `src/app/contact/page.tsx:44–46` (email not a link), `src/app/contact/page.tsx:116–181` (form has no handler).

**Proposed fix:**

1. Wrap the email in a `mailto:` anchor:
```tsx
<a href={`mailto:${settings.email}`} className="text-primary-600 hover:underline">
  {settings.email}
</a>
```

2. Convert the form section to a `"use client"` sub-component (or a separate `ContactForm.tsx`) with `e.preventDefault()` and an API call to `/api/send-email`, displaying inline success/error feedback.

### Final Proposal
**Classification:** Genuine code defects — two distinct unimplemented features.

**Recommended action: fix production code on both issues.**

Both failures represent incomplete implementations, not incorrect tests.

**Fix 1 — Email link (trivial, one line):** Wrap `{settings.email}` in a `mailto:` anchor. No architecture change needed. If `settings.email` is empty (default or unset), render a fallback or nothing rather than an empty `href="mailto:"`:
```tsx
{settings.email && (
  <a href={`mailto:${settings.email}`} className="text-primary-600 hover:underline">
    {settings.email}
  </a>
)}
```

**Fix 2 — Contact form (architectural change):** The contact page is a React Server Component. The `<form>` cannot have an `onSubmit` handler here. Extract the form into a `ContactForm.tsx` client component. The `/api/send-email` route already exists — use it.

The original comment ("This form will open your email client") indicates a `mailto:` action was the original intent. A `mailto:` action is simpler but unreliable — it depends on the user having a configured email client, fails silently on many devices, and provides no confirmation. The existing `/api/send-email` route is the correct path. Clarify this intent with the product owner before implementing, but the `/api/send-email` approach is recommended.

**Architecture guidance for `ContactForm.tsx`:**
- Add `"use client"` directive
- Call `POST /api/send-email` on submit
- Show inline success/error state — no page navigation
- Validate required fields client-side before submission (name, email, message at minimum)

**Testing recommendation:** Once the client component is in place, the existing test `edge case — contact form submit button present but does not navigate` will pass without modification since `e.preventDefault()` prevents navigation. No test changes required.

---

## BUG-08 — Minutes Page: Subscribe Form Missing + Empty State Not Shown

**Affects:** `/minutes`  
**Severity:** Low  
**Failed tests:** WF-PUB-04 (2 tests), WF-PUB-09 (1 test)

### Steps to Reproduce — Missing Subscribe Form

1. Navigate to `/minutes`
2. Look for an email subscription form (input + "Subscribe" button)
3. Compare to `/events` and `/announcements` which both have the subscribe form

### Actual Outcome
No subscription form is present on the `/minutes` page. The form with a "Subscribe" button that exists on `/`, `/events`, and `/announcements` is absent from `/minutes`.

### Expected Outcome
The `/minutes` page should include the same newsletter subscribe form (email input + Subscribe button) present on all other public-facing pages.

---

### Steps to Reproduce — Missing Empty State

1. Navigate to `/minutes` when there are no minutes records in the database
2. Observe what is displayed

### Actual Outcome
When no minutes records exist, the page shows neither a minutes card nor an empty state message. The page renders a blank content area with no feedback to the user.

### Expected Outcome
When no minutes records exist, the page should display an **empty state message** such as "No meeting minutes available yet" so the user knows the section is intentionally empty, not broken.

### Assessment
**Root cause 1 — Missing subscribe form:** `src/app/minutes/page.tsx` never imports or renders `<SubscribeForm />`. The homepage, `/events`, and `/announcements` all include `<SubscribeForm />` at their bottom, but `/minutes` was omitted during development.

**Root cause 2 — Empty state text mismatch:** The actual empty state in `src/app/minutes/page.tsx:31` reads:
```
"No meeting minutes have been posted yet."
```
The `MinutesPage` page object's `noMinutesMsg` locator is `page.getByText(/no minutes/i)`. The regex `/no minutes/i` searches for the consecutive substring `"no minutes"`. The actual text contains `"No meeting minutes"` — the word `"no"` is followed by `"meeting"`, not immediately by `"minutes"`. The regex never matches, so `hasEmptyState` is always `false` when the DB is empty, causing the test to fail.

**Impacted components:** `src/app/minutes/page.tsx` (missing `SubscribeForm`, mismatched empty state text), `tests/pages/MinutesPage.ts:12` (locator regex too narrow).

**Proposed fix:**

1. Add `SubscribeForm` to the minutes page:
```tsx
import SubscribeForm from "@/components/SubscribeForm";
// ... at the bottom of the return:
<SubscribeForm />
```

2. Fix the empty state text to match the existing locator (simpler than updating both):
```tsx
// minutes/page.tsx — change:
"No meeting minutes have been posted yet."
// to:
"No minutes have been posted yet."
```
Or update the locator regex to `/no meeting minutes/i` to match the existing text.

### Final Proposal
**Classification:** Mixed — genuine code omission (missing subscribe form) + test locator defect (empty state regex).

**Recommended action: fix production code for the subscribe form; fix the test for the empty state.**

**Fix 1 — Subscribe form (code fix):** This is a straightforward omission. Import and render `<SubscribeForm />` at the bottom of `src/app/minutes/page.tsx`, consistent with all other public pages. No architectural consideration needed — the component is already built and used elsewhere.

**Fix 2 — Empty state (test fix, not code fix):** The production text "No meeting minutes have been posted yet." is clear, grammatically correct user-facing copy. **Do not change it to satisfy a test locator.** Changing production copy to match a regex is inverted thinking — tests exist to validate the product, not constrain it.

Update the locator in `MinutesPage.ts` to match the actual text:
```ts
// Change:
this.noMinutesMsg = page.getByText(/no minutes/i);
// To:
this.noMinutesMsg = page.getByText(/no meeting minutes have been posted/i);
```

**Architectural note:** The empty state test `hasCards || hasEmptyState` only fails when the database has zero minutes records. On a live production site, this state may rarely occur. Consider whether this test should run against a dedicated test environment with seeded data rather than production, where the empty state can be reliably guaranteed. Running this class of test against production data makes the pass/fail outcome dependent on whether an admin has deleted all minutes — a fragile dependency.

**Follow-up:** Audit `/announcements` and `/events` pages to confirm they also have subscribe forms in both the page and the test expectations, so this omission pattern is not repeated if new public pages are added in future.