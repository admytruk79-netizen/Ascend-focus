import { test, expect } from '@playwright/test';
async function openPractice(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin practice', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: /I understand I can move/ }).check();
}
test('keyboard practice, reflection, private save, reload and deletion', async ({ page }) => {
  await openPractice(page); await page.clock.install();
  const start = page.getByRole('button', { name: 'Start', exact: true });
  await start.focus(); await page.keyboard.press('Enter'); await page.clock.runFor(2500);
  await page.getByRole('button', { name: 'Finish practice', exact: true }).click();
  await page.getByLabel('What did you notice?').fill('A private observation from the real running app.');
  await page.getByLabel('Comfort (optional)').selectOption('4');
  await page.getByRole('button', { name: 'Save private record' }).click();
  await expect(page.getByRole('heading', { name: 'Your journal' })).toBeVisible();
  await expect(page.locator('.entry')).toHaveCount(1);
  await page.screenshot({ path: 'test-results/screenshots/private-journal-mobile.png', fullPage: true });
  await page.reload(); await page.getByRole('navigation').getByRole('button', { name: 'Journal', exact: true }).click();
  await expect(page.getByText('A private observation from the real running app.')).toBeVisible();
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete entry', exact: true }).click();
  await expect(page.locator('.entry')).toHaveCount(0);
});
test('foreground time survives interrupted reload without counting background', async ({ page }) => {
  await openPractice(page); await page.clock.install();
  await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.clock.runFor(3000);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const interrupted = await page.evaluate(() => JSON.parse(localStorage.getItem('ascend-focus-session-v1')));
  await page.clock.runFor(60000);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('ascend-focus-session-v1')));
  expect(after.activeMs).toBe(interrupted.activeMs); expect(after.state).toBe('INTERRUPTED');
  await page.reload(); await page.getByRole('button', { name: 'Review and resume', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Background time was not counted');
  await page.getByRole('checkbox', { name: /I understand I can move/ }).check();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeEnabled();
  await page.screenshot({ path: 'test-results/screenshots/resumable-player-mobile.png', fullPage: true });
});
test('quota failure keeps reflection and never reports successful save', async ({ page }) => {
  await page.addInitScript(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'ascend-focus-journal-v1') throw new DOMException('Full', 'QuotaExceededError'); return original.call(this, key, value); }; });
  await openPractice(page); await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Stop early', exact: true }).click();
  await page.getByLabel('What did you notice?').fill('Keep this unsaved reflection.');
  await page.getByRole('button', { name: 'Save private record' }).click();
  await expect(page.getByRole('status')).toContainText('Your reflection was not saved');
  await expect(page.getByLabel('What did you notice?')).toHaveValue('Keep this unsaved reflection.');
  expect(await page.evaluate(() => localStorage.getItem('ascend-focus-journal-v1'))).toBeNull();
});
test('untimed practice, early stop, and catalog filters work at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await openPractice(page);
  await page.getByRole('checkbox', { name: 'Use an optional practice timer' }).uncheck();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByLabel('Untimed practice', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Stop early', exact: true }).click();
  await expect(page.getByText(/You stopped early; there is no penalty/)).toBeVisible();
  await page.getByRole('button', { name: 'Save private record' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByLabel('Search practices or lessons').fill('pencil');
  await expect(page.locator('.exercise')).toHaveCount(2);
  await page.getByLabel('Search practices or lessons').fill('no such exercise');
  await expect(page.locator('.exercise')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.locator('.exercise')).toHaveCount(15);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/screenshots/practice-library-320px.png', fullPage: true });
});
test('quiet mode persists and OS reduced motion prevents target animation', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.app')).toHaveClass('app quiet');
  await page.getByRole('navigation').getByRole('button', { name: 'Profile', exact: true }).click();
  await page.getByRole('checkbox', { name: /Quiet mode/ }).uncheck(); await page.reload();
  await expect(page.locator('.app')).toHaveClass('app');
  await page.getByRole('navigation').getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /The Black Dot/ }).click();
  await page.getByRole('checkbox', { name: /I understand I can move/ }).check();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  expect(await page.locator('.attention-dot').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});

test('historical gaze context is cited and never becomes guided eye-care advice', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /The Black Dot/ }).click();
  await page.getByRole('button', { name: 'Historical source', exact: true }).click();
  await page.getByText('Additional historical lesson advice', { exact: true }).click();
  await expect(page.getByText(/not app eye-care guidance/)).toBeVisible();
  await expect(page.getByText('PDF p. 56 · printed p. 44', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/historical-gaze-source-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Guided practice', exact: true }).click();
  await expect(page.getByText(/cold-water eye rinsing/)).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Modern guided instructions' })).toContainText('Blink naturally');
});

test('new source-grounded contemplation runs with optional secular reflection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /I Am Contemplation/ }).click();
  await expect(page.getByRole('region', { name: 'Modern guided instructions' })).toContainText('skip the phrase');
  await page.getByRole('button', { name: 'Historical source', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Historical source instructions' })).toContainText('a few minutes');
  await page.screenshot({ path: 'test-results/screenshots/i-am-source-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Guided practice', exact: true }).click();
  await page.getByRole('checkbox', { name: /I understand I can move/ }).check();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Stop early', exact: true }).click();
  await page.getByLabel('What did you notice?').fill('A voluntary reflection, not a claim of a special state.');
  await page.getByRole('button', { name: 'Save private record' }).click();
  await expect(page.locator('.entry')).toContainText('I Am Contemplation');
  await expect(page.locator('.entry')).toContainText('A voluntary reflection');
});

test('source-grounded pencil sharpening runs untimed and saves private reflection', async ({ page }) => {
 await page.goto('/');
 await page.getByRole('navigation').getByRole('button', { name: 'Practice', exact: true }).click();
 await page.getByRole('button', { name: /Focused Pencil Sharpening/ }).click();
 await page.getByRole('button', { name: 'Historical source', exact: true }).click();
 await expect(page.getByRole('region', { name: 'Historical source instructions' })).toContainText('time is at your disposal');
 await page.screenshot({ path: 'test-results/screenshots/pencil-sharpening-source-mobile.png', fullPage: true });
 await page.getByRole('button', { name: 'Guided practice', exact: true }).click();
 await expect(page.getByRole('region', { name: 'Modern guided instructions' })).toContainText('non-sharpening alternative');
 await page.getByRole('checkbox', { name: 'Use an optional practice timer' }).uncheck();
 await page.getByRole('checkbox', { name: /I understand I can move/ }).check();
 await page.getByRole('button', { name: 'Start', exact: true }).click();
 await expect(page.getByLabel('Untimed practice', { exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Stop early', exact: true }).click();
 await page.getByLabel('What did you notice?').fill('Used the accessible alternative; returned attention gently.');
 await page.getByRole('button', { name: 'Save private record' }).click();
 await expect(page.locator('.entry')).toContainText('Focused Pencil Sharpening');
 await expect(page.locator('.entry')).toContainText('accessible alternative');
 await page.reload();
 await page.getByRole('navigation').getByRole('button', { name: 'Journal', exact: true }).click();
 await expect(page.locator('.entry')).toContainText('accessible alternative');
});
