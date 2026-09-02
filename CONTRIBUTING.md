# Contributing

Thanks for helping keep File Icons for GitHub working. The main maintenance
burden is GitHub's ever-changing DOM.

## How to contribute

1. Open an issue first for non-trivial changes so we can agree on direction.
2. Keep changes small and focused on a single surface.
3. Add or update tests.

## Conventions

- Each GitHub surface lives in its own adapter under `src/surfaces/`.
  A `renderX()` function is exported separately from its `initX()` wiring so
  it can be unit tested with a small DOM fixture.
- New surfaces are registered in `entrypoints/github.content/index.ts`.
- Selectors should target stable markers (stable class names, `aria-label`,
  `data-testid`) rather than hashed CSS-module suffixes where possible.
  When only hashed classes exist, use a substring attribute selector such as
  `[class*="diff-file-header"]` and add a fixture test.
- Icons must be decorative: `aria-hidden="true"`, no text, no events, and must
  never alter the file-name link or its accessible name.

## Testing

```sh
npm test          # unit tests (fast, no browser needed)
npm run test:e2e  # browser E2E against live GitHub pages
```

The E2E suite requires the bundled Chromium for the pinned Playwright version
(`~/Library/Caches/ms-playwright`). When GitHub markup changes, update the
affected adapter and its fixture, then run `npm run test:all`.

## Updating icons

Run `npm run update:seti` (see the README). Commit the regenerated files and
the `assets/third-party/` notices.

## Code of conduct

Be respectful and constructive. This project follows GitHub's
[Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines).