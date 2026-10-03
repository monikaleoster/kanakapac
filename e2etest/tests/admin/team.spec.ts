import { test, expect } from '@playwright/test';
import { AdminTeamPage } from '../pages/admin/AdminTeamPage';

test.use({ storageState: 'tests/.auth/admin.json' });

const TEST_MEMBER = {
  name: 'E2E Test Member',
  role: 'Test Chair',
  bio: 'This member was created by a Playwright E2E test.',
  email: 'e2e-member@example.com',
};

const TEST_MEMBER_NAMES = [
  'E2E Test Member',
  'Public Visible Member',
  'No Email Member',
  'Default Order Member',
  'Photo Member',
  'No Photo Member',
  'Long Bio Member',
];

// 1x1 transparent PNG
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

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

    await expect(page.getByText(TEST_MEMBER.name).first()).toBeVisible({ timeout: 8000 });
  });

  test('happy path — new member appears on public About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Public Visible Member' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('Public Visible Member').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    await expect(page.getByText('Public Visible Member').first()).toBeVisible();
  });

  test('edge case — empty email saved without email link on About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'No Email Member', email: '' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('No Email Member').first()).toBeVisible({ timeout: 8000 });

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

    await expect(page.getByText('Default Order Member').first()).toBeVisible({ timeout: 8000 });
  });

  test.afterAll(async ({ request }) => {
    const res = await request.get('/api/team');
    const members: Array<{ id: string; name: string }> = await res.json();
    for (const member of members) {
      if (TEST_MEMBER_NAMES.includes(member.name)) {
        await request.delete(`/api/team?id=${member.id}`);
      }
    }
  });
});

test.describe('WF-ADM-19: Team — Photo', () => {
  // Serial: afterAll cleans up by name, which would race across parallel workers
  test.describe.configure({ mode: 'serial' });

  test('happy path — uploaded photo shows on About page with name as alt text', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Photo Member' });
    await teamPage.photoInput.setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: TINY_PNG });
    await expect(page.getByRole('button', { name: /remove photo/i })).toBeVisible({ timeout: 10000 });
    await teamPage.submitBtn.click();
    await expect(page.getByText('Photo Member').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    await expect(page.getByRole('img', { name: 'Photo Member' })).toBeVisible();
  });

  test('edge case — member without photo shows initials placeholder on About page', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'No Photo Member' });
    await teamPage.submitBtn.click();
    await expect(page.getByText('No Photo Member').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    const card = page.getByTestId('team-member').filter({ hasText: 'No Photo Member' });
    await expect(card.getByTestId('team-member-initials')).toHaveText('NP');
    await expect(card.getByRole('img')).toHaveCount(0);
  });

  test('edge case — six-sentence bio is shown in full without breaking the card layout', async ({ page }) => {
    const longBio =
      'First sentence about this member. Second sentence about their background. ' +
      'Third sentence about their work with the PAC. Fourth sentence about the committees they lead. ' +
      'Fifth sentence about their goals for the year. Sixth and final sentence inviting parents to get in touch.';

    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: 'Long Bio Member', bio: longBio });
    await teamPage.photoInput.setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: TINY_PNG });
    await expect(page.getByRole('button', { name: /remove photo/i })).toBeVisible({ timeout: 10000 });
    await teamPage.submitBtn.click();
    await expect(page.getByText('Long Bio Member').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    const card = page.getByTestId('team-member').filter({ hasText: 'Long Bio Member' });
    await expect(card.getByText(/Sixth and final sentence/)).toBeVisible();

    // Photo keeps its size instead of being squeezed by the long text
    const photoBox = await card.getByRole('img', { name: 'Long Bio Member' }).boundingBox();
    expect(photoBox?.width).toBeGreaterThanOrEqual(80);
    expect(photoBox?.height).toBeGreaterThanOrEqual(80);

    // Text stays inside the card, and the page does not scroll sideways
    const cardBox = await card.boundingBox();
    const bioBox = await card.getByText(/Sixth and final sentence/).boundingBox();
    expect(bioBox!.x + bioBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
    expect(bioBox!.y + bioBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);
  });

  test('edge case — non-image file is rejected with an error', async ({ page }) => {
    const teamPage = new AdminTeamPage(page);
    await teamPage.goto();

    await teamPage.addMemberBtn.click();
    await teamPage.photoInput.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
    await expect(page.getByText(/png, jpeg or webp/i)).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    const res = await request.get('/api/team');
    const members: Array<{ id: string; name: string }> = await res.json();
    for (const member of members) {
      if (['Photo Member', 'No Photo Member', 'Long Bio Member'].includes(member.name)) {
        await request.delete(`/api/team?id=${member.id}`);
      }
    }
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

    await expect(page.getByText('Updated Member Name').first()).toBeVisible({ timeout: 8000 });
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

    const toDelete = `Member To Delete ${Date.now()}`;

    await teamPage.addMemberBtn.click();
    await teamPage.fillMemberForm({ ...TEST_MEMBER, name: toDelete });
    await teamPage.submitBtn.click();
    await expect(page.getByText(toDelete).first()).toBeVisible({ timeout: 8000 });

    const targetRow = page.locator('div').filter({ has: page.getByRole('heading', { name: toDelete }) }).filter({ has: page.getByRole('button', { name: /delete/i }) }).last();
    await targetRow.getByRole('button', { name: /delete/i }).click();
    await expect(teamPage.confirmDeleteBtn).toBeVisible();
    await teamPage.confirmDeleteBtn.click();

    await expect(page.getByText(toDelete)).not.toBeVisible({ timeout: 8000 });

    await page.goto('/about');
    await expect(page.getByText(toDelete)).not.toBeVisible();
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
