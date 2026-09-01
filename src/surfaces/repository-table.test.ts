import { beforeEach, describe, expect, it } from 'vitest';
import { defs } from '../icons/seti-data';
import { resolveIcon } from '../icons/resolve-icon';
import { renderRepositoryColumn } from './repository-table';

function fileColumn(name: string): HTMLElement {
  const column = document.createElement('div');
  column.className = 'react-directory-filename-column';
  column.innerHTML = `
    <svg class="octicon octicon-file color-fg-muted"></svg>
    <div class="overflow-hidden">
      <div class="react-directory-filename-cell">
        <div class="react-directory-truncate">
          <a title="${name}" aria-label="${name}, (File)" class="Link--primary" href="#${name}">${name}</a>
        </div>
      </div>
    </div>`;
  document.body.append(column);
  return column;
}

function directoryColumn(name: string): HTMLElement {
  const column = document.createElement('div');
  column.className = 'react-directory-filename-column';
  column.innerHTML = `
    <svg class="octicon octicon-file-directory-fill"></svg>
    <div class="overflow-hidden">
      <div class="react-directory-filename-cell">
        <div class="react-directory-truncate">
          <a title="${name}" aria-label="${name}, (Directory)" class="Link--primary" href="#${name}">${name}</a>
        </div>
      </div>
    </div>`;
  document.body.append(column);
  return column;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderRepositoryColumn', () => {
  it('adds a decorative icon for a file', () => {
    const column = fileColumn('main.ts');
    renderRepositoryColumn(column);

    const icon = column.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(icon!.textContent).toBe(defs[resolveIcon('main.ts', 'file')!]!.c);
    // Inserted after the (now hidden) octicon, directly before the text wrap.
    expect(column.querySelector('.overflow-hidden')!.previousElementSibling).toBe(icon);
  });

  it('skips directories (GitHub renders folder icons)', () => {
    const column = directoryColumn('src');
    renderRepositoryColumn(column);
    expect(column.querySelector('.seti-icon')).toBeNull();
  });

  it('does not duplicate icons on repeated processing', () => {
    const column = fileColumn('app.tsx');
    renderRepositoryColumn(column);
    renderRepositoryColumn(column);
    expect(column.querySelectorAll('.seti-icon')).toHaveLength(1);
  });

  it('does nothing without a filename link', () => {
    const column = document.createElement('div');
    column.className = 'react-directory-filename-column';
    document.body.append(column);
    renderRepositoryColumn(column);
    expect(column.querySelector('.seti-icon')).toBeNull();
  });
});