import { Page, Locator } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;
  readonly hamburgerBtn: Locator;
  readonly mobileMenu: Locator;
  readonly desktopNav: Locator;
  readonly floatingPromoBtn: Locator;
  readonly floatingPromoTooltip: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hamburgerBtn = page.getByRole('button', { name: /menu|hamburger|toggle/i }).or(
      page.locator('[aria-label*="menu"], button[class*="hamburger"], button[class*="mobile"]')
    ).first();
    this.mobileMenu = page.locator('[class*="mobile-menu"], nav[class*="mobile"], [role="navigation"]').filter({
      has: page.getByRole('link', { name: /home/i }),
    }).first();
    this.desktopNav = page.locator('nav, header').first();
    this.floatingPromoBtn = page.locator('[class*="fixed"][class*="bottom"], [class*="floating"]').filter({
      has: page.locator('button'),
    }).first().locator('button');
    this.floatingPromoTooltip = page.getByTestId('promo-tooltip');
  }

  getNavLink(name: string) {
    return this.page.locator('nav[aria-label="Main navigation"]')
      .getByRole('link', { name: new RegExp(`^${name}$`, 'i') });
  }

  getConsultationLink() {
    return this.floatingPromoTooltip.getByRole('link', { name: /book a free consultation/i });
  }
}
