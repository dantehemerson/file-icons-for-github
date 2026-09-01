import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = '.gist-blob-name';

/**
 * Gist pages: each file's header shows its name in a <strong class=
 * "gist-blob-name">. The default octicon is hidden via a `:has` rule in
 * style.css.
 */
export function renderGistFileName(nameEl: Element): void {
  const filename = nameEl.textContent?.trim() ?? '';
  if (!filename) {
    return;
  }

  const anchor = nameEl.parentElement;
  if (!anchor) {
    return;
  }

  if (anchor.querySelector('.seti-icon')) {
    return;
  }

  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  anchor.insertBefore(createIcon(info), nameEl);
}

export function initGist(): void {
  observe(SELECTOR, renderGistFileName);
}