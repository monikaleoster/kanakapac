import { Page, Locator } from '@playwright/test';

export class PoliciesPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly constitutionSection: Locator;
  readonly codeOfConductSection: Locator;
  readonly volunteerPolicySection: Locator;
  readonly privacyPolicySection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: /policies/i }).first();
    this.constitutionSection = page.getByRole('heading', { name: /constitution|bylaws/i });
    this.codeOfConductSection = page.getByRole('heading', { name: /code of conduct/i });
    this.volunteerPolicySection = page.getByRole('heading', { name: /volunteer policy/i });
    this.privacyPolicySection = page.getByRole('heading', { name: /privacy policy/i });
  }

  async goto() {
    await this.page.goto('/policies');
  }

  getDynamicPolicies() {
    return this.page.getByRole('link', { name: /download/i });
  }
}
