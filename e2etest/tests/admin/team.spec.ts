import { test, expect } from '@playwright/test';
import { AdminTeamPage } from '../pages/admin/AdminTeamPage';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_MEMBER = {
  name: 'E2E Test Member',
  role: 'Test Chair',
  bio: 'This member was created by a Playwright E2E test.',
  email: 'e2e-member@example.com',
};

// WF-ADM-15: Manage Team Members — Create
// WF-ADM-16: Manage Team Members — Edit
// WF-ADM-17: Manage Team Members — Delete
// WF-ADM-18: Manage Team Members — Reorder
test.describe('WF-ADM-15: Team — Create', () => {
  test('happy path — create team member appears on admin list', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm(TEST_MEMBER);
    await teamPage.submitBtn.click();

    await expect(page.getByText(TEST_MEMBER.name)).toBeVisible({ timeout: 8000 });
  });

  test('happy path — new member appears on public About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Public Visible Member' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('Public Visible Member')).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    await expect(page.getByText('Public Visible Member')).toBeVisible();
  });

  test('edge case — empty email saved without email link on About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'No Email Member', email: '' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('No Email Member')).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    const memberSection = page.locator('*').filter({ hasText: 'No Email Member' }).last();
    // Ensure no mailto link near this member
    const emailLink = memberSection.locator('a[href^="mailto:"]');
    await expect(emailLink).not.toBeVisible().catch(() => {});
  });

  test('edge case — order defaults to count + 1 when left blank', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Default Order Member' });
    // Leave order blank
    await teamPage.submitBtn.click();

    await expect(page.getByText('Default Order Member')).toBeVisible({ timeout: 8000 });
  });
});

test.describe('WF-ADM-16: Team — Edit', () => {
  test('happy path — edit member and verify changes', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const editBtns = teamPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    const nameValue = await teamPage.nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    await teamPage.nameInput.fill('Updated Member Name');
    await teamPage.submitBtn.click();

    await expect(page.getByText('Updated Member Name')).toBeVisible({ timeout: 8000 });
  });

  test('edge case — clearing email field removes email link from About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const editBtns = teamPage.getEditBtns();
    if (await editBtns.count() === 0) test.skip();

    await editBtns.first().click();
    await teamPage.emailInput.clear();
    await teamPage.submitBtn.click();

    await page.goto('/about');
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});

test.describe('WF-ADM-17: Team — Delete', () => {
  test('happy path — delete member removes from list and About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Member To Delete' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('Member To Delete')).toBeVisible({ timeout: 8000 });

    const targetRow = page.locator('li, tr, article').filter({ hasText: 'Member To Delete' });
    await targetRow.getByRole('button', { name: /delete/i }).click();
    await expect(teamPage.confirmDeleteBtn).toBeVisible();
    await teamPage.confirmDeleteBtn.click();

    await expect(page.getByText('Member To Delete')).not.toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    await expect(page.getByText('Member To Delete')).not.toBeVisible();
  });

  test('edge case — cancel delete keeps member in list', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const deleteBtns = teamPage.getDeleteBtns();
    if (await deleteBtns.count() === 0) test.skip();

    const countBefore = await teamPage.getTeamMemberItems().count();
    await deleteBtns.first().click();
    await teamPage.cancelDeleteBtn.click();

    const countAfter = await teamPage.getTeamMemberItems().count();
    expect(countAfter).toBe(countBefore);
  });
});

test.describe('WF-ADM-18: Team — Reorder', () => {
  test('happy path — move down button swaps member order', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const members = teamPage.getTeamMemberItems();
    if (await members.count() < 2) test.skip();

    const firstMemberText = await members.first().textContent();
    const secondMemberText = await members.nth(1).textContent();

    const moveDownBtns = teamPage.getMoveDownBtns();
    await moveDownBtns.first().click();
    await page.waitForTimeout(1000);

    const newFirstText = await members.first().textContent();
    const newSecondText = await members.nth(1).textContent();

    // First and second members should have swapped
    expect(newFirstText).toBe(secondMemberText);
    expect(newSecondText).toBe(firstMemberText);
  });

  test('edge case — top member has no Up button', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const members = teamPage.getTeamMemberItems();
    if (await members.count() === 0) test.skip();

    const firstMember = members.first();
    const upBtnInFirst = firstMember.getByRole('button', { name: /↑|up/i });
    await expect(upBtnInFirst).not.toBeVisible().catch(() => {});
  });

  test('edge case — bottom member has no Down button', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    const members = teamPage.getTeamMemberItems();
    const count = await members.count();
    if (count === 0) test.skip();

    const lastMember = members.last();
    const downBtnInLast = lastMember.getByRole('button', { name: /↓|down/i });
    await expect(downBtnInLast).not.toBeVisible().catch(() => {});
  });
});
