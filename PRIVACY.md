# Privacy Policy

**File Icons for GitHub** does not collect, store, or transmit any personal
data. This extension:

- Runs only on `github.com` and `gist.github.com`.
- Reads the Document Object Model (DOM) of those pages to locate file names
  already visible to you, so it can render an icon before each file name.
  Nothing is collected, logged, or sent anywhere.
- Inserts a single decorative `<span>` element per file. The icons are drawn
  from a font that is bundled inside the extension package.
- Makes **no network requests**. The extension does not call any API, does not
  use analytics, does not load remote code, and has no background service
  worker.
- Has no access to your GitHub account, tokens, passwords, or private
  repository *contents* (it only sees file names already visible in the page
  DOM).

## Permissions

The extension requests **no API permissions** and no `host_permissions`. The
only way it runs on `github.com` and `gist.github.com` is via the
content-script `matches` declaration, which is required so the extension can
read and modify the page for the sole purpose of displaying icons. All
processing happens locally in your browser. The icon font is embedded as a
base64 data URI, so rendering needs no runtime fetch.

## Third-party content

The icon font and its file-type associations originate from the MIT-licensed
[Seti UI](https://github.com/jesseweed/seti-ui) theme and are distributed
through Microsoft's MIT-licensed
[vscode-theme-seti](https://github.com/microsoft/vscode/tree/main/extensions/theme-seti).
Third-party license notices are included in the repository under
[`assets/third-party/`](assets/third-party/).