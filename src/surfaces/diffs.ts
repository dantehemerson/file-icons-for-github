import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = '[class*="diff-file-header"], .file-header';

// Invisible/bidirectional control characters GitHub renders around file
// paths. They are not visible but still appear in `textContent`, so they
// must be stripped before resolving the icon (e.g. `R.hpp\u200E`).
const INVISIBLE_CODE_POINTS = /[\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

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

  const raw = stripInvisibles(nameEl.textContent?.trim() ?? header.getAttribute('data-path') ?? '');
  const filename = lastPathSegment(raw) || raw;
  if (!filename) {
    return;
  }
  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  const icon = createIcon(info);
  if (isRtl(nameEl)) {
    nameEl.append(icon);
  } else {
    nameEl.prepend(icon);
  }
}

export function initDiffs(): void {
  observe(SELECTOR, renderDiffHeader);
}

function lastPathSegment(path: string): string {
  return path.split('/').filter(Boolean).at(-1) ?? '';
}

function stripInvisibles(text: string): string {
  return text.replaceAll(INVISIBLE_CODE_POINTS, '');
}

function isRtl(element: Element): boolean {
  return getComputedStyle(element).direction === 'rtl';
}
