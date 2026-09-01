# Seti Icons for GitHub

Shows [VS Code Seti](https://github.com/jesseweed/seti-ui) file-type icons on GitHub:

- Repository file listings and folder pages
- The repository file tree (blob/tree sidebar)
- The "Go to file" finder
- Code search results
- Gists
- Pull request / commit / compare diff headers

Icons are rendered from a single **37 KB font embedded in the extension**, so
there are no per-file image requests and no runtime network calls.

This is a clean-room successor to the abandoned
[`dderevjanik/github-vscode-icons`](https://github.com/dderevjanik/github-vscode-icons)
extension: a modern Manifest V3 build, a fraction of the size, no background
service worker, and a minimal permission surface.

## Install (development)

```sh
npm install
npm run build            # Chromium extension -> .output/chrome-mv3
npm run build:firefox    # Firefox extension   -> .output/firefox-mv3
```

- **Chromium / Edge / Brave:** `chrome://extensions` → *Developer mode* →
  *Load unpacked* → select `.output/chrome-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on*
  → select `.output/firefox-mv3/manifest.json`.

Store-ready archives:

```sh
npm run zip              # .output/chrome-mv3.zip
npm run zip:firefox      # .output/firefox-mv3.zip
```

## Permissions & privacy

The extension requests **no API permissions** and makes **no network
requests**:

- It only runs on `github.com` and `gist.github.com` (`host_permissions`).
- It reads the page DOM to find file names and inserts a decorative, hidden-from
  assistive-technology icon element.
- It does not collect, store, or transmit any data. The Seti font is embedded
  in the extension package; icons are resolved entirely locally.
- No background service worker exists.

The only browser warning you will see is that the extension can "read and
change your data on github.com and gist.github.com" — unavoidable for an
extension that visually modifies those pages.

See [PRIVACY.md](PRIVACY.md) for the full statement.

## Development

```sh
npm run dev              # watch + hot reload (Chrome)
npm run dev:firefox      # watch + hot reload (Firefox)
npm test                 # unit tests (resolver + surface renderers)
npm run test:e2e         # real-browser checks against live GitHub pages
npm run compile          # TypeScript type check
```

The E2E suite loads the built extension into Chromium and verifies icons appear
on the repo table, sidebar tree, file finder, gists, and commit diffs, plus
light/dark theme recolor. Code-search and PR-files checks are skipped when the
session is signed out (GitHub does not render those for anonymous users).

### Architecture

```
entrypoints/github.content/   content script entry (injects the font-face + CSS)
src/observe.ts                batched DOM observer (works across GitHub's SPA navigation)
src/render.ts                 icon element creation + theme recolor
src/icons/                    generated Seti data + filename resolver
src/surfaces/                 one adapter per GitHub surface
scripts/update-seti-icons.mjs regenerates src/icons/* from upstream VS Code
scripts/e2e.mjs               browser E2E
```

Each surface adapter owns its selectors and filename extraction. When GitHub
changes markup, only the affected adapter needs updating.

### Updating the icon set

Icons come from VS Code's built-in `theme-seti` extension. Regenerate the
bundled data and font from a pinned upstream commit:

```sh
npm run update:seti            # uses the pinned commit in scripts/update-seti-icons.mjs
npm run update:seti <sha>      # or re-pin to a specific commit
```

The script downloads the font, association JSON, and license notices, verifies
them, and writes compact runtime data to `src/icons/seti-data.ts` and
`src/icons/seti-font.ts` (the font is embedded as base64). These generated
files are committed so builds are reproducible offline.

## License & credits

MIT. See [LICENSE](LICENSE).

- Icons and associations: [Seti UI](https://github.com/jesseweed/seti-ui) by
  Jesse Weed, distributed via Microsoft's
  [vscode-theme-seti](https://github.com/microsoft/vscode/tree/main/extensions/theme-seti)
  (MIT / Seti UI license). Third-party notices are in
  [`assets/third-party/`](assets/third-party/).
- Build tooling: [WXT](https://wxt.dev), [Vite](https://vitejs.dev),
  [Vitest](https://vitest.dev), [Playwright](https://playwright.dev).