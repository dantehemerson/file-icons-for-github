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

function treeDirectoryItem(name: string, expanded = false): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content" aria-expanded="${expanded}">
      <div class="PRIVATE_TreeView-item-toggle"><svg class="octicon octicon-chevron-right"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

function treeDirectoryItemWithItemAria(name: string, expanded = false): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  if (expanded) {
    item.setAttribute('aria-expanded', 'false');
  }
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual"><svg class="octicon octicon-file-directory-fill"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

function treeDirectoryItemWithDirSvg(name: string): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual"><svg class="octicon octicon-file-directory-fill"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

function treeFileItemWithWrapper(name: string): HTMLElement {
  const outer = document.createElement('div');
  outer.className = 'PRIVATE_TreeView-item';
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual"><svg class="octicon octicon-file"></svg></div>
      <div class="PRIVATE_TreeView-item-content-text"><span class="PRIVATE_TreeView-item-name">${name}</span></div>
    </div>`;
  outer.append(item);
  document.body.append(outer);
  return outer;
}

function treeLoadingItem(): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.setAttribute('data-loading', 'true');
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual">
        <span data-component="Spinner">
          <svg></svg>
        </span>
      </div>
      <div class="PRIVATE_TreeView-item-content-text"><span>Loading...</span></div>
    </div>`;
  document.body.append(item);
  return item;
}

function treeLoadingItemWithoutSemanticAttribute(): HTMLElement {
  const item = document.createElement('li');
  item.className = 'PRIVATE_TreeView-item';
  item.innerHTML = `
    <div class="PRIVATE_TreeView-item-content">
      <div class="PRIVATE_TreeView-item-visual">
        <span data-component="Spinner">
          <svg></svg>
        </span>
      </div>
      <div class="PRIVATE_TreeView-item-content-text"><span>Loading...</span></div>
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

    const visualSlot = item.querySelector('.PRIVATE_TreeView-item-visual')!;
    const icon = visualSlot.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    // The Seti icon lives in the visual slot, not the filename slot, so
    // Primer's native spacing between the icon and the filename applies.
    expect(item.querySelector('.PRIVATE_TreeView-item-content-text')!.querySelector('.seti-icon')).toBeNull();
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

  it('does not decorate a folder containing decorated child files', () => {
    const folder = treeDirectoryItem('src', true);
    const child = treeFileItem('index.ts');
    folder.querySelector('.PRIVATE_TreeView-item-content')!.append(child);
    document.body.append(folder);

    renderTreeItem(child);
    renderTreeItem(folder);

    expect(child.querySelector('.seti-icon')).not.toBeNull();
    expect(folder.querySelector('.PRIVATE_TreeView-item-content-text')!.querySelector('.seti-icon')).toBeNull();
  });

  it('marks the original SVG with seti-original-icon', () => {
    const item = treeFileItem('index.ts');
    renderTreeItem(item);

    const originalIcon = item.querySelector<SVGElement>('.PRIVATE_TreeView-item-visual svg');
    expect(originalIcon).not.toBeNull();
    expect(originalIcon!.classList.contains('seti-original-icon')).toBe(true);
  });

  it('works with non-li wrapper elements (repos-file-tree)', () => {
    const item = treeFileItemWithWrapper('utils.ts');
    renderTreeItem(item);

    const visualSlot = item.querySelector('.PRIVATE_TreeView-item-visual')!;
    const icon = visualSlot.querySelector<HTMLElement>('.seti-icon');
    expect(icon).not.toBeNull();

    const originalIcon = item.querySelector<SVGElement>('.PRIVATE_TreeView-item-visual svg');
    expect(originalIcon!.classList.contains('seti-original-icon')).toBe(true);
  });

  it('does not mark original SVG for directories', () => {
    const item = treeDirectoryItem('src');
    renderTreeItem(item);

    const visuals = item.querySelectorAll<SVGElement>('.PRIVATE_TreeView-item-visual svg, .PRIVATE_TreeView-item-toggle svg');
    for (const visual of visuals) {
      expect(visual.classList.contains('seti-original-icon')).toBe(false);
    }
  });

  it('skips directories with aria-expanded on the item element', () => {
    const item = treeDirectoryItemWithItemAria('src', true);
    renderTreeItem(item);
    expect(item.querySelector('.seti-icon')).toBeNull();
    expect(item.querySelector('.seti-original-icon')).toBeNull();
  });

  it('skips items with directory SVG class', () => {
    const item = treeDirectoryItemWithDirSvg('utils');
    renderTreeItem(item);
    expect(item.querySelector('.seti-icon')).toBeNull();
    expect(item.querySelector('.seti-original-icon')).toBeNull();
  });

  it('skips loading placeholders with data-loading', () => {
    const item = treeLoadingItem();
    renderTreeItem(item);

    expect(item.querySelector('.seti-icon')).toBeNull();
    expect(item.querySelector('.seti-original-icon')).toBeNull();
    expect(item.querySelector('[data-component="Spinner"] svg')).not.toBeNull();
  });

  it('skips loading placeholders by Spinner fallback when data-loading is missing', () => {
    const item = treeLoadingItemWithoutSemanticAttribute();
    renderTreeItem(item);

    expect(item.querySelector('.seti-icon')).toBeNull();
    expect(item.querySelector('.seti-original-icon')).toBeNull();
    expect(item.querySelector('[data-component="Spinner"] svg')).not.toBeNull();
  });
});