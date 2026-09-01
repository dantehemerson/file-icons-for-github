import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = '[class*="diff-file-header"], .file-header';

/**
 * Pull request "Files changed", commit, and compare pages render each diff
 * inside a header whose file name is an `<h3>` with a `file-name` class (or a
 * `.Link--primary` anchor on older markup). The text is the full path; we
 * resolve the icon from its last segment but never touch the diff content.
 */
export function renderDiffHeader(header: Element): void {
  const nameEl = header.querySelector<HTMLElement>(
    'h3[class*="file-name"], a.Link--primary, [class*="file-name"]',
  );
  if (!nameEl) {
    return;
  }

  if (nameEl.querySelector('.seti-icon')) {
    return;
  }

  const raw = nameEl.textContent?.trim() ?? header.getAttribute('data-path') ?? '';
  const filename = lastPathSegment(raw) || raw;
  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  nameEl.prepend(createIcon(info));
}

export function initDiffs(): void {
  observe(SELECTOR, renderDiffHeader);
}

function lastPathSegment(path: string): string {
  return path.split('/').filter(Boolean).at(-1) ?? '';
}