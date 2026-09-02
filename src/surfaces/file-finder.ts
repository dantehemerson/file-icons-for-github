import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = '[role="listbox"] [role="option"][id^="file-result-"]';

/**
 * GitHub's "Go to file" finder renders fuzzy-search results inside a
 * `role="dialog"` overlay (or inline in the expanded tree pane). Each
 * result is a `role="option"` link with an id like `file-result-N`.
 *
 * Files carry a native `svg[aria-label="File"]` next to the full path
 * (which may be split by highlight `<mark>` elements and zero-width
 * separators after `/`). Directories render `svg[aria-label="Directory"]`
 * and intentionally keep GitHub's folder icon.
 */
export function renderFileFinderResult(option: Element): void {
  if (option.querySelector('.seti-icon')) {
    return;
  }

  const nativeIcon = option.querySelector<SVGElement>('svg[aria-label="File"]');
  if (!nativeIcon) {
    return;
  }

  const pathContainer = nativeIcon.parentElement;
  if (!pathContainer) {
    return;
  }

  const fullPath = pathContainer.textContent?.replaceAll('\u200B', '').trim() ?? '';
  const filename = fullPath.split('/').at(-1) ?? '';
  if (!filename) {
    return;
  }

  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  nativeIcon.classList.add('seti-original-icon');
  nativeIcon.insertAdjacentElement('afterend', createIcon(info));
}

export function initFileFinder(): void {
  observe(SELECTOR, renderFileFinderResult);
}
