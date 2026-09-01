import { defaultFile, defs, extensions, names } from './seti-data';

export type FileKind = 'file' | 'directory';

/**
 * Resolves a file name to a Seti icon definition id, or `null` when the item
 * should keep GitHub's own icon (directories).
 *
 * Resolution order:
 *   1. Exact file name (case-insensitive), e.g. `package.json`, `LICENSE`
 *   2. Longest compound extension, e.g. `test.tsx`, `tfvars.json`, `css.map`
 *   3. Last single extension, e.g. `json` in `package.json`
 *   4. The default file icon
 */
export function resolveIcon(filename: string, kind: FileKind): string | null {
  if (kind === 'directory' || !filename) {
    return null;
  }

  const lower = filename.toLowerCase();

  const byName = names[lower];
  if (byName !== undefined) {
    return byName;
  }

  const parts = lower.split('.');
  // Try compound extensions longest-first, then the single trailing extension.
  for (let start = 0; start < parts.length - 1; start++) {
    const suffix = parts.slice(start).join('.');
    const id = extensions[suffix];
    if (id !== undefined) {
      return id;
    }
  }

  const last = parts.at(-1);
  if (last) {
    const id = extensions[last];
    if (id !== undefined) {
      return id;
    }
  }

  return defaultFile;
}

/** Looks up the glyph + theme colors for an icon definition id. */
export function iconDefinition(id: string | null) {
  if (id === null) {
    return undefined;
  }
  const def = defs[id];
  if (!def) {
    return undefined;
  }
  return {
    character: def.c,
    colorDark: def.d,
    colorLight: def.l ?? def.d,
  };
}