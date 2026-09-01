# Security

## Reporting a vulnerability

Please report suspected security issues privately. Do **not** open a public
issue for vulnerabilities.

To report a security issue, contact the maintainers via a private channel
(e.g. GitHub's security advisory feature at
`https://github.com/<owner>/<repo>/security/advisories/new`) before disclosing
publicly.

## Security model

- The extension requests **no** API permissions and makes **no** network
  requests. All icon data and the font are bundled in the package.
- It only runs on `github.com` and `gist.github.com`.
- It only reads file names from the page DOM and inserts a decorative,
  inert `<span>` (no text, no events, `aria-hidden`).
- Renderers are isolated from the observer: a failure in one surface never
  breaks the page or other surfaces.
- Content-script code never uses `eval`, `innerHTML` with untrusted data, or
  remote resources.

## Dependency & supply-chain hygiene

- The Seti icon data is generated from a **pinned** upstream commit by
  `scripts/update-seti-icons.mjs`, which verifies the payload before writing
  generated files. Update it explicitly with `npm run update:seti`.
- The generated files are committed, so installs and builds are reproducible
  without network access.
- Review dependencies before adding any new one; keep them minimal.
- Run `npm audit` on CI.