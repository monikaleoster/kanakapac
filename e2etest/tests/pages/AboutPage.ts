import { Page, Locator } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly missionSection: Locator;
  readonly whatWeDoSection: Locator;
  readonly teamSection: Locator;
  readonly getInvolvedSection: Locator;
  readonly noTeamMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.missionSection = page.getByRole('heading', { name: /our mission/i });
    this.whatWeDoSection = page.getByRole('heading', { name: /what we do/i });
    this.teamSection = page.getByRole('heading', { name: /executive team/i });
    this.getInvolvedSection = page.getByRole('heading', { name: /how to get involved/i });
    this.noTeamMsg = page.getByText(/executive team information coming soon/i);
  }

  async goto() {
    await this.page.goto('/about');
  }

  getTeamMembers() {
    return this.page.locator('[data-testid="team-member"], .team-member, article, [class*="grid"] > div').filter({
      has: this.page.locator('h3, h2').first(),
    });
  }

  getEmailLinks() {
    return this.page.locator('a[href^="mailto:"]');
  }
}
