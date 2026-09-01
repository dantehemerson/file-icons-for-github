import { beforeEach, describe, expect, it } from 'vitest';
import { renderTreeItem } from './repository-tree';

function treeFileItem(name: string): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual"><svg class="octicon octicon-file"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

function treeDirectoryItem(name: string): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content" aria-expanded="false">
      <div class="PRIVATE_TreeView-item-toggle"><svg class="octicon octicon-chevron-right"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderTreeItem', () => {
  it('decorates a file item', () => {
    const item = treeFileItem('action-pr-link.tsx');
    renderTreeItem(item);

    const textSlot = item.querySelector('.PRIVATE_TreeView-item-content-text')!;
    const icon = textSlot.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
  });

  it('skips directory items', () => {
    const item = treeDirectoryItem('src');
    renderTreeItem(item);
    expect(item.querySelector('.seti-icon')).toBeNull();
  });

  it('does not duplicate on repeated processing', () => {
    const item = treeFileItem('lib.rs');
    renderTreeItem(item);
    renderTreeItem(item);
    expect(item.querySelectorAll('.seti-icon')).toHaveLength(1);
  });
});