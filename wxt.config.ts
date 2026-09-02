import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'File Icons for GitHub',
    description:
      'Show VS Code Seti file icons on GitHub file listings, trees, the file finder, code search, gists, and diffs.',
    // The extension only reads/writes the DOM of GitHub pages. It makes no
    // network requests, accesses no user data, and needs no API permissions.
    // Page access is granted by the content_scripts.matches entry below; no
    // explicit host_permissions are required.
    permissions: [],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'dantecalderon.dev@gmail.com',
              data_collection_permissions: {
                required: ['none'],
              },
              strict_min_version: '115.0',
            },
          },
        }
      : {}),
  }),
});