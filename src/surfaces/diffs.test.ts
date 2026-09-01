import { beforeEach, describe, expect, it } from 'vitest';
import { defs } from '../icons/seti-data';
import { resolveIcon } from '../icons/resolve-icon';
import { renderDiffHeader } from './diffs';

function modernHeader(path: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'DiffFileHeader-module__diff-file-header__UuNN4';
  header.innerHTML = `<div class="d-flex">
    <h3 class="DiffFileHeader-module__file-name__VVXpg">${path}</h3>
  </div>`;
  document.body.append(header);
  return header;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderDiffHeader', () => {
  it('decorates the file name of a modern diff header', () => {
    const header = modernHeader('source/features/releases-tab.tsx');
    renderDiffHeader(header);

    const h3 = header.querySelector('h3')!;
    const icon = h3.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    // Resolved from the basename.
    expect(icon!.textContent).toBe(defs[resolveIcon('releases-tab.tsx', 'file')!]!.c);
  });

  it('does not duplicate on repeated processing', () => {
    const header = modernHeader('src/main.py');
    renderDiffHeader(header);
    renderDiffHeader(header);
    expect(header.querySelectorAll('.seti-icon')).toHaveLength(1);
  });

  it('does nothing without a file-name element', () => {
    const header = document.createElement('div');
    header.className = 'DiffFileHeader-module__diff-file-header__UuNN4';
    document.body.append(header);
    renderDiffHeader(header);
    expect(header.querySelector('.seti-icon')).toBeNull();
  });
});