import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = 'a[data-testid="quick-search-suggestion"]';

/**
 * GitHub's global quick-search dialog ("Type / to search") shows results
 * for repositories, organizations, code, issues, users, and Copilot.
 *
 * File results are links with `data-testid="quick-search-suggestion"` that
 * point at a blob URL and render a leading `svg.octicon-file-code`. Their
 * accessible name also contains the repository and "jump to this code",
 * which is why the basename is parsed from the `href` instead of the
 * anchor's `textContent`.
 *
 * Non-file suggestions (repo:, owner:, Copilot, …) are intentionally left
 * untouched so the file-type icon is not applied to them.
 */
export function renderQuickSearchSuggestion(option: Element): void {
  if (option.querySelector('.seti-icon')) {
    return;
  }

  if (!(option instanceof HTMLAnchorElement)) {
    return;
  }

  const filename = extractBlobFilename(option);
  if (!filename) {
    return;
  }

  const nativeIcon = option.querySelector<SVGElement>('svg.octicon-file-code');
  if (!nativeIcon) {
    return;
  }

  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  nativeIcon.classList.add('seti-original-icon');
  nativeIcon.insertAdjacentElement('afterend', createIcon(info));
}

function extractBlobFilename(option: HTMLAnchorElement): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(option.getAttribute('href') ?? '', option.baseURI).pathname;
  } catch {
    return undefined;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 4 || segments[2] !== 'blob') {
    return undefined;
  }

  return segments.at(-1);
}

export function initQuickSearch(): void {
  observe(SELECTOR, renderQuickSearchSuggestion);
}
