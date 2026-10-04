import { Page, Locator } from '@playwright/test';

export class MinutesDetailPage {
  readonly page: Page;
  readonly backLink: Locator;
  readonly contentArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backLink = page.getByRole('link', { name: /back|meeting minutes/i });
    this.contentArea = page.locator('article, main, [class*="content"], [class*="prose"]').first();
  }

  async goto(id: string) {
    await this.page.goto(`/minutes/${id}`);
  }

  getTitle() {
    return this.page.getByRole('heading').first();
  }

  getViewDocumentLink() {
    // PDFs render inline with "Open in new tab"; non-PDF files keep "View Document".
    return this.page.getByRole('link', { name: /view document|open in new tab/i }).first();
  }
}
