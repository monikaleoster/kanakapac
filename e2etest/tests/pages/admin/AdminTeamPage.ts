import { Page, Locator } from '@playwright/test';

export class AdminTeamPage {
  readonly page: Page;
  readonly addMemberBtn: Locator;
  readonly nameInput: Locator;
  readonly roleInput: Locator;
  readonly bioInput: Locator;
  readonly emailInput: Locator;
  readonly orderInput: Locator;
  readonly submitBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addMemberBtn = page.getByRole('button', { name: /\+ add member|add team member/i });
    this.nameInput = page.getByLabel(/name/i);
    this.roleInput = page.getByLabel(/role/i);
    this.bioInput = page.getByLabel(/bio/i);
    this.emailInput = page.getByLabel(/email/i);
    this.orderInput = page.getByLabel(/order|display order/i);
    this.submitBtn = page.getByRole('button', { name: /save|submit|add|update/i }).last();
    this.confirmDeleteBtn = page.getByTestId('confirm-delete-btn');
    this.cancelDeleteBtn = page.getByTestId('cancel-delete-btn');
  }

  async goto() {
    await this.page.goto('/admin/team');
    await this.page.waitForLoadState('networkidle');
  }

  getEditBtns() {
    return this.page.getByRole('button', { name: /edit/i });
  }

  getDeleteBtns() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  getMoveUpBtns() {
    return this.page.getByRole('button', { name: /[▲↑]|move up/i });
  }

  getMoveDownBtns() {
    return this.page.getByRole('button', { name: /[▼↓]|move down/i });
  }

  getTeamMemberItems() {
    return this.page.locator('div.space-y-3 > div');
  }

  async fillMemberForm(data: { name: string; role: string; bio: string; email?: string; order?: string }) {
    await this.nameInput.fill(data.name);
    await this.roleInput.fill(data.role);
    await this.bioInput.fill(data.bio);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.order !== undefined) await this.orderInput.fill(data.order);
  }
}
