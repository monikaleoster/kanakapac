import { Page, Locator } from '@playwright/test';

export class AdminMinutesPage {
  readonly page: Page;
  readonly newMinutesBtn: Locator;
  readonly titleInput: Locator;
  readonly dateInput: Locator;
  readonly contentInput: Locator;
  readonly fileInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newMinutesBtn = page.getByRole('button', { name: /\+ new minutes|add minutes/i });
    this.titleInput = page.getByLabel(/title/i);
    this.dateInput = page.getByLabel(/date/i);
    this.contentInput = page.getByLabel(/content/i);
    this.fileInput = page.locator('input[type="file"]');
    this.submitBtn = page.getByRole('button', { name: /save|submit|create/i }).last();
    this.confirmDeleteBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).last();
    this.cancelDeleteBtn = page.getByRole('button', { name: /cancel|no/i });
  }

  async goto() {
    await this.page.goto('/admin/minutes');
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getMinutesListItems() {
    return this.page.locator('li, tr, article').filter({
      has: this.page.getByRole('button', { name: /edit/i }),
    });
  }

  async fillMinutesForm(data: { title: string; date: string; content: string }) {
    await this.titleInput.fill(data.title);
    await this.dateInput.fill(data.date);
    await this.contentInput.fill(data.content);
  }
}
