import { Page, Locator } from '@playwright/test';

export class AdminEventsPage {
  readonly page: Page;
  readonly newEventBtn: Locator;
  readonly titleInput: Locator;
  readonly dateInput: Locator;
  readonly timeInput: Locator;
  readonly locationInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;
  readonly deleteModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newEventBtn = page.getByRole('button', { name: /\+ new event|add event|create event/i });
    this.titleInput = page.getByLabel(/title/i);
    this.dateInput = page.getByLabel(/date/i);
    this.timeInput = page.getByLabel(/time/i);
    this.locationInput = page.getByLabel(/location/i);
    this.descriptionInput = page.getByLabel(/description/i);
    this.submitBtn = page.getByRole('button', { name: /save|submit|create|add/i }).last();
    this.deleteModal = page.locator('[role="dialog"], [class*="modal"]').first();
    this.confirmDeleteBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).last();
    this.cancelDeleteBtn = page.getByRole('button', { name: /cancel|no/i });
  }

  async goto() {
    await this.page.goto('/admin/events');
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getEventListItems() {
    return this.page.locator('li, tr, [data-testid="event-item"], article').filter({
      has: this.page.getByRole('button', { name: /edit/i }),
    });
  }

  async fillEventForm(data: { title: string; date: string; time: string; location: string; description: string }) {
    await this.titleInput.fill(data.title);
    await this.dateInput.fill(data.date);
    await this.timeInput.fill(data.time);
    await this.locationInput.fill(data.location);
    await this.descriptionInput.fill(data.description);
  }
}
