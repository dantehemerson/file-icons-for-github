import { beforeEach, describe, expect, it } from 'vitest';
import { renderSearchResult } from './search-results';

function searchLink(text: string, href: string): HTMLAnchorElement {
  const container = document.createElement('div');
  container.className = 'search-title';
  container.innerHTML = `<a class="Link--primary" href="${href}">${text}</a>`;
  document.body.append(container);
  return container.querySelector('a')!;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderSearchResult', () => {
  it('decorates the result filename link', () => {
    const link = searchLink('<span class="search-match">foo</span>.ts', '/o/r/blob/main/src/foo.ts');
    renderSearchResult(link);

    const icon = link.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
  });

  it('falls back to the URL basename when the link is empty', () => {
    const link = searchLink('', '/o/r/blob/main/src/script.py');
    renderSearchResult(link);
    expect(link.querySelector('.seti-icon')).not.toBeNull();
  });

  it('does not duplicate on repeated processing', () => {
    const link = searchLink('main.ts', '/o/r/blob/main/src/main.ts');
    renderSearchResult(link);
    renderSearchResult(link);
    expect(link.querySelectorAll('.seti-icon')).toHaveLength(1);
  });
});