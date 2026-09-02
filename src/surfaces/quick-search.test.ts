import { beforeEach, describe, expect, it } from 'vitest';
import { defs } from '../icons/seti-data';
import { resolveIcon } from '../icons/resolve-icon';
import { renderQuickSearchSuggestion } from './quick-search';

function suggestion({
  href,
  label,
  description,
  kind,
}: {
  href: string;
  label: string;
  description?: string;
  kind: 'file' | 'repo' | 'owner' | 'copilot';
}): HTMLElement {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  const visualIcon = kind === 'file'
    ? '<svg class="octicon octicon-file-code" aria-hidden="true"></svg>'
    : kind === 'repo'
      ? '<svg class="octicon octicon-search" aria-hidden="true"></svg>'
      : kind === 'owner'
        ? '<svg class="octicon octicon-search" aria-hidden="true"></svg>'
        : '<svg class="octicon octicon-copilot" aria-hidden="true"></svg>';

  const descriptionBlock = description
    ? `<span class="prc-ActionList-Description-Z-EZJ">${description}</span>`
    : '';

  dialog.innerHTML = `
    <ul role="listbox">
      <li role="option">
        <a class="prc-ActionList-ActionListContent-KBb8- prc-Link-Link-9ZwDx"
           data-testid="quick-search-suggestion"
           href="${href}">
          <span class="prc-ActionList-LeadingVisual-NBr28 prc-ActionList-VisualWrap-bdCsS"
                data-testid="suggestion-leading-visual">${visualIcon}</span>
          <span id="quick-search-label" class="prc-ActionList-ItemLabel-81ohH">${label}</span>
          ${descriptionBlock}
        </a>
      </li>
    </ul>`;
  document.body.append(dialog);
  return dialog.querySelector('a[data-testid="quick-search-suggestion"]')!;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderQuickSearchSuggestion', () => {
  it('decorates a code-path file suggestion and hides the native octicon', () => {
    const option = suggestion({
      href: '/mayerwin/AI-Agent-Sound-Notification/blob/main/src/config.ts',
      label: 'config.ts',
      description: 'mayerwin/AI-Agent-Sound-Notification • src',
      kind: 'file',
    });

    renderQuickSearchSuggestion(option);

    const native = option.querySelector<SVGElement>('svg.octicon-file-code');
    expect(native).not.toBeNull();
    expect(native!.classList.contains('seti-original-icon')).toBe(true);

    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(native!.nextElementSibling).toBe(icon);
    expect(icon!.textContent).toBe(defs[resolveIcon('config.ts', 'file')!]!.c);
  });

  it('uses the basename from the blob URL even when the visible label differs', () => {
    const option = suggestion({
      href: '/mayerwin/AI-Agent-Sound-Notification/blob/main/README.md',
      label: '<mark>README</mark>.md',
      description: 'mayerwin/AI-Agent-Sound-Notification',
      kind: 'file',
    });

    renderQuickSearchSuggestion(option);

    const icon = option.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.textContent).toBe(defs[resolveIcon('README.md', 'file')!]!.c);
  });

  it('leaves non-file suggestions untouched', () => {
    const repoOption = suggestion({
      href: '/search?q=repo%3Amayerwin%2FAI-Agent-Sound-Notification',
      label: 'repo:mayerwin/AI-Agent-Sound-Notification',
      kind: 'repo',
    });
    const ownerOption = suggestion({
      href: '/search?q=owner%3Amayerwin',
      label: 'owner:mayerwin',
      kind: 'owner',
    });
    const copilotOption = suggestion({
      href: '/copilot',
      label: 'Chat with Copilot',
      kind: 'copilot',
    });

    renderQuickSearchSuggestion(repoOption);
    renderQuickSearchSuggestion(ownerOption);
    renderQuickSearchSuggestion(copilotOption);

    expect(repoOption.querySelector('.seti-icon')).toBeNull();
    expect(ownerOption.querySelector('.seti-icon')).toBeNull();
    expect(copilotOption.querySelector('.seti-icon')).toBeNull();
  });

  it('ignores links whose href is not a blob URL', () => {
    const option = suggestion({
      href: '/search?q=foo',
      label: 'foo',
      description: 'mayerwin/AI-Agent-Sound-Notification',
      kind: 'file',
    });

    renderQuickSearchSuggestion(option);

    expect(option.querySelector('.seti-icon')).toBeNull();
    expect(option.querySelector('.seti-original-icon')).toBeNull();
  });

  it('does not duplicate icons on repeated processing', () => {
    const option = suggestion({
      href: '/mayerwin/AI-Agent-Sound-Notification/blob/main/CHANGELOG.md',
      label: 'CHANGELOG.md',
      description: 'mayerwin/AI-Agent-Sound-Notification',
      kind: 'file',
    });

    renderQuickSearchSuggestion(option);
    renderQuickSearchSuggestion(option);

    expect(option.querySelectorAll('.seti-icon')).toHaveLength(1);
  });

  it('returns silently for an element that is not an anchor', () => {
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'quick-search-suggestion');
    div.innerHTML = '<svg class="octicon octicon-file-code" aria-hidden="true"></svg>';
    document.body.append(div);

    renderQuickSearchSuggestion(div);

    expect(div.querySelector('.seti-icon')).toBeNull();
  });
});
