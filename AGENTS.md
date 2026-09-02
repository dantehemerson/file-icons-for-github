# AGENTS

Working notes for AI coding agents and human contributors working on
**File Icons for GitHub**. This document explains the moving parts of the
extension and the rules contributors must follow to keep things stable.

User-facing docs live in [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md),
[PRIVACY.md](PRIVACY.md), and [SECURITY.md](SECURITY.md). The README banner
screenshot is stored at `docs/screenshot.png` until a real image is added.

## What this extension is

A Manifest V3 browser extension that decorates file names on
`github.com` and `gist.github.com` with the VS Code **Seti** icon font.
No network requests, no `host_permissions`, no background service worker.

## Repository map

```
entrypoints/github.content/   content script entry (injects the font-face + CSS)
src/observe.ts                batched DOM observer (works across GitHub's SPA navigation)
src/render.ts                 icon element creation + theme recolor
src/icons/                    generated Seti data + filename resolver
src/surfaces/                 one adapter per GitHub surface
scripts/update-seti-icons.mjs regenerates src/icons/* from upstream VS Code
scripts/e2e.mjs               browser E2E
wxt.config.ts                 WXT + Manifest V3 config (name, description, per-browser tweaks)
```

### Surface adapters (`src/surfaces/`)

Each GitHub surface owns an adapter with two exports:

- `initX(ctx)` — wires the adapter into the observer.
- `renderX(element)` — given a DOM node for that surface, returns the
  file-name element(s) to decorate. **Must be unit-testable with a small
  DOM fixture** (use `happy-dom` — already a dev dependency).

Currently implemented surfaces:

| Surface                | Adapter                    |
| ---------------------- | -------------------------- |
| Repository file table  | `repository-table.ts`      |
| Sidebar file tree      | `repository-tree.ts`       |
| `t` file finder        | `file-finder.ts`           |
| Quick search           | `quick-search.ts`          |
| Code search results    | `search-results.ts`        |
| Gists                  | `gist.ts`                  |
| PR / commit diffs      | `diffs.ts`                 |

When GitHub changes markup, fix the affected adapter only — the rest of the
extension should not need to change.

### Observer (`src/observe.ts`)

Batches DOM mutations with `MutationObserver` so the icon pass survives
GitHub's client-side navigation. Surfaces call back into it from `initX`.

### Render (`src/render.ts`)

Builds a decorative `<span class="seti-icon">` (or similar) before each
file name, picks the right glyph + color from the Seti data, and recolors
when GitHub's light/dark theme changes.

### Icons (`src/icons/`)

Two generated files committed to the repository so builds are reproducible
offline:

- `seti-data.ts` — compact runtime tables (extensions, exact file names,
  glyph ids, colors).
- `seti-font.ts` — the icon font embedded as a base64 data URI.

The data and font are regenerated from upstream VS Code by
`scripts/update-seti-icons.mjs`. Do **not** hand-edit those files.

## Conventions

### Selectors

- Prefer stable markers: stable class names, `aria-label`, `data-testid`.
- When only hashed CSS-module classes exist, use a substring attribute
  selector such as `[class*="diff-file-header"]` and add a fixture test
  for it.
- Co-locate each adapter's selector strategy with its tests.

### Accessibility

Icons are **purely decorative**. Every icon element must:

- Set `aria-hidden="true"`.
- Contain no text and bind no events.
- Never replace or alter the underlying file-name link or its accessible
  name. Use the original element; insert the icon **before** it.

### Theme handling

Recolor on `[data-color-mode]` / `[data-dark-theme]` / `[data-light-theme]`
changes (GitHub toggles the attribute on `<html>`). Sample the
`getComputedStyle` of an existing themed element to decide between the
dark and light Seti palettes; do not hard-code hex colors in components.

## Generated icon data

Icons come from VS Code's built-in `theme-seti` extension. Regenerate the
bundled data and font from a pinned upstream commit:

```sh
npm run update:seti            # uses the pinned commit in scripts/update-seti-icons.mjs
npm run update:seti <sha>      # or re-pin to a specific commit
```

The script:

1. Downloads the Seti font (`seti.woff`, 37 284 bytes), the
   `vs-seti-icon-theme.json` associations, and the third-party notices.
2. Verifies the expected sizes and required keys.
3. Emits `src/icons/seti-data.ts` (compact association tables) and
   `src/icons/seti-font.ts` (font embedded as base64).
4. Refreshing the `assets/third-party/` notices is part of the change —
   commit them alongside the regenerated files.

## Testing

```sh
npm run compile         # TypeScript type check
npm test                # unit tests (resolver + surface renderers; happy-dom)
npm run build           # produce .output/chrome-mv3
npm run test:e2e        # Playwright + bundled Chromium against live GitHub
npm run test:all        # all of the above, in order
```

E2E expectations (see `scripts/e2e.mjs`):

- Repo table, sidebar tree, file finder, quick search, gists, and PR
  diffs all show icons.
- The original file-code octicons are hidden where we replace them.
- Icons switch from the dark to the light Seti palette on theme change.
- "Seti" appears in the computed font-family for sampled icons.
- Code-search and PR-files checks are **skipped automatically** when the
  session is anonymous (GitHub does not render those surfaces for signed-out
  users).

When GitHub markup changes, update the affected adapter **and** its fixture
test, then run `npm run test:all`.

## Adding a new surface

1. Create `src/surfaces/<name>.ts` with `init<Name>(ctx)` and
   `render<Name>(element)`.
2. Add a fixture-based unit test in `src/surfaces/<name>.test.ts`.
3. Register the adapter in
   `entrypoints/github.content/index.ts`.
4. If E2E coverage is meaningful, extend `scripts/e2e.mjs`.
5. Document the new surface in the README under *Features*.

## Permissions & manifest

`wxt.config.ts` declares `permissions: []` and no `host_permissions`. The
extension runs only because of `content_scripts.matches` for
`github.com` and `gist.github.com`. **Do not add `host_permissions`,
`storage`, `webRequest`, or any API permission without a strong reason and
an updated [PRIVACY.md](PRIVACY.md).**

For Firefox, `browser_specific_settings.gecko.id` is required by AMO and
already set to `dantecalderon.dev@gmail.com`.
