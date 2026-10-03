import { Page, Locator } from '@playwright/test';

export class AdminMinutesPage {
  readonly page: Page;
  readonly newMinutesBtn: Locator;
  readonly titleInput: Locator;
  readonly dateInput: Locator;
  readonly fileInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newMinutesBtn = page.getByRole('button', { name: /\+ new minutes|add minutes/i });
    this.titleInput = page.getByLabel(/title/i);
    this.dateInput = page.getByLabel(/date/i);
    this.fileInput = page.locator('input[type="file"]');
    this.submitBtn = page.getByRole('button', { name: /post minutes|update minutes/i });
    this.confirmDeleteBtn = page.getByTestId('confirm-delete-btn');
    this.cancelDeleteBtn = page.getByTestId('cancel-delete-btn');
  }

  async goto() {
    await this.page.goto('/admin/minutes');
    await this.newMinutesBtn.waitFor({ state: 'visible' });
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getMinutesListItems() {
    return this.page.locator('[data-testid="minutes-item"]');
  }

  async fillMinutesForm(data: { title: string; date: string }) {
    await this.titleInput.fill(data.title);
    await this.dateInput.fill(data.date);
  }

  async uploadFile(file: { name: string; mimeType: string; buffer: Buffer }) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }
}
