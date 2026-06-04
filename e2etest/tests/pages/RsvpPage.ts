import { Page, Locator } from '@playwright/test';

export class RsvpPage {
  readonly page: Page;
  readonly goingBtn: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly submitBtn: Locator;
  readonly successMsg: Locator;
  readonly duplicateMsg: Locator;
  readonly errorMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.goingBtn = page.getByRole('button', { name: /going/i });
    this.nameInput = page.getByLabel(/your name/i);
    this.emailInput = page.getByLabel(/email.*optional/i);
    this.submitBtn = page.getByRole('button', { name: /rsvp now/i });
    this.successMsg = page.getByText(/you're going/i);
    this.duplicateMsg = page.getByText(/already marked yourself as going/i);
    this.errorMsg = page.getByText(/something went wrong/i);
  }

  async openModal() {
    await this.goingBtn.click();
  }

  async fillAndSubmit(name: string, email?: string) {
    await this.openModal();
    await this.nameInput.fill(name);
    if (email) {
      await this.emailInput.fill(email);
    }
    await this.submitBtn.click();
  }
}
