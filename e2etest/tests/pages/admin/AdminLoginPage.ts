import { Page, Locator } from '@playwright/test';

export class AdminLoginPage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly signInBtn: Locator;
  readonly errorMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));
    this.signInBtn = page.getByRole('button', { name: /sign in/i });
    this.errorMsg = page.getByText(/invalid password|incorrect/i);
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async login(password: string) {
    await this.passwordInput.fill(password);
    await this.signInBtn.click();
  }
}
