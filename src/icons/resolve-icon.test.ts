import { describe, expect, it } from 'vitest';
import { defaultFile, defs, extensions, names } from './seti-data';
import { resolveIcon } from './resolve-icon';

describe('resolveIcon', () => {
  it('returns null for directories', () => {
    expect(resolveIcon('src', 'directory')).toBeNull();
    expect(resolveIcon('', 'file')).toBeNull();
  });

  it('resolves exact file names case-insensitively', () => {
    expect(resolveIcon('LICENSE', 'file')).toBe('_license');
    expect(resolveIcon('license', 'file')).toBe('_license');
    expect(resolveIcon('readme.md', 'file')).toBe('_info');
    expect(resolveIcon('mix', 'file')).toBe('_hex');
    expect(resolveIcon('Dockerfile', 'file')).toBe('_docker');
    expect(resolveIcon('Makefile', 'file')).toBe('_makefile');
  });

  it('resolves plain extensions', () => {
    expect(resolveIcon('foo.js', 'file')).toBe('_javascript');
    expect(resolveIcon('main.ts', 'file')).toBe('_typescript');
    expect(resolveIcon('app.tsx', 'file')).toBe('_react');
    expect(resolveIcon('script.py', 'file')).toBe('_python');
    expect(resolveIcon('styles.css', 'file')).toBe('_css');
    expect(resolveIcon('index.html', 'file')).toBe('_html_3');
  });

  it('prefers compound extensions over the trailing one', () => {
    expect(resolveIcon('karma.conf.js', 'file')).toBe('_karma');
    expect(resolveIcon('foo.test.ts', 'file')).toBe('_typescript_1');
    expect(resolveIcon('bar.spec.tsx', 'file')).toBe('_react_1');
    expect(resolveIcon('config.tfvars.json', 'file')).toBe('_terraform');
    expect(resolveIcon('style.css.map', 'file')).toBe('_css');
  });

  it('resolves dotfiles', () => {
    expect(resolveIcon('.gitignore', 'file')).toBe('_git');
    expect(resolveIcon('.editorconfig', 'file')).toBe('_config');
    expect(resolveIcon('.npmrc', 'file')).toBe('_npm_1');
  });

  it('falls back to the default file icon', () => {
    expect(resolveIcon('unknown.xyz', 'file')).toBe(defaultFile);
    expect(resolveIcon('noextension', 'file')).toBe(defaultFile);
  });

  it('returns only ids that exist in defs', () => {
    const ids = [resolveIcon('x.js', 'file'), resolveIcon('y.rs', 'file'), resolveIcon('z.md', 'file')].filter(
      (id): id is string => id !== null,
    );
    for (const id of ids) {
      expect(defs[id]).toBeDefined();
    }
  });
});

describe('generated data sanity', () => {
  it('has the expected default', () => {
    expect(defaultFile).toBe('_default');
    expect(defs[defaultFile]).toMatchObject({ c: expect.any(String), d: expect.any(String) });
  });

  it('maps common extensions to existing definitions', () => {
    for (const ext of ['js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'json', 'css', 'html']) {
      expect(defs[extensions[ext]!], `extension ${ext}`).toBeDefined();
    }
  });

  it('has codepoints in the private use area and colors', () => {
    for (const [id, def] of Object.entries(defs)) {
      expect(def.c.codePointAt(0), `codepoint for ${id}`).toBeGreaterThanOrEqual(0xe000);
      expect(def.d, `dark color for ${id}`).toMatch(/^#[0-9a-f]{6}$/i);
      if (def.l) {
        expect(def.l, `light color for ${id}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});