import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';

// WF-PUB-08: View Contact Page
test.describe('WF-PUB-08: Contact Page', () => {
  test('happy path — page loads with contact form fields', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    await expect(page).toHaveURL(/\/contact/);
    await expect(contactPage.nameInput).toBeVisible();
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.subjectInput).toBeVisible();
    await expect(contactPage.messageInput).toBeVisible();
  });

  test('happy path — contact info section present', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    // Email link should be present in the info column
    await expect(contactPage.emailLink).toBeVisible();
    await expect(contactPage.emailLink).toHaveAttribute('href', /^mailto:/);
  });

  test('happy path — email link opens mail client', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    const href = await contactPage.emailLink.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
  });

  test('edge case — contact form submit button present but does not navigate', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    await contactPage.nameInput.fill('Test User');
    await contactPage.emailInput.fill('test@example.com');
    await contactPage.subjectInput.fill('Test Subject');
    await contactPage.messageInput.fill('Test message body');

    // Form has no real submit handler — button should be visible
    await expect(contactPage.submitBtn).toBeVisible();

    // Click should not navigate away (no handler wired up)
    const urlBefore = page.url();
    await contactPage.submitBtn.click();
    // Allow brief delay then confirm URL unchanged
    await page.waitForTimeout(500);
    expect(page.url()).toBe(urlBefore);
  });

  test('edge case — page uses fallback defaults when no settings saved', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    // Page should render without errors regardless of settings state
    await expect(page.locator('body')).not.toContainText(/error|500/i);
    await expect(contactPage.nameInput).toBeVisible();
  });
});
