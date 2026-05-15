import { Page, Locator } from '@playwright/test';

export class AdminPoliciesPage {
  readonly page: Page;
  readonly newPolicyBtn: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly fileInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPolicyBtn = page.getByRole('button', { name: /\+ new policy|add policy/i });
    this.titleInput = page.getByLabel(/title/i);
    this.descriptionInput = page.getByLabel(/description/i);
    this.fileInput = page.locator('input[type="file"]');
    this.submitBtn = page.getByRole('button', { name: /save|submit|create/i }).last();
    this.confirmDeleteBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).last();
    this.cancelDeleteBtn = page.getByRole('button', { name: /cancel|no/i });
  }

  async goto() {
    await this.page.goto('/admin/policies');
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getPolicyListItems() {
    return this.page.locator('li, tr, article').filter({
      has: this.page.getByRole('button', { name: /edit/i }),
    });
  }

  isSubmitDisabled() {
    return this.submitBtn.isDisabled();
  }
}
