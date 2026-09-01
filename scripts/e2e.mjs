/**
 * E2E validation for the built extension, plus selector/behavior dumps so the
 * DOM adapters can be maintained as GitHub markup changes.
 *
 * Usage:
 *   npm run build
 *   node scripts/e2e.mjs [--dump]
 *
 * Requires the bundled Chromium for the installed Playwright version.
 */

import { chromium } from 'playwright-core';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionPath = fileURLToPath(new URL('../.output/chrome-mv3', import.meta.url));
const dump = process.argv.includes('--dump');

const userDataDir = mkdtempSync(join(tmpdir(), 'seti-icons-e2e-'));
const browser = await chromium.launchPersistentContext(userDataDir, {
  channel: 'chromium',
  headless: true,
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});

const page = browser.pages()[0] ?? (await browser.newPage());
page.setDefaultTimeout(30_000);

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
}

async function dumpDom(label, selector, max = 2) {
  if (!dump) {
    return;
  }
  const html = await page.$$eval(selector, (els, m) => els.slice(0, m).map((el) => el.outerHTML.slice(0, 700)), max);
  console.log(`\n--- ${label} (${selector}) ---`);
  for (const h of html) {
    console.log(h, '\n');
  }
}

async function waitForSelectorWithScroll(selector, timeout = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const found = await page.locator(selector).count();
    if (found > 0) {
      return;
    }
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(800);
  }
  await page.waitForSelector(selector, { state: 'attached', timeout });
}

try {
  // 1. Repository root file table
  await page.goto('https://github.com/refined-github/refined-github', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('div.react-directory-filename-column .seti-icon', {
    state: 'attached',
    timeout: 15_000,
  });
  const files = await page.locator('div.react-directory-filename-column a[aria-label*="(File)"]').count();
  const icons = await page.locator('div.react-directory-filename-column .seti-icon').count();
  check('repo table: every file cell decorated', icons >= files, `icons=${icons} files=${files}`);
  await dumpDom('repo table row', 'tr.react-directory-row', 1);

  // 2. Repo tree page (nested dir listing)
  await page.goto('https://github.com/refined-github/refined-github/tree/main/source', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('div.react-directory-filename-column .seti-icon', {
    state: 'attached',
    timeout: 15_000,
  });
  check('repo tree page: files decorated', true);

  // 3. Blob page: sidebar file tree
  await page.goto('https://github.com/refined-github/refined-github/blob/main/source/refined-github.ts', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('[data-testid="repos-file-tree-container"] li.PRIVATE_TreeView-item', {
    state: 'attached',
    timeout: 20_000,
  });
  await page.waitForSelector('[data-testid="repos-file-tree-container"] .seti-icon', {
    state: 'attached',
    timeout: 15_000,
  });
  const fileItems = await page
    .locator('[data-testid="repos-file-tree-container"] li.PRIVATE_TreeView-item:not([aria-expanded])')
    .count();
  const treeIcons = await page.locator('[data-testid="repos-file-tree-container"] .seti-icon').count();
  check('sidebar tree: every file decorated', treeIcons >= fileItems, `icons=${treeIcons} files=${fileItems}`);
  const octiconHidden = await page
    .locator('[data-testid="repos-file-tree-container"] li.PRIVATE_TreeView-item:not([aria-expanded]) svg.octicon-file')
    .evaluateAll((els) => els.every((el) => getComputedStyle(el).display === 'none'));
  check('sidebar tree: generic file octicon hidden', octiconHidden);
  const folderVisualVisible = await page
    .locator('[data-testid="repos-file-tree-container"] li.PRIVATE_TreeView-item[aria-expanded] .PRIVATE_TreeView-item-visual')
    .evaluateAll((els) => els.every((el) => getComputedStyle(el).display !== 'none'));
  check('sidebar tree: folder visuals visible', folderVisualVisible);
  await dumpDom('sidebar tree item', '[data-testid="repos-file-tree-container"] li.PRIVATE_TreeView-item', 1);

  // 4. File finder (opened via ?search=1; uses the same TreeView component)
  await page.goto('https://github.com/refined-github/refined-github/tree/main?search=1', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('.PRIVATE_TreeView-item', { state: 'attached', timeout: 15_000 });
  await page.waitForSelector('.PRIVATE_TreeView-item .seti-icon', { state: 'attached', timeout: 10_000 });
  const finderItems = await page.locator('.PRIVATE_TreeView-item:not([aria-expanded])').count();
  const finderIcons = await page.locator('.PRIVATE_TreeView-item .seti-icon').count();
  check('file finder: results decorated', finderIcons >= finderItems, `icons=${finderIcons} files=${finderItems}`);
  await dumpDom('file finder item', '.PRIVATE_TreeView-item-content', 1);

// 5. Code search results (requires a signed-in session; skipped otherwise)
  await page.goto('https://github.com/search?q=repo%3Arefined-github%2Frefined-github&type=code', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(3_000);
  const searchAvailable = await page
    .locator('.search-title, [role="searchresults"], .react-code-search-results')
    .first()
    .count();
  const signedOut = await page.getByText('Sign in to search code on GitHub').first().count();
  if (signedOut > 0 || searchAvailable === 0) {
    console.log('SKIP  code search: requires a signed-in GitHub session');
    results.push({ name: 'code search (skipped)', ok: true });
  } else {
    await page.waitForSelector('.search-title .seti-icon', { state: 'attached', timeout: 15_000 });
    const searchIcons = await page.locator('.search-title .seti-icon').count();
    check('code search: results decorated', searchIcons > 0, `icons=${searchIcons}`);
    await dumpDom('search result', '.search-title', 2);
  }

  // 6. Gist
  await page.goto('https://gist.github.com/6cad326836d38bd3a7ae', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('a.wb-break-all .seti-icon', { state: 'attached', timeout: 15_000 });
  const gistOcticonHidden = await page
    .locator('.file:has(.seti-icon) svg.octicon-code-square')
    .evaluateAll((els) => els.every((el) => getComputedStyle(el).display === 'none'));
  check('gist: file headers decorated', true);
  check('gist: default octicon hidden', gistOcticonHidden);
  await dumpDom('gist header', 'a.wb-break-all', 1);

  // 7. PR files (content is not rendered for signed-out sessions; the same
  //    DiffFileHeader component is covered by the commit-diff check below)
  await page.goto('https://github.com/refined-github/refined-github/pull/10015/files', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4_000);
  const prHeaderCount = await page.locator('[class*="diff-file-header"]').count();
  if (prHeaderCount === 0) {
    console.log('SKIP  PR files: diffs not rendered for signed-out sessions');
    results.push({ name: 'PR files (skipped)', ok: true });
  } else {
    await waitForSelectorWithScroll('[class*="diff-file-header"] .seti-icon');
    const diffIcons = await page.locator('[class*="diff-file-header"] .seti-icon').count();
    check('PR files: diff headers decorated', diffIcons > 0, `icons=${diffIcons}`);
    await dumpDom('PR file header', '[class*="diff-file-header"]', 1);
  }

  // 8. Commit diff
  await page.goto(
    'https://github.com/refined-github/refined-github/commit/906da8c189127627f23fd3f0a706c2369a79c9b0',
    { waitUntil: 'domcontentloaded' },
  );
  await waitForSelectorWithScroll('[class*="diff-file-header"] .seti-icon');
  check('commit diff: diff headers decorated', true);

  // 9. Theme colors present (sample from several icons, not just the first)
  const fontStates = await page
    .locator('.seti-icon')
    .evaluateAll((els) => {
      const seen = new Set();
      const fonts = new Set();
      for (const el of els.slice(0, 40)) {
        const font = getComputedStyle(el).fontFamily;
        const color = getComputedStyle(el).color;
        seen.add(color);
        fonts.add(font);
      }
      return { fonts: [...fonts].slice(0, 3), colors: [...seen].slice(0, 3) };
    });
  check('icons use the Seti font', fontStates.fonts.every((f) => f.includes('Seti')), fontStates.fonts.join(' | '));
  check('icons have a color', fontStates.colors.length > 0, fontStates.colors.join(' | '));

  // 10. Light theme: icons switch to their light colors
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(300);
  const darkColors = new Set(
    await page.locator('.seti-icon').evaluateAll((els) => els.slice(0, 20).map((el) => getComputedStyle(el).color)),
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(300);
  const lightColors = new Set(
    await page.locator('.seti-icon').evaluateAll((els) => els.slice(0, 20).map((el) => getComputedStyle(el).color)),
  );
  const switched = [...lightColors].some((c) => !darkColors.has(c));
  check('light theme recolors icons', switched, `dark=${[...darkColors].join(' | ')}  light=${[...lightColors].join(' | ')}`);
} catch (error) {
  console.error('\nERROR during E2E:', error.message);
  results.push({ name: 'overall', ok: false });
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length === 0 ? 0 : 1);