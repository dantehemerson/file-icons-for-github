/**
 * Updates the bundled Seti icon data and font from VS Code's theme-seti
 * extension at a pinned commit.
 *
 * Usage:
 *   node scripts/update-seti-icons.mjs [COMMIT_SHA]
 *
 * This is an explicit, developer-run maintenance step. It is NOT part of
 * `npm install` or the normal build, so building stays fully reproducible
 * with whatever generated files are committed.
 *
 * It downloads and verifies:
 *   - extensions/theme-seti/icons/seti.woff              (the icon font)
 *   - extensions/theme-seti/icons/vs-seti-icon-theme.json (associations)
 *   - extensions/theme-seti/ThirdPartyNotices.txt         (Seti UI notice)
 *   - LICENSE.txt                                         (VS Code MIT)
 *
 * and writes:
 *   - src/icons/seti-data.ts   compact, runtime-only association tables
 *   - src/icons/seti-font.ts   the font embedded as base64 (no network fetch
 *                              needed at runtime, no web_accessible_resources)
 *   - assets/third-party/*     license/notice copies
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SHA = 'a11e4a544c9c19643f08fb400d8659ebb84cbc8f';
const SOURCE = 'microsoft/vscode';
const THEME_PATH = 'extensions/theme-seti';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const srcIcons = join(root, 'src', 'icons');
const thirdPartyDir = join(root, 'assets', 'third-party');

const sha = process.argv[2] ?? DEFAULT_SHA;
console.log(`Updating Seti icons from ${SOURCE} @ ${sha}`);

const rawUrl = (file) => `https://raw.githubusercontent.com/${SOURCE}/${sha}/${file}`;

async function download(file, expectedBytes) {
  const url = rawUrl(file);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (expectedBytes !== undefined && bytes.length !== expectedBytes) {
    throw new Error(
      `Size mismatch for ${file}: expected ${expectedBytes} bytes, got ${bytes.length}. ` +
        `The pinned commit may have changed; re-pin and update expectations.`,
    );
  }
  return Buffer.from(bytes);
}

function verify(theme) {
  const required = ['iconDefinitions', 'fileExtensions', 'fileNames', 'file'];
  for (const key of required) {
    if (!(key in theme)) {
      throw new Error(`Upstream theme JSON is missing expected key "${key}". Aborting.`);
    }
  }
  if (theme.fonts?.[0]?.id !== 'seti') {
    console.warn('Unexpected font id in upstream theme; verify manually.');
  }
}

const themeBuf = await download(`${THEME_PATH}/icons/vs-seti-icon-theme.json`);
const fontBuf = await download(`${THEME_PATH}/icons/seti.woff`, 37_284);
const noticesBuf = await download(`${THEME_PATH}/ThirdPartyNotices.txt`);
const licenseBuf = await download('LICENSE.txt');

const theme = JSON.parse(themeBuf.toString('utf8'));
verify(theme);

console.log('Checksums (SHA-256) of downloaded assets:');
for (const [label, buf] of [
  ['vs-seti-icon-theme.json', themeBuf],
  ['seti.woff', fontBuf],
  ['ThirdPartyNotices.txt', noticesBuf],
  ['LICENSE.txt', licenseBuf],
]) {
  console.log(`  ${label}: ${createHash('sha256').update(buf).digest('hex')}`);
}

// --- Generate compact association data ------------------------------------

// Dark definitions: every icon id NOT ending in "_light". The light variant is
// an identical glyph with a different color, folded into the dark definition.
const defs = {};
for (const [id, def] of Object.entries(theme.iconDefinitions)) {
  if (id.endsWith('_light')) {
    continue;
  }
  const light = theme.iconDefinitions[`${id}_light`];
  defs[id] = {
    c: codepoint(def.fontCharacter),
    d: def.fontColor,
    ...(light?.fontColor ? { l: light.fontColor } : {}),
  };
}

// Keys are lowercased at generation time so runtime lookup is trivially
// case-insensitive (GitHub file names are case-sensitive, Seti's are not).
const extensions = {};
for (const [ext, id] of Object.entries(theme.fileExtensions)) {
  extensions[ext.toLowerCase()] = id;
}
const names = {};
for (const [name, id] of Object.entries(theme.fileNames)) {
  names[name.toLowerCase()] = id;
}

// Seti relies on VS Code's language registry for plain code extensions (e.g.
// ".js", ".ts", ".py") and only lists compound/special names in
// fileExtensions/fileNames. We fold the common plain extensions back in here
// so filename-only matching still resolves them. Curated, stable list.
const LANGUAGE_EXTENSIONS = {
  bat: '_windows', cmd: '_windows',
  clj: '_clojure', cljs: '_clojure', cljc: '_clojure',
  coffee: '_coffee',
  json: '_json', jsonc: '_json', jsonl: '_json',
  c: '_c',
  cpp: '_cpp', cxx: '_cpp', cc: '_cpp',
  cs: '_c-sharp', csx: '_c-sharp',
  css: '_css', pcss: '_css',
  dart: '_dart',
  dockerfile: '_docker',
  fs: '_f-sharp', fsi: '_f-sharp', fsx: '_f-sharp',
  go: '_go2',
  groovy: '_grails', gvy: '_grails',
  hbs: '_mustache',
  html: '_html_3', htm: '_html_3',
  java: '_java',
  js: '_javascript', mjs: '_javascript', cjs: '_javascript',
  jsx: '_react',
  tsx: '_react',
  jl: '_julia',
  less: '_less',
  lua: '_lua',
  md: '_markdown', markdown: '_markdown', mdx: '_markdown',
  m: '_c_2', mm: '_cpp_2',
  pl: '_perl', pm: '_perl',
  php: '_php',
  ps1: '_powershell', psm1: '_powershell', psd1: '_powershell',
  py: '_python', pyi: '_python', pyw: '_python',
  r: '_R',
  rb: '_ruby', rake: '_ruby',
  rs: '_rust',
  scss: '_sass', sass: '_sass',
  sh: '_shell', bash: '_shell', zsh: '_shell',
  sql: '_db',
  swift: '_swift',
  ts: '_typescript', mts: '_typescript', cts: '_typescript',
  xml: '_xml',
  yml: '_yml', yaml: '_yml',
  gitignore: '_git',
  ini: '_config', cfg: '_config', conf: '_config', env: '_config',
  bashrc: '_shell', zshrc: '_shell', bash_profile: '_shell', zprofile: '_shell',
  vimrc: '_config', inputrc: '_config', editorconfig: '_config',
};

const EXTRA_NAMES = {
  dockerfile: '_docker',
  makefile: '_makefile',
};

for (const [ext, id] of Object.entries(LANGUAGE_EXTENSIONS)) {
  extensions[ext.toLowerCase()] ??= id;
}
for (const [name, id] of Object.entries(EXTRA_NAMES)) {
  names[name.toLowerCase()] ??= id;
}

const defaultFile = theme.file;

// A few upstream definitions (e.g. "_todo") omit fontColor, meaning VS Code
// renders them in the default text color. Default them to the default-file
// colors so every generated definition is renderable.
const defaultDef = defs[defaultFile];
for (const def of Object.values(defs)) {
  def.d ??= defaultDef.d;
  def.l ??= defaultDef.l;
}

// Stable, deterministic output.
const sorted = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : 1)));

// Emit strings as single-quoted TS literals, escaping every non-ASCII
// character (e.g. the private-use-area glyphs) as \uXXXX.
const tsString = (value) =>
  JSON.stringify(value)
    .replaceAll('"', "'")
    .replace(/[\u0080-\uFFFF]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);

const tsRecord = (obj) => {
  const entries = Object.entries(sorted(obj)).map(
    ([key, value]) => `  '${key}': ${tsString(value)}`,
  );
  return `{\n${entries.join(',\n')},\n}`;
};

const dataTs = `// GENERATED FILE — DO NOT EDIT. Regenerate with: npm run update:seti
// Source: https://github.com/${SOURCE}/tree/${sha}/${THEME_PATH}
// See scripts/update-seti-icons.mjs for details.

export interface SetiDefinition {
  /** Font codepoint of the glyph (a single character). */
  c: string;
  /** Color for dark themes. */
  d: string;
  /** Color for light themes (optional). */
  l?: string;
}

/** Default file icon id. */
export const defaultFile = '${defaultFile}';

/** Lowercased file extension -> icon definition id. */
export const extensions: Record<string, string> = ${tsRecord(extensions)};

/** Lowercased exact file name -> icon definition id. */
export const names: Record<string, string> = ${tsRecord(names)};

/** Icon definition id -> glyph + colors. */
export const defs: Record<string, SetiDefinition> = ${tsRecord(defs)};
`;

const fontTs = `// GENERATED FILE — DO NOT EDIT. Regenerate with: npm run update:seti
// Source: https://github.com/${SOURCE}/tree/${sha}/${THEME_PATH}/icons/seti.woff
// Embedded as base64 so the font needs no runtime network fetch and no
// web_accessible_resources entry.

export const setiFont = {
  name: 'Seti',
  format: 'woff',
  base64: '${fontBuf.toString('base64')}',
};
`;

mkdirSync(srcIcons, { recursive: true });
mkdirSync(thirdPartyDir, { recursive: true });

writeFileSync(join(srcIcons, 'seti-data.ts'), dataTs);
writeFileSync(join(srcIcons, 'seti-font.ts'), fontTs);
writeFileSync(join(thirdPartyDir, 'seti-ThirdPartyNotices.txt'), noticesBuf);
writeFileSync(join(thirdPartyDir, 'vscode-LICENSE.txt'), licenseBuf);

console.log('\nWrote:');
console.log(`  src/icons/seti-data.ts (${dataTs.length} bytes)`);
console.log(`  src/icons/seti-font.ts (${fontTs.length} bytes)`);
console.log(`  assets/third-party/seti-ThirdPartyNotices.txt`);
console.log(`  assets/third-party/vscode-LICENSE.txt`);
console.log(`\nPinned SHA: ${sha}`);

function codepoint(value) {
  // Format is "\E027" (backslash, "E", 3 hex digits); tolerate a "\u" prefix too.
  const hex = value.replace(/^\\[u]?/, '');
  return String.fromCodePoint(Number.parseInt(hex, 16));
}