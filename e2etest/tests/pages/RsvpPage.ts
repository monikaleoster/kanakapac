import { Page, Locator } from '@playwright/test';

export class RsvpPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly submitBtn: Locator;
  readonly successMsg: Locator;
  readonly duplicateMsg: Locator;
  readonly errorMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel(/your name/i);
    this.emailInput = page.getByLabel(/email address/i);
    this.submitBtn = page.getByRole('button', { name: /rsvp now/i });
    this.successMsg = page.getByText(/you're on the list/i);
    this.duplicateMsg = page.getByText(/already rsvp'd/i);
    this.errorMsg = page.getByText(/something went wrong/i);
  }

  async fillAndSubmit(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.submitBtn.click();
  }
}
