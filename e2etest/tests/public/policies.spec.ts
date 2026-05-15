import { test, expect } from '@playwright/test';
import { PoliciesPage } from '../pages/PoliciesPage';

// WF-PUB-07: Browse Policies Page
test.describe('WF-PUB-07: Policies Page', () => {
  test('happy path — page loads', async ({ page }) => {
    const policiesPage = new PoliciesPage(page);
    await policiesPage.goto();

    await expect(page).toHaveURL(/\/policies/);
    await expect(policiesPage.pageHeading).toBeVisible();
  });

  test('happy path — static policy sections always rendered', async ({ page }) => {
    const policiesPage = new PoliciesPage(page);
    await policiesPage.goto();

    await expect(policiesPage.constitutionSection).toBeVisible();
    await expect(policiesPage.codeOfConductSection).toBeVisible();
    await expect(policiesPage.volunteerPolicySection).toBeVisible();
    await expect(policiesPage.privacyPolicySection).toBeVisible();
  });

  test('happy path — dynamic policy download links open in new tab', async ({ page }) => {
    const policiesPage = new PoliciesPage(page);
    await policiesPage.goto();

    const downloadLinks = policiesPage.getDynamicPolicies();
    const count = await downloadLinks.count();
    if (count > 0) {
      await expect(downloadLinks.first()).toHaveAttribute('target', '_blank');
    }
  });

  test('edge case — page renders correctly even with no dynamic policies', async ({ page }) => {
    const policiesPage = new PoliciesPage(page);
    await policiesPage.goto();

    // Static sections are always present regardless of DB content
    await expect(policiesPage.constitutionSection).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});
