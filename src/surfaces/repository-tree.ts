import { observe } from '../observe';
import { createIcon, getIcon } from '../render';
import { resolveIcon } from '../icons/resolve-icon';

const SELECTOR = 'li.PRIVATE_TreeView-item';

/**
 * Repository file tree (blob/tree sidebar), the "Go to file" finder, and the
 * PR changed-files tree all render with GitHub's TreeView component.
 *
 * Directories keep GitHub's chevron/folder visuals; only leaf files are
 * decorated.
 */
export function renderTreeItem(item: Element): void {
  const content = item.querySelector<HTMLElement>('.PRIVATE_TreeView-item-content');
  if (!content) {
    return;
  }

  // Directories expose aria-expanded and a chevron in their visual slot.
  if (content.hasAttribute('aria-expanded')) {
    return;
  }
  const visual = item.querySelector<SVGElement>('.PRIVATE_TreeView-item-visual svg');
  const chevron = visual?.classList.contains('octicon-chevron-down')
    || visual?.classList.contains('octicon-chevron-right')
    || visual?.classList.contains('octicon-chevron-up');
  if (chevron) {
    return;
  }

  const textSlot = content.querySelector<HTMLElement>('.PRIVATE_TreeView-item-content-text');
  if (!textSlot) {
    return;
  }

  if (textSlot.querySelector('.seti-icon')) {
    return;
  }

  const nameEl = textSlot.querySelector<HTMLElement>('.PRIVATE_TreeView-item-name');
  const filename = (nameEl ?? textSlot).textContent?.trim() ?? '';
  const info = getIcon(resolveIcon(filename, 'file'));
  if (!info) {
    return;
  }

  textSlot.prepend(createIcon(info));
}

export function initRepositoryTree(): void {
  observe(SELECTOR, renderTreeItem);
}