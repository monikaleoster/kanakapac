import { Page, Locator } from '@playwright/test';

export class AdminAnnouncementsPage {
  readonly page: Page;
  readonly newAnnouncementBtn: Locator;
  readonly titleInput: Locator;
  readonly contentInput: Locator;
  readonly prioritySelect: Locator;
  readonly expiresInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newAnnouncementBtn = page.getByRole('button', { name: /\+ new announcement|add announcement/i });
    this.titleInput = page.getByLabel(/title/i);
    this.contentInput = page.getByLabel(/content/i);
    this.prioritySelect = page.getByLabel(/priority/i);
    this.expiresInput = page.getByLabel(/expires/i);
    this.submitBtn = page.getByRole('button', { name: /post|update|save|submit|create/i }).last();
    this.confirmDeleteBtn = page.getByTestId('confirm-delete-btn');
    this.cancelDeleteBtn = page.getByTestId('cancel-delete-btn');
  }

  async goto() {
    await this.page.goto('/admin/announcements');
    await this.page.waitForLoadState('networkidle');
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getAnnouncementListItems() {
    return this.page.locator('li, tr, article, div').filter({
      has: this.page.getByRole('button', { name: /edit/i }),
    });
  }

  async fillForm(data: { title: string; content: string; priority: 'normal' | 'urgent'; expiresAt?: string }) {
    await this.titleInput.fill(data.title);
    await this.contentInput.fill(data.content);
    await this.prioritySelect.selectOption(data.priority);
    if (data.expiresAt) {
      await this.expiresInput.fill(data.expiresAt);
    }
  }
}
