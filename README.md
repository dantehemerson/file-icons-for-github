<h1 align="center">File Icons for GitHub</h1>

<p align="center">
  Bring the iconic VS Code <strong>Seti</strong> file icons to every GitHub page you use.
</p>

<p align="center">
  <em>Pretty pixels, zero network traffic, zero tracking.</em>
</p>

<br/>

<p align="center">
  <!-- Replace this placeholder with a real screenshot when ready -->
  <img src="docs/screenshot.png" alt="File Icons for GitHub screenshot" width="860" />
</p>

## ✨ Features

- 🔒 **Private by design** — runs entirely in your browser; nothing is collected, stored, or transmitted.
- 🛡️ **No permissions, no network** — zero `host_permissions`, no background service worker, no remote code.
- ⚡ **Lightweight & fast** — a single ~37 KB icon font embedded in the extension, no per-file image requests.
- 🎨 **True to VS Code** — the exact Seti icon set you already know from the editor, including theme-aware colors.
- 🧭 **Covers GitHub everywhere** — file listings, sidebar tree, file finder, code search, gists, and PR / commit diffs.
- 🌓 **Light & dark themes** — icons automatically recolor to match GitHub's light and dark modes.
- ♿ **Accessibility-friendly** — every icon is decorative (`aria-hidden`) and never alters the underlying file link or its accessible name.
- 🧱 **Manifest V3, modern build** — clean-room successor to `dderevjanik/github-vscode-icons` on top of [WXT](https://wxt.dev) + [Vite](https://vitejs.dev).

## 📦 Install

<p align="center">
  <a href="#" aria-label="Chrome Web Store">
    <img src="https://img.shields.io/badge/Chrome-Available_on_the_Chrome_Web_Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Available on the Chrome Web Store" />
  </a>
  &nbsp;&nbsp;
  <a href="#" aria-label="Firefox Add-ons">
    <img src="https://img.shields.io/badge/Firefox-Available_on_Firefox_Add--ons-FF7139?style=for-the-badge&logo=firefox&logoColor=white" alt="Available on Firefox Add-ons" />
  </a>
</p>

Want to try it right now? Load the unpacked build you produce locally — see [Development](#-development) below.

## 🔒 Privacy

The extension requests **no API permissions**, declares **no `host_permissions`**, and makes **no network requests**. All icons are rendered from a font that is embedded as a base64 data URI inside the package.

It only runs on `github.com` and `gist.github.com` (via the content-script `matches` declaration, which is the minimum needed to render icons next to file names).

The full statement lives in [PRIVACY.md](PRIVACY.md).

## 🛠️ Development

### Requirements

- [Node.js](https://nodejs.org) (see [`.node-version`](.node-version))
- npm (bundled with Node.js)

### Install dependencies

```sh
npm install
```

### Build

```sh
npm run build            # Chromium extension → .output/chrome-mv3
npm run build:firefox    # Firefox extension  → .output/firefox-mv3

npm run zip              # .output/chrome-mv3.zip  (store-ready archive)
npm run zip:firefox      # .output/firefox-mv3.zip (store-ready archive)
```

### Load the extension locally

- **Chromium / Edge / Brave:** `chrome://extensions` → enable *Developer mode* → *Load unpacked* → select `.output/chrome-mv3`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → select `.output/firefox-mv3/manifest.json`.

### Scripts

```sh
npm run dev              # watch + hot reload (Chrome)
npm run dev:firefox      # watch + hot reload (Firefox)
npm test                 # unit tests (resolver + surface renderers)
npm run test:e2e         # real-browser checks against live GitHub pages
npm run compile          # TypeScript type check
npm run test:all         # compile + unit tests + build + E2E
```

> The E2E suite needs the Playwright Chromium that matches the pinned Playwright version. Code-search and PR-files checks are skipped automatically when the GitHub session is anonymous.

### Project layout

```
entrypoints/github.content/   content script entry (injects the font-face + CSS)
src/observe.ts                batched DOM observer (works across GitHub's SPA navigation)
src/render.ts                 icon element creation + theme recolor
src/icons/                    generated Seti data + filename resolver
src/surfaces/                 one adapter per GitHub surface
scripts/update-seti-icons.mjs regenerates src/icons/* from upstream VS Code
scripts/e2e.mjs               browser E2E
```

Each surface adapter owns its selectors and filename extraction. When GitHub changes markup, only the affected adapter needs updating. See [AGENTS.md](AGENTS.md) for the architectural notes and contribution conventions.

## 🤝 Contributing

Bug reports and pull requests are welcome. For non-trivial changes, please open an issue first so we can agree on the direction.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution conventions.
- Read [AGENTS.md](AGENTS.md) for architecture, adapter rules, and regeneration steps.

## 🙏 Credits

- Icons and associations: [Seti UI](https://github.com/jesseweed/seti-ui) by Jesse Weed, distributed via Microsoft's [vscode-theme-seti](https://github.com/microsoft/vscode/tree/main/extensions/theme-seti) (MIT / Seti UI license). Third-party notices live in [`assets/third-party/`](assets/third-party/).
- Build tooling: [WXT](https://wxt.dev), [Vite](https://vitejs.dev), [Vitest](https://vitest.dev), [Playwright](https://playwright.dev).
- Inspired by the now-abandoned [`dderevjanik/github-vscode-icons`](https://github.com/dderevjanik/github-vscode-icons).

## 📄 License

Released under the [MIT License](LICENSE).
