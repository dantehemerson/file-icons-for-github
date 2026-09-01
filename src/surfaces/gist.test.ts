import { beforeEach, describe, expect, it } from 'vitest';
import { renderGistFileName } from './gist';

function gistAnchor(name: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.className = 'wb-break-all';
  const strong = document.createElement('strong');
  strong.className = 'gist-blob-name css-truncate-target';
  strong.textContent = name;
  anchor.append(strong);
  document.body.append(anchor);
  return anchor;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderGistFileName', () => {
  it('inserts an icon before the file name', () => {
    const anchor = gistAnchor('hello_world.rb');
    renderGistFileName(anchor.querySelector('.gist-blob-name')!);

    const icon = anchor.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(icon!.nextElementSibling).toBe(anchor.querySelector('.gist-blob-name'));
  });

  it('does not duplicate on repeated processing', () => {
    const anchor = gistAnchor('app.py');
    const name = anchor.querySelector('.gist-blob-name')!;
    renderGistFileName(name);
    renderGistFileName(name);
    expect(anchor.querySelectorAll('.seti-icon')).toHaveLength(1);
  });
});