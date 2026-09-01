import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'Seti Icons for GitHub',
    description:
      'Show VS Code Seti file icons on GitHub file listings, trees, the file finder, code search, gists, and diffs.',
    // The extension only reads/writes the DOM of GitHub pages. It makes no
    // network requests, accesses no user data, and needs no API permissions.
    host_permissions: ['https://github.com/*', 'https://gist.github.com/*'],
  },
});