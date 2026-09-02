import { setiFont } from '../../src/icons/seti-font';
import { disconnectObserver } from '../../src/observe';
import { initThemeSync } from '../../src/render';
import { initDiffs } from '../../src/surfaces/diffs';
import { initFileFinder } from '../../src/surfaces/file-finder';
import { initGist } from '../../src/surfaces/gist';
import { initQuickSearch } from '../../src/surfaces/quick-search';
import { initRepositoryTable } from '../../src/surfaces/repository-table';
import { initRepositoryTree } from '../../src/surfaces/repository-tree';
import { initSearchResults } from '../../src/surfaces/search-results';
import './style.css';

export default defineContentScript({
  matches: ['https://github.com/*', 'https://gist.github.com/*'],
  runAt: 'document_idle',
  main(ctx) {
    injectFontFace();
    const cleanupTheme = initThemeSync();

    initRepositoryTable();
    initRepositoryTree();
    initFileFinder();
    initQuickSearch();
    initSearchResults();
    initGist();
    initDiffs();

    ctx.addEventListener(window, 'pagehide', () => {
      cleanupTheme();
      disconnectObserver();
    });
  },
});

/**
 * The Seti icon font is embedded as base64 so rendering needs no network
 * request and no `web_accessible_resources` entry.
 */
function injectFontFace(): void {
  if (document.querySelector('#seti-font-face')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'seti-font-face';
  style.textContent = `@font-face {
    font-family: 'Seti';
    font-style: normal;
    font-weight: normal;
    src: url(data:font/woff;base64,${setiFont.base64}) format('woff');
    font-display: block;
  }`;
  document.head.appendChild(style);
}