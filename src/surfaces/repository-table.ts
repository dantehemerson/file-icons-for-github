import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = 'div.react-directory-filename-column';

/**
 * Repository root / tree pages: the file listing table.
 *
 * GitHub renders each row twice (a small-screen and a large-screen cell) and
 * already shows folder icons, so we only decorate file cells and leave
 * directories untouched. The default octicon is hidden via a `:has` rule in
 * style.css once our icon is present.
 */
export function renderRepositoryColumn(column: Element): void {
  const link = column.querySelector<HTMLAnchorElement>('a.Link--primary');
  if (!link) {
    return;
  }

  const aria = link.getAttribute('aria-label') ?? '';
  if (aria.includes('(Directory)')) {
    return;
  }

  if (column.querySelector('.seti-icon')) {
    return;
  }

  const filename = link.getAttribute('title') ?? link.textContent?.trim() ?? '';
  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  const icon = createIcon(info);
  const textWrap = column.querySelector<HTMLElement>('.overflow-hidden');
  if (textWrap) {
    column.insertBefore(icon, textWrap);
  } else {
    column.prepend(icon);
  }
}

export function initRepositoryTable(): void {
  observe(SELECTOR, renderRepositoryColumn);
}