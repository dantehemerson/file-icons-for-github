import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = '.search-title a[href*="/blob/"], .search-result a[href*="/blob/"]';

/**
 * GitHub code-search results: each result row links its file name to the blob
 * page. The anchor text may be split by highlight spans, so read it via
 * textContent and fall back to the URL's last path segment.
 */
export function renderSearchResult(link: Element): void {
  const anchor = link as HTMLAnchorElement;
  if (anchor.querySelector('.seti-icon')) {
    return;
  }

  const text = anchor.textContent?.trim() ?? '';
  const filename = text || lastPathSegment(anchor.href);
  if (!filename) {
    return;
  }

  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  anchor.prepend(createIcon(info));
}

export function initSearchResults(): void {
  observe(SELECTOR, renderSearchResult);
}

function lastPathSegment(href: string): string {
  try {
    const segments = new URL(href).pathname.split('/').filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? '');
  } catch {
    return '';
  }
}