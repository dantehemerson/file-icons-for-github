import { beforeEach, describe, expect, it } from 'vitest';
import { renderFileFinderResult } from './file-finder';

const ZWSP = '\u200B';

function finderDialog(path: string, kind: 'File' | 'Directory', index = 0): HTMLElement {
  const dialog = document.createElement('div');
  dialog.id = 'file-results-list';
  dialog.setAttribute('role', 'dialog');
  dialog.innerHTML = `
    <ul role="listbox">
      <li role="group">
        <a role="option" id="file-result-${index}" href="/owner/repo/${kind === 'Directory' ? 'tree' : 'blob'}/main/${path}">
          <div class="FileResultsList-module__HighlightMatch__fixture">
            <svg class="octicon octicon-file fgColor-muted mr-2" aria-label="${kind}"></svg>
            <span>${path.split('/').map((segment, i, all) => {
              if (i === all.length - 1) return segment;
              return `${segment}${ZWSP}`;
            }).join('/')}</span>
            <span class="sr-only">Go to ${kind === 'Directory' ? 'folder' : 'file'}</span>
          </div>
        </a>
      </li>
    </ul>`;
  document.body.append(dialog);
  return dialog.querySelector(`a[role="option"][id="file-result-${index}"]`)!;
}

function finderFile(path: string, index = 0): HTMLElement {
  return finderDialog(path, 'File', index);
}

function finderDirectory(path: string, index = 0): HTMLElement {
  return finderDialog(path, 'Directory', index);
}

function finderFileWithHighlights(path: string, highlighted: string[], index = 0): HTMLElement {
  const dialog = document.createElement('div');
  dialog.id = 'file-results-list';
  dialog.setAttribute('role', 'dialog');

  const parts = path.split('/');
  const lastSegment = parts.pop()!;
  const displayPath = [...parts, lastSegment].join('/');

  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const highlightedSet = new Set(highlighted);
  const filenameHtml = escapeHtml(lastSegment).split('').map((char) => {
    if (highlightedSet.has(char)) {
      return `<mark class="text-bold bgColor-transparent fgColor-default">${char}</mark>`;
    }
    return char;
  }).join('');

  dialog.innerHTML = `
    <ul role="listbox">
      <li role="group">
        <a role="option" id="file-result-${index}" href="/owner/repo/blob/main/${path}">
          <div class="FileResultsList-module__HighlightMatch__fixture">
            <svg class="octicon octicon-file fgColor-muted mr-2" aria-label="File"></svg>
            ${escapeHtml(displayPath).replace(escapeHtml(lastSegment), filenameHtml)}
          </div>
        </a>
      </li>
    </ul>`;
  document.body.append(dialog);
  return dialog.querySelector(`a[role="option"][id="file-result-${index}"]`)!;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderFileFinderResult', () => {
  it('decorates a file result and hides the native octicon', () => {
    const option = finderFile('source/repo-wide-file-finder.tsx');
    renderFileFinderResult(option);

    const native = option.querySelector<SVGElement>('svg[aria-label="File"]');
    expect(native).not.toBeNull();
    expect(native!.classList.contains('seti-original-icon')).toBe(true);

    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(native!.nextElementSibling).toBe(icon);
  });

  it('derives the basename from a nested full path', () => {
    const option = finderFile('packages/web/src/components/Button.tsx');
    renderFileFinderResult(option);

    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.dataset.setiGlyph).toBeTruthy();
  });

  it('removes zero-width separators inserted after slashes', () => {
    const option = finderFile('lib/parse.rs');
    renderFileFinderResult(option);
    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
  });

  it('ignores the .sr-only "Go to file" hint when extracting filename', () => {
    const option = finderFile('README.md');
    renderFileFinderResult(option);

    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
  });

  it('handles highlighted fragments inside the basename', () => {
    const option = finderFileWithHighlights('lib/Button.tsx', ['B', 't', 'n']);
    renderFileFinderResult(option);

    const native = option.querySelector<SVGElement>('svg[aria-label="File"]');
    expect(native).not.toBeNull();
    expect(native!.nextElementSibling?.classList.contains('seti-icon')).toBe(true);
  });

  it('skips directory results', () => {
    const option = finderDirectory('source/features');
    renderFileFinderResult(option);

    expect(option.querySelector('.seti-icon')).toBeNull();
    expect(option.querySelector('.seti-original-icon')).toBeNull();
  });

  it('does nothing when the option has no native icon (changed markup)', () => {
    const option = document.createElement('a');
    option.setAttribute('role', 'option');
    option.setAttribute('id', 'file-result-0');
    document.body.append(option);

    renderFileFinderResult(option);

    expect(option.querySelector('.seti-icon')).toBeNull();
  });

  it('does not duplicate on repeated processing', () => {
    const option = finderFile('lib.rs');
    renderFileFinderResult(option);
    renderFileFinderResult(option);

    expect(option.querySelectorAll('.seti-icon')).toHaveLength(1);
  });

  it('returns silently for an option without a text container', () => {
    const option = document.createElement('a');
    option.setAttribute('role', 'option');
    option.setAttribute('id', 'file-result-0');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-label', 'File');
    option.append(svg);
    document.body.append(option);

    renderFileFinderResult(option);

    expect(option.querySelector('.seti-icon')).toBeNull();
  });
});
