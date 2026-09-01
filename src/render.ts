import { iconDefinition } from './icons/resolve-icon';

export interface IconInfo {
  character: string;
  colorDark: string;
  colorLight: string;
}

/** Resolves an icon id to renderable info, or `undefined` to skip rendering. */
export function getIcon(id: string | null): IconInfo | undefined {
  return iconDefinition(id);
}

const lightScheme = window.matchMedia('(prefers-color-scheme: light)');

interface LiveIcon {
  element: HTMLElement;
  info: IconInfo;
}

const live = new Set<LiveIcon>();

/** Creates a decorative, accessibility-safe icon element. */
export function createIcon(info: IconInfo): HTMLElement {
  const span = document.createElement('span');
  span.className = 'seti-icon';
  span.setAttribute('aria-hidden', 'true');
  span.dataset.setiGlyph = info.character;
  span.textContent = info.character;
  applyColor(span, info);
  live.add({ element: span, info });
  return span;
}

/** Re-applies theme colors, e.g. when GitHub's color scheme changes. */
export function refreshIconColors(): void {
  for (const { element, info } of live) {
    applyColor(element, info);
  }
}

/** Returns a cleanup function. Call once at startup. */
export function initThemeSync(): () => void {
  const onChange = (): void => refreshIconColors();
  lightScheme.addEventListener('change', onChange);
  return () => lightScheme.removeEventListener('change', onChange);
}

function applyColor(span: HTMLElement, info: IconInfo): void {
  span.style.color = lightScheme.matches ? info.colorLight : info.colorDark;
}